"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AIConfig = {
  provider: string
  model: string
  temperature: number
  maxTokens: number
}

const PROVIDER_MODELS: Record<string, string[]> = {
  gemini: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"],
  openrouter: [
    "openai/gpt-4o-mini",
    "openai/gpt-4o",
    "anthropic/claude-3-haiku",
    "mistralai/mistral-7b-instruct",
    "meta-llama/llama-3-8b-instruct",
  ],
}

export function AIConfigPanel({ initialConfig }: { initialConfig: AIConfig }) {
  const [config, setConfig] = useState<AIConfig>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const save = async () => {
    setSaving(true)
    setMessage("")

    const res = await fetch("/api/admin/ai-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    })

    if (res.ok) {
      setMessage("Saved successfully")
    } else {
      setMessage("Failed to save")
    }

    setSaving(false)
  }

  const handleProviderChange = (provider: string) => {
    const defaultModel = PROVIDER_MODELS[provider]?.[0] || ""
    setConfig((prev) => ({ ...prev, provider, model: defaultModel }))
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-lg">AI Model Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label>Provider</Label>
          <div className="flex gap-2">
            {["gemini", "openrouter"].map((p) => (
              <button
                key={p}
                onClick={() => handleProviderChange(p)}
                className={`px-4 py-2 rounded text-sm border ${
                  config.provider === p
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {p === "gemini" ? "Google Gemini" : "OpenRouter"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <Label>Model</Label>
          <select
            value={config.model}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, model: e.target.value }))
            }
            className="w-full border rounded px-3 py-2 text-sm"
          >
            {(PROVIDER_MODELS[config.provider] || []).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Temperature (0–1)</Label>
            <Input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={config.temperature}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  temperature: parseFloat(e.target.value),
                }))
              }
            />
            <p className="text-xs text-gray-400">
              Lower = more focused. Higher = more creative.
            </p>
          </div>

          <div className="space-y-1">
            <Label>Max Tokens</Label>
            <Input
              type="number"
              min={100}
              max={4000}
              step={100}
              value={config.maxTokens}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  maxTokens: parseInt(e.target.value),
                }))
              }
            />
            <p className="text-xs text-gray-400">
              Max length of AI response.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
          {message && (
            <p className="text-sm text-gray-500">{message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}