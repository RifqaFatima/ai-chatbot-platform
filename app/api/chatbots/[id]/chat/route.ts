import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { processChatMessage } from "@/lib/process-chat-message"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, history } = await req.json()

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const aiResponse = await processChatMessage(
      params.id,
      session.user.id,
      message,
      history || []
    )

    return NextResponse.json({ response: aiResponse })
  } catch (error: any) {
    console.error("Chat error:", error)
    const status = error.message === "Quota exceeded" ? 429 : 500
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status }
    )
  }
}