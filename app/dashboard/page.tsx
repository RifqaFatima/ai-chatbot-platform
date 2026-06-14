import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Navbar } from "@/components/navbar"
import { CreateChatbotDialog } from "@/components/dashboard/create-chatbot-dialog"
import { ChatbotList } from "@/components/dashboard/chatbot-list"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const chatbots = await db.chatbot.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <Navbar />
      <div className="p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Chatbots</h1>
            <p className="text-gray-600 mt-1">
              Welcome, {session.user.name || session.user.email}
            </p>
          </div>
          <CreateChatbotDialog />
        </div>

        <ChatbotList chatbots={chatbots} />
      </div>
    </div>
  )
}