import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
    redirect("/login")
    }


  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-600 mt-2">
        Welcome, {session.user.name || session.user.email}
      </p>
      <p className="text-sm text-gray-400 mt-1">
        Role: {session.user.role}
      </p>
    </div>
  )
}