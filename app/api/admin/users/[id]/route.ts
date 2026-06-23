import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const { id } = await context.params
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { role, quotaLimit, quotaUsed } = body

  const data: any = {}

  if (role !== undefined) {
    if (role !== "ADMIN" && role !== "USER") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }
    data.role = role
  }

  if (quotaLimit !== undefined) {
    if (typeof quotaLimit !== "number" || quotaLimit < 0) {
      return NextResponse.json({ error: "Invalid quotaLimit" }, { status: 400 })
    }
    data.quotaLimit = quotaLimit
  }

  if (quotaUsed !== undefined) {
    if (typeof quotaUsed !== "number" || quotaUsed < 0) {
      return NextResponse.json({ error: "Invalid quotaUsed" }, { status: 400 })
    }
    data.quotaUsed = quotaUsed
  }

  const updated = await db.user.update({
    where: { id },
    data,
  })

  return NextResponse.json(updated)
}