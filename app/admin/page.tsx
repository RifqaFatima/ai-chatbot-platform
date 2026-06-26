import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Navbar } from "@/components/navbar"
import { UserRow } from "@/components/admin/user-row"
import { StatsCards } from "@/components/admin/stats-cards"
import { AIConfigPanel } from "@/components/admin/ai-config-panel"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
  })

  const totalUsers = await db.user.count()
  const totalChatbots = await db.chatbot.count()
  const totalMessages = await db.message.count()
  const quotaAgg = await db.user.aggregate({
    _sum: { quotaUsed: true },
  })

  const aiConfig = await db.aIConfig.findFirst({
    where: { isActive: true},

  }) || {
    provider: "gemini",
    model: "gemini-1.5-flash",
    temperature: 0.7,
    maxTokens: 1000,
  }

  const stats = {
    totalUsers,
    totalChatbots,
    totalMessages,
    totalQuotaUsed: quotaAgg._sum.quotaUsed || 0,
  }

  return (
    <div>
      <Navbar />
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
        <p className="text-gray-600 mb-6">Logged in as: {session.user.email}</p>

        <StatsCards stats={stats} />

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">All Users</h2>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Quota</th>
                <th className="p-2 border">Joined</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={{
                    ...user,
                    createdAt: user.createdAt.toISOString(),
                  }}
                />
              ))}
            </tbody>
          </table>
          <AIConfigPanel initialConfig={aiConfig} />
        </div>
      </div>
    </div>
  )
}