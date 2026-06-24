import { db } from "@/lib/db"
import { getChatResponse} from "@/lib/gemini"

type HistoryItem = {
    role: "user" | "model"
    parts: { text: string}[]
}

export async function processWidgetMessage(
    chatbotId: string,
    message: string,
    history: HistoryItem[] = []

) {
    const chatbot = await db.chatbot.findUnique({
        where: {id: chatbotId}
    })

    if(!chatbot) {
        throw new Error("Chatbot not found")
    }

    //check the chatbot owner's quota (visitor's share the owner's quota)
    const { getQuotaUsage, incrementQuotaUsage } = await import("./quota")

    const quota = await getQuotaUsage(chatbot.userId)

    if (quota.used >= quota.limit) {
        throw new Error("This chatbot is currently unavailable")
    }

    const allChunks = await db.knowledgeBase.findMany({
        where: { chatbotId },
    })

    const queryWords = message
    .toLowerCase()
    .split(/\s+/)
    .filter((w: string) => w.length > 3)

    const scoredChunks = allChunks.map((chunk) => {
        const lowerChunk = chunk.chunkText.toLowerCase()
        const score = queryWords.filter((word: string) =>
        lowerChunk.includes(word)).length
        return { chunk, score }
    })

     const relevantChunks = scoredChunks
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((c) => c.chunk.chunkText)

    const context = relevantChunks.join("\n\n")

    const aiResponse = await getChatResponse(message, context, history)

    await db.message.create({
        data: { chatbotId, content: message, role: "user" },
    })

    await db.message.create({
        data: { chatbotId, content: aiResponse, role: "assistant" },
    })

    await incrementQuotaUsage(chatbot.userId)

    return aiResponse
}