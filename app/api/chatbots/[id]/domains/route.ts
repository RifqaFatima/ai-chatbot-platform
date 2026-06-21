import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const {id} = await params

  if (!id) {
    return NextResponse.json({ error: "Missing chatbot id" }, { status: 400 })
  }

  const chatbot = await db.chatbot.findUnique({
    where: { id },
  })

  if (!chatbot || chatbot.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { domains } = await req.json()

  if (!Array.isArray(domains)) {
    return NextResponse.json(
      { error: "domains must be an array" },
      { status: 400 }
    )
  }

  const cleaned = domains
    .map((d: string) => d.trim().toLowerCase())
    .filter((d: string) => d.length > 0)

  const updated = await db.chatbot.update({
    where: { id },
    data: { allowedDomains: cleaned },
  })

  return NextResponse.json(updated)
}