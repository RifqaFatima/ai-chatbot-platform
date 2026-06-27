import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(
  req: Request,
  context: {
    params: Promise<{
      id: string
      fileName: string
    }>
  }
) {
    const { id, fileName } = await context.params
    const session = await getServerSession(authOptions)

    if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const chatbot = await db.chatbot.findUnique({
    where: { id: id },
    })

    if (!chatbot || chatbot.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const decodedFileName = decodeURIComponent(fileName)

    await db.knowledgeBase.deleteMany({
        where: {
        chatbotId: id,
        fileName: decodedFileName,
        },
    })

    return NextResponse.json({ message: "File deleted" })
}