import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if(!session) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    const chatbot = await db.chatbot.findUnique({
        where: { id: id },
    })

    if (!chatbot || chatbot.userId !== session.user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const messages = await db.message.findMany({
    where: { chatbotId: id },
    orderBy: { createdAt: "asc" },
    take: 50, //limits to last 50 messages
    })

    return NextResponse.json(messages)
}