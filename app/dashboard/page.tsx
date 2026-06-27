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

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { quotaUsed: true, quotaLimit: true },
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
        {user && (
          <div className="mt-4 p-3 bg-gray-50 border rounded-lg inline-flex items-center gap-3">
            <div>
              <p className="text-xs text-gray-500">Messages used this period</p>
              <p className="text-sm font-semibold">
                {user.quotaUsed}
                <span className="text-gray-400 font-normal"> / {user.quotaLimit}</span>
              </p>
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{
                  width: `${Math.min(
                    (user.quotaUsed / user.quotaLimit) * 100,
                    100
                  )}%`,
                }}
              />
            </div>

          </div>
        )}


        <ChatbotList chatbots={chatbots} />
      </div>
    </div>
  )
}