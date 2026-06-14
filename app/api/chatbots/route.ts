import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

//POST: Create chatbot
export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if(!session) {
        return NextResponse.json(
            { error: "Unauthorized"},
            { status: 401 }
        )
    }

    const { name }= await req.json()
    if(!name || name.trim().length === 0){
        return NextResponse.json(
            { error: "Name is required"},
            { status: 400 }
        )
    }

    //create chatbot in db
    const chatbot = await db.chatbot.create({
        data: {
            name, 
            userId: session.user.id,
            allowedDomains: [],
        },

    })
    return NextResponse.json(chatbot, { status: 201})
}

//fetch all the chatbots belonging to a user.
export async function GET() {
    const session = await getServerSession(authOptions)

    if(!session) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    const chatbots = await db.chatbot.findMany({
        where: {userId: session.user.id},
        orderBy: { createdAt: "desc"},
    })

    return NextResponse.json(chatbots)
}