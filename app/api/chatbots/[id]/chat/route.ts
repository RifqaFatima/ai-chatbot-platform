import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getChatResponse } from "@/lib/gemini"

export async function POST (
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try{
        const session = await getServerSession(authOptions)

        if(!session) {
            return NextResponse.json({ error: "Unauthorized"}, { status: 401 })
        }

        const { id } = await params

        const chatbot = await db.chatbot.findUnique({
            where: { id},
        })

        //if chatbot doesnt exist or belongs to someone else
        if(!chatbot || chatbot.userId !== session.user.id) {
            return NextResponse.json({ error: "Not found"}, {status: 404})
        }

        //read json sent by frontend
        const { message, history } = await req.json()

        if(!message || message.trim().length ===0) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 })
        }

        //check quota
        const user = await db.user.findUnique({
            where: { id: session.user.id},
        })

        if(user && user.quotaUsed >= user.quotaLimit) {
            return NextResponse.json(
                { error: "Quota exceeded. Please contact admin"},
                {status: 429}
            )
        }

        //fetch knowledge base for this chatbot
        const knowledge = await db.knowledgeBase.findMany({
            where: { chatbotId:id },
        })

        const context = knowledge.map((k) => k.rawText).join("\n\n")

        //Get AI response
        const aiResponse = await getChatResponse(message, context, history || [])

        //save user message
        await db.message.create({
            data: {
                chatbotId: id,
                content: message,
                role: "user",
            },
        })

        //save AI response
        await db.message.create({
            data: {
                chatbotId: id,
                content: aiResponse,
                role: "assistant",

            },
        })

        //Increment quota
        await db.user.update({
            where: { id: session.user.id},
            data: {quotaUsed: {increment: 1}},
        })

        return NextResponse.json({ response: aiResponse })

    }
    catch(error) {
        console.error("Chat error:", error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}