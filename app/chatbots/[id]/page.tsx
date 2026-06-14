import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import { Navbar } from "@/components/navbar"

export default async function ChatbotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  console.log("id =", id)

  const chatbot = await db.chatbot.findUnique({
    where: { id },
  })

  if (!chatbot || chatbot.userId !== session.user.id) {
    notFound()
  }

  return (
    <div>
      <Navbar />

      <div className="p-8">
        <h1 className="text-2xl font-bold">
          {chatbot.name}
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          ID: {chatbot.id}
        </p>

        <div className="mt-8 border rounded-lg p-6 text-gray-400 text-center">
          Chat interface coming tomorrow (Day 5–6)
        </div>
      </div>
    </div>
  )
}