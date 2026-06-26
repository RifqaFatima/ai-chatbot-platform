import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
    const session = await getServerSession(authOptions)

    if(!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const config = await db.aIConfig.findFirst({
        where: { isActive: true },
    })

    return NextResponse.json(config)
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { provider, model, temperature, maxTokens } = body

    const existing = await db.aIConfig.findFirst({
        where: { isActive: true },
    })

    let config

    if(existing) {
        config = await db.aIConfig.update({
            where: { id: existing.id },
            data: {
                provider: provider ?? existing.provider,
                model: model ?? existing.model,
                temperature: temperature ?? existing.temperature,
                maxTokens: maxTokens ?? existing.maxTokens,
            },
        })
    } else {
        config = await db.aIConfig.create({
            data: { provider, model, temperature, maxTokens },
        })
    }

    return NextResponse.json(config)
}