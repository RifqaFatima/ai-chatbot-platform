"use client"

import { useState, useRef, useEffect } from 'react'
import {Button} from '@/components/ui/button'
import { Input } from '@/components/ui/input'

//shape of a single chat message
type Message = {
    role: "user" | "assistant"
    content: string
}

export function ChatInterface({ chatbotId } : { chatbotId:string }) {
    //stores entire convo
    const [messages, setMessages] = useState<Message[]>([])

    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    //whenever messages change, scroll to bottom
    useEffect(()=> {
        bottomRef.current?.scrollIntoView({ behavior: "smooth"})
    }, [messages])

    const sendMessage = async() => {

        //dont send empty msg or if alr waiting for a response
        if(!input.trim() || loading) return

        const userMessage: Message = {
            role: "user",
            content: input,
        }
        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)
        setInput("")
        setLoading(true)

        try{
            //Build gemini-compatible chat history
            const history = updatedMessages.slice(0, -1).map((m)=> ({
                    role: m.role === "user"? "user": "model",
                    parts: [{ text: m.content}],
            }))

            //send req to our api route
            const res = await fetch (`/api/chatbots/${chatbotId}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                //send latest message + chat history
                body: JSON.stringify({
                    message: input,
                    history,
                }),
            })

            const data = await res.json()

            //API responded with error:
            if(!res.ok) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: data.error || "Something went wrong",
                    },
                ])
                return
            }

            //API succeeded
            setMessages((prev) => [
                ...prev, 
                {
                    role: "assistant",
                    content: data.response,
                },
            ])
        } catch(error){
            //network/server crash
            setMessages((prev) => [
                ...prev,
                {
                     role: "assistant",
                    content: "Failed to get response. Try again.",
                }
            ])
        } finally {
            setLoading(false)
        }
    }

    //send message when enter is pressed
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if(e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden">
            {/*  Message Area  */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-20">
                        <p className="text-lg">Start a conversation</p>
                        <p className="text-sm">Ask anything — or upload documents first for context-aware answers</p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div 
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end":"justify-start"}`}>
                        <div className={`max-w-[75%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${
                            msg.role === "user" ? "bg-blue-500 text-white" : "bg-white border text-gray-800"
                        }`}> {msg.content}

                        </div>
                    </div>
                        
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border rounded-lg px-4 py-2 text-sm text-gray-500">
                            Thinking...
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />

            </div>

            {/* Input Area */}

            <div className="border-t p-3 flex gap-2 bg-white">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={loading}
                    className="flex-1"
                />
                <Button onClick={sendMessage} disabled={loading || !input.trim()}>
                    {loading ? "..." : "Send"}
                </Button>
            </div>
           

        </div>

    )
}