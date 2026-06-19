import { io, Socket } from "socket.io-client"
//io : function that creates a socket connection
//Socket: TS ty[e desc]

let socket: Socket | null = null

export function getSocket(): Socket {
    if(!socket) {
        socket = io({
            path: "/socket.io",
        })
    }
    return socket
}

//ensures you only ever create one socket connection per browser tab, reused everywhere