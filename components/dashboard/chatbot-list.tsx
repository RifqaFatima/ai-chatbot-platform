"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

type Chatbot = {
    id: string
    name: string
    createdAt: Date
}

export function ChatbotList({ chatbots }: { chatbots: Chatbot[] }) {
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [targetId, setTargetId] = useState<string | null>(null)

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()
        setTargetId(id)
        setConfirmOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!targetId) return

        setDeletingId(targetId)
        setConfirmOpen(false)

        await fetch(`/api/chatbots/${targetId}`, { method: "DELETE" })

        setDeletingId(null)
        setTargetId(null)
        router.refresh()
    }

    if (chatbots.length === 0) {
    return (
        <div className="text-center text-gray-500 mt-12">
            <p>You don't have any chatbots yet.</p>
            <p className="text-sm">Click "+ New Chatbot" to create your first one.</p>
        </div>
    )
    }

    return (
    <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {chatbots.map((bot) => (
            <Link key={bot.id} href={`/chatbots/${bot.id}`}>
            <Card className="hover:shadow-md transition cursor-pointer relative">
                <CardHeader>
                <CardTitle className="text-lg pr-8">{bot.name}</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-xs text-gray-500">
                    Created {new Date(bot.createdAt).toLocaleDateString()}
                </p>
                </CardContent>
                <button
                onClick={(e) => handleDeleteClick(e, bot.id)}
                disabled={deletingId === bot.id}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg leading-none"
                title="Delete chatbot"
                >
                ×
                </button>
            </Card>
            </Link>
        ))}
        </div>

        <ConfirmDialog
        open={confirmOpen}
        title="Delete chatbot?"
        description="This will permanently delete the chatbot, all its messages, and its entire knowledge base. This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => {
            setConfirmOpen(false)
            setTargetId(null)
        }}
        />
    </>
    )
}