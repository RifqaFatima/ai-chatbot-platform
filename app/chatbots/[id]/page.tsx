import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import { Navbar } from "@/components/navbar"
import { ChatInterface } from "@/components/chat/chat-interface"
import { KnowledgeBaseUpload } from "@/components/chat/knowledge-base-upload"
import { WidgetSettings } from "@/components/chat/widget-settings"

export default async function ChatbotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  //If user not logged in, redirect
  if (!session) {
    redirect("/login")
  }

  //Safety check for params
  const { id } = await params

  if (!id) {
    notFound()
  }

  //Fetch chatbot safely
  const chatbot = await db.chatbot.findUnique({
    where: { id },
  })

  //Validate ownership + existence
  if (!chatbot || chatbot.userId !== session.user.id) {
    notFound()
  }

  return (
    <div>
      <Navbar />

      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{chatbot.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            ID: {chatbot.id}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ChatInterface chatbotId={chatbot.id} />
          </div>

          <div className="space-y-6">
            <KnowledgeBaseUpload chatbotId={chatbot.id} />

            <WidgetSettings
              chatbotId={chatbot.id}
              initialDomains={chatbot.allowedDomains}
            />
          </div>
        </div>
      </div>
    </div>
  )
}