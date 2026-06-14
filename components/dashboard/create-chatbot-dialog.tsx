"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

export function CreateChatbotDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Name is required")
      return
    }

    setLoading(true)
    setError("")

    const res = await fetch("/api/chatbots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Something went wrong")
      setLoading(false)
      return
    }

    setName("")
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <Dialog open ={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button>+ New Chatbot</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create a new chatbot</DialogTitle>
            </DialogHeader>

            <div className="space-y-2">
                <Label htmlFor="chatbot-name">
                    Chatbot Name
                </Label>
                <Input 
                id="chatbot-name"
                placeholder="e.g. Support Bot"
                value={name}
                onChange={(e) => setName(e.target.value)}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <DialogFooter>
                <Button onClick={handleCreate} disabled={loading}>
                    {loading ? "Creating...":"Create"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>


  )
}