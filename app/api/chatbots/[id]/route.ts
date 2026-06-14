import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

//fetch single chatbot
export async function GET(
    req: Request,
    {params} : { params: {id: string}} //extract dynamic route parameters from URL
){
    const session = await getServerSession(authOptions)

    if(!session) {
        return NextResponse.json({ error: "Unauthorized"}, {status:401})
    }

    const chatbot = await db.chatbot.findUnique({
        where: { id: params.id},
    })

    if(!chatbot || chatbot.userId !== session.user.id) {
        return NextResponse.json({ error: "Not Found"}, {status: 404})
    }

    return NextResponse.json(chatbot)
}

export async function PATCH (
    req: Request,
    { params }: { params: {id: string}}
){
    const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const chatbot = await db.chatbot.findUnique({
    where: {id: params.id},
  })

  if(!chatbot || chatbot.userId!==session.user.id){
    return NextResponse.json({ error: "Not Found"}, {status: 404})
  }

  const body = await req.json()

  const updated = await db.chatbot.update({
    where: { id: params.id },
    data: {
        name: body.name ?? chatbot.name,
        allowedDomains: body.allowedDomains ?? chatbot.allowedDomains,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
    req: Request,
    { params }: { params: {id: string}}
) {
    const session = await getServerSession(authOptions)

    if(!session) {
        return NextResponse.json({ error: "Unauthorized"}, {status: 401})
    }
    const chatbot = await db.chatbot.findUnique({
        where: {id: params.id},
    })

    if(!chatbot || chatbot.userId !== session.user.id) {
        return NextResponse.json({error: "not Found"}, {status: 404})
    }

     await db.chatbot.delete({ where: { id: params.id } })

    return NextResponse.json({ message: "Deleted" })
}