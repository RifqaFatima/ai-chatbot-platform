"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type User = {
  id: string
  name: string | null
  email: string
  role: "USER" | "ADMIN"
  quotaLimit: number
  quotaUsed: number
  createdAt: string
}

export function UserRow({ user }: { user: User }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [quotaLimit, setQuotaLimit] = useState(user.quotaLimit)
  const [saving, setSaving] = useState(false)

  const toggleRole = async () => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN"
    setSaving(true)

    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    })

    setSaving(false)
    router.refresh()
  }

  const saveQuota = async () => {
    setSaving(true)

    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quotaLimit }),
    })

    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  const resetQuota = async () => {
    setSaving(true)

    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quotaUsed: 0 }),
    })

    setSaving(false)
    router.refresh()
  }

  return (
    <tr>
      <td className="p-2 border">{user.name || "—"}</td>
      <td className="p-2 border">{user.email}</td>
      <td className="p-2 border">
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            user.role === "ADMIN"
              ? "bg-purple-100 text-purple-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {user.role}
        </span>
      </td>
      <td className="p-2 border">
        {editing ? (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={quotaLimit}
              onChange={(e) => setQuotaLimit(Number(e.target.value))}
              className="w-20 h-7 text-xs"
            />
            <span className="text-xs">/ {user.quotaUsed} used</span>
          </div>
        ) : (
          <span className="text-xs">
            {user.quotaUsed} / {user.quotaLimit}
          </span>
        )}
      </td>
      <td className="p-2 border text-xs">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="p-2 border">
        <div className="flex gap-1 flex-wrap">
          {editing ? (
            <Button size="sm" onClick={saveQuota} disabled={saving}>
              Save
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
              disabled={saving}
            >
              Edit Quota
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={resetQuota}
            disabled={saving}
          >
            Reset Usage
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={toggleRole}
            disabled={saving}
          >
            {user.role === "ADMIN" ? "Demote" : "Promote"}
          </Button>
        </div>
      </td>
    </tr>
  )
}