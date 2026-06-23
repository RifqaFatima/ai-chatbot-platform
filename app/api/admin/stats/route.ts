import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
    const session = await getServerSession(authOptions)

    if(!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const totalUsers = await db.user.count()
    const totalChatbots = await db.chatbot.count()
    const totalMessages = await db.message.count()

    //calculate total of all users' quotaUsed values
    const quotaAgg = await db.user.aggregate({
        _sum: {quotaUsed: true},
    })

    const topUsers = await db.user.findMany({
        orderBy: { quotaUsed: "desc"},
        take: 5,
        select: {name: true, email: true, quotaUsed: true, quotaLimit: true},
    })

    return NextResponse.json({
    totalUsers,
    totalChatbots,
    totalMessages,
    totalQuotaUsed: quotaAgg._sum.quotaUsed || 0,
    topUsers,
  })
}