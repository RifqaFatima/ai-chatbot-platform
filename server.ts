import { createServer } from "http"
import { parse } from "url"
import next from "next"
import { Server as SocketIOServer } from "socket.io"

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = parseInt(process.env.PORT || "3000", 10)

//create the next.js app object
const app = next({ dev, hostname, port })
//req arrives at httpserver, handle used to tell Next.js to handle the req
const handle = app.getRequestHandler()

//wait until next.js is fully initialised before creating/starting http serevr
app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url!, true)
        handle(req, res, parsedUrl)
    })

    //create a socket.IO server instance
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    })
    //io: all connected clients->server
    //socket: one specific client
    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id)

        socket.on("ping_server", (data) => {
            console.log("Recieved from client:", data)
            socket.emit("pong_client", { message: "Hello from server!" })
        })

        socket.on("disconnect", ()=> {
            console.log("Client disconnected:", socket.id)
        })
    })
    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`)
    })


})