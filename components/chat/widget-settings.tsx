"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
    chatbotId: string
    initialDomains: string[]
}

export function WidgetSettings({ chatbotId, initialDomains }: Props) {
    const [domains, setDomains] = useState<string[]>(initialDomains)
    const [newDomain, setNewDomain] = useState("")
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")
    const [copied, setCopied] = useState(false)

    const serverUrl = process.env.NEXT_PUBLIC_APP_URL

    const embedCode = `<script
    src="${serverUrl}/widget.js"
    data-chatbot-id="${chatbotId}"
    data-server-url="${serverUrl}">
    </script>`

    const saveDomains = async (updated: string[]) => {
        setSaving(true)
        setMessage("")

        const res = await fetch(`/api/chatbots/${chatbotId}/domains`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ domains: updated })
        })

        if(res.ok) {
            setDomains(updated)
            setMessage("Saved")
        } else{
            setMessage("Failed to save")
        }

        setSaving(false)
    }

    const addDomain = () => {
        const trimmed = newDomain.trim().toLowerCase()

        if(!trimmed || domains.includes(trimmed)) return

        const updated = [...domains, trimmed]

        saveDomains(updated)
        setNewDomain("")
    }

    const removeDomain = (domain: string) => {
        const updated = domains.filter((d) => d!==domain)
        saveDomains(updated)
    }

    const copyEmbed = () => {
        navigator.clipboard.writeText(embedCode)
        setCopied(true)
        setTimeout(()=> setCopied(false), 2000)

    }

    return (
        <div className="border rounded-lg p-4 space-y-4">
            <div>
                <h3 className="font-semibold text-sm mb-2">Allowed Domains</h3>
                <p className="text-xs text-gray-500 mb-3">
                    Leave empty to allow any domain (not recommended for production).
                    Enter just the hostname, e.g. <code>example.com</code>
                </p>

                <div className="flex gap-2">

                    <Input
                    placeholder="example.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addDomain()}
                    />
                    <Button size="sm" onClick={addDomain} disabled={saving}>Add</Button>

                </div>

                {message && <p className="text-xs text-gray-500 mt-1">{message}</p>}

                <div className="mt-3 space-y-1">
                    {domains.length === 0 && (
                        <p className="text-xs text-gray-400">No restrictions set</p>
                    )}

                    {domains.map((d)=> (
                        <div
                        key={d}
                        className="text-xs flex items-center justify-between bg-gray-50 px-2 py-1 rounded"
                        >
                            <span>{d}</span>
                            <button onClick={() => removeDomain(d)}
                                className="text-red-500 hover:text-red-700">
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <Label className="text-xs font-semibold">Embed Code</Label>
                <pre className="bg-gray-900 text-gray-100 text-xs p-3 rounded mt-1 overflow-x-auto">
                    {embedCode}
                </pre>
                <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={copyEmbed}>
                    {copied ? "Copied!": "Copy embed code"}
                </Button>
            </div>
        </div>
    )

}