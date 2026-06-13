"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <nav className="border-b px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="font-bold">
          ChatPlatform
        </Link>
        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-black">
          Dashboard
        </Link>
        {session.user.role === "ADMIN" && (
          <Link href="/admin" className="text-sm text-gray-600 hover:text-black">
            Admin
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{session.user.email}</span>
        <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
          Sign out
        </Button>
      </div>
    </nav>
  )
}