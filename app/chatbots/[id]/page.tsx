import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import { Navbar } from "@/components/navbar"
import { ChatInterface } from "@/components/chat/chat-interface"

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
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{chatbot.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            ID: {chatbot.id}
          </p>
        </div>

        <ChatInterface chatbotId={chatbot.id} />
      </div>
    </div>
  )
}