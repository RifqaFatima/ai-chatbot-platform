import { PrismaClient } from "@prisma/client"

//create a global type to prevent more than one connections due to hot reloading
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db
}