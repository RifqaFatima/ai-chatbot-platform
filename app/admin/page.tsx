import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Navbar } from "@/components/navbar"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
    <Navbar />
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <p className="text-gray-600 mt-2">
        Logged in as: {session?.user.email}
      </p>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">All Users</h2>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Quota Used</th>
              <th className="p-2 border">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="p-2 border">{user.name || "—"}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border">{user.role}</td>
                <td className="p-2 border">
                  {user.quotaUsed} / {user.quotaLimit}
                </td>
                <td className="p-2 border">
                  {user.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  )
}