import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  const existing = await db.aIConfig.findFirst()

  if (!existing) {
    await db.aIConfig.create({
      data: {
        provider: "gemini",
        model: "gemini-1.5-flash",
        temperature: 0.7,
        maxTokens: 1000,
        isActive: true,
      },
    })
    console.log("Default AI config seeded")
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())