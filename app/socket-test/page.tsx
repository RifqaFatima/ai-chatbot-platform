"use client"

import { useEffect, useState } from "react"
import { getSocket } from "@/lib/socket"
import { Button } from "@/components/ui/button"
 
export default function SocketTestPage() {
    const [connected, setConnected] = useState(false)
    const [messages, setMessages] = useState<string[]>([])

    useEffect(() => {
        const socket = getSocket()

        //listening for connection(runs when browser connects to socket.io server)
        socket.on("connect", ()=>{
            setConnected(true)
            setMessages((prev) => [...prev, "Connected to server"])
        } )

        socket.on("pong_client", (data) => {
            setMessages((prev) => [...prev, `Server says: ${data.message}`])
        })

        socket.on("disconnect", () => {
            setConnected(false)
            setMessages((prev) => [...prev, "Disconnected"])
        })

        return () => {
        socket.off("connect")
        socket.off("pong_client")
        socket.off("disconnect")
        }

    }, [])

    const sendPing = () => {
        const socket = getSocket()
        socket.emit("ping_server", { message: "Hello from client!" })
         setMessages((prev) => [...prev, "Sent: Hello from client!"])
    }

    return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Socket.IO Test</h1>
      <p className="mt-2">
        Status:{" "}
        <span className={connected ? "text-green-600" : "text-red-600"}>
          {connected ? "Connected" : "Disconnected"}
        </span>
      </p>
       <Button onClick={sendPing} className="mt-4">
        Send Ping
      </Button>

      <div className="mt-6 border rounded-lg p-4 bg-gray-50 space-y-1">
        {messages.map((msg, i) => (
          <p key={i} className="text-sm text-gray-700">
            {msg}
          </p>
        ))}
      </div>
    </div>

    )

}


