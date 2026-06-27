//AI-abstraction layer: last step of RAG pipeline where context+message actually gets sent to AI model
import { GoogleGenerativeAI } from "@google/generative-ai"
import { db } from "./db"

type HistoryItem = {
    role: "user"|"model"
    parts: { text: string }[] 
}

type AIConfig = {
    provider: string
    model: string
    temperature: number
    maxTokens: number
}

async function getActiveConfig(): Promise<AIConfig> {

    const config = await db.aIConfig.findFirst({
        where: {isActive: true},
    })

    if(!config){
        return {
            provider: "gemini",
            model: "gemini-1.5-flash",
            temperature: 0.7,
            maxTokens: 1000,
        }
    }
    return config
}

async function callGemini(
    message: string,
    context: string,
    history: HistoryItem[],
    config: AIConfig
): Promise<string> {

    //create gemini client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

    const model = genAI.getGenerativeModel({
        model: config.model,
        generationConfig: {
            temperature: config.temperature,
            maxOutputTokens: config.maxTokens,
        },
    })

    const systemPrompt = context
    ? `You are a helpful assistant. Use the following information to answer questions. If the answer isn't in the provided information, say so honestly.\n\nContext:\n${context}`
        : "You are a helpful assistant."

    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: systemPrompt }],
            },
            {
                role: "model",
                parts: [{ text: "Understood. I will help based on the provided context." }]
            },
            ...history,
        ],
    })

    const result = await chat.sendMessage(message)
    const response = await result.response
    return response.text()
}

//Gemini expects: SDK, startChat(), sendMessage()
//OpenRouter expects: HTTP request(fetch), JSON body, OpenAI- style message formata
async function callOpenRouter(
    message: string,
    context: string,
    history: HistoryItem[],
    config: AIConfig
): Promise<string> {
    
    const systemPrompt = context
    ? `You are a helpful assistant. Use the following information to answer questions. If the answer isn't in the provided information, say so honestly.\n\nContext:\n${context}`
    : "You are a helpful assistant."

    //1. Format messages to : role: "user"|"assistant"   content: "text"
    const formattedHistory = history.map((h) => ({
        role: h.role==="model" ? "assistant" : "user",
        content: h.parts[0].text,
    }))

    const messages=[
        { role: "system", content: systemPrompt },
        ...formattedHistory,
        { role: "user", content: message },
    ]

    //OpenRouter API call
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        },
        body: JSON.stringify({
            model: config.model,
            messages,
            temperature: config.temperature,
            max_tokens: config.maxTokens,
        }),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenRouter error: ${error}`)
    }

    const data = await response.json()
    return data.choices[0].message.content


}

export async function getAIResponse(
    message: string,
    context: string = "",
    history: HistoryItem[] = []

): Promise<string> {
    const config = await getActiveConfig()

    switch(config.provider) {
        case "gemini":
            return callGemini(message, context, history, config)
        case "openrouter":
            return callOpenRouter(message, context, history, config)
        default:
            throw new Error(`Unknown AI provider: ${config.provider}`)
    }

}
