import { db } from "@/lib/db"
import { getChatResponse } from "@/lib/gemini"

type HistoryItem = {
    role: "user" | "model"
    parts: { text: string}[]
}

export async function processChatMessage(
    chatbotId: string,
    userId: string,
    message: string,
    history: HistoryItem[] = []
) {
    //find chatbot
    const chatbot = await db.chatbot.findUnique({
        where: { id: chatbotId },
    })

    if(!chatbot) {
        throw new ErrorEvent("Chatbot not found")
    }

    //find user
    const user = await db.user.findUnique({
        where: {id: userId}
    })

    //check quota
    if(user && user.quotaUsed >= user.quotaLimit) {
        throw new Error("Quota Exceeded")
    }

    //get knowlegde base chunks
    const allChunks = await db.knowledgeBase.findMany({
        where: { chatbotId }, 
    })

    //process user query-> break to lowercase string of words(len>3)
    const queryWords  = message
    .toLowerCase()
    .split(/\s+/)
    .filter((w: string) => w.length > 3)

    //score chunks
    const scoredChunks = allChunks.map((chunk) => {
        const lowerChunk = chunk.chunkText.toLowerCase()
        const score = queryWords.filter((word: string) => 
            lowerChunk.includes(word)
        ).length
        return { chunk, score }
    })

    //pick best chunks
    const relevantChunks = scoredChunks
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0,5)
    .map((c) => c.chunk.chunkText)

    //build cotext
    const context = relevantChunks.join("\n\n")

    //ask gemini
    const aiResponse = await getChatResponse(
        message,
        context,
        history
    )

    //save user message
    await db.message.create({
        data: {
            chatbotId,
            content: message,
            role: "user"
        }
    })

    //save AI response
    await db.message.create({
        data: {
            chatbotId,
            content: aiResponse,
            role: "assistant",
        },
    })

    //increment quota
    await db.user.update({
        where: {id: userId},
        data: {quotaUsed: {increment: 1}},
    })
    return aiResponse

}

