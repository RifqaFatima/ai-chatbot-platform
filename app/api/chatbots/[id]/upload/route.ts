import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { extractText } from "@/lib/extract-text"
import { chunkText } from "@/lib/chunk-text"

export async function POST(
    req: Request, //contains the uploaded file
    context: { params: Promise<{id:string}>}
)
{
    const { id } = await context.params
    try{
        const session = await getServerSession(authOptions)

        if(!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const chatbot = await db.chatbot.findUnique({
            where: {id: id},
        })

        if (!chatbot ||chatbot.userId !== session.user.id) {
            return NextResponse.json({ error: "Not found" }, { status: 400 })
        }

        //get submitted form data
        const formData = await req.formData()

        //store the file object 
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        const allowedExtensions = ["pdf", "docx", "txt", "md"]
        const extension = file.name.split(".").pop()?.toLowerCase()

        if(!extension || !allowedExtensions.includes(extension)) {
            return NextResponse.json(
                { error: "unsupported file type. Use PDF, DOCX, TXT or MD."},
                {status: 400}
            )
        }

        //convert File object to ArrayBuffer using the File method .arrayBuffer()
        //ArrayBuffer is JS's way of storing raw binary data(file content->raw bytes)
        //But lib like pdf-parse etc expect a Node.js Buffer, so we convert using Buffer.from()

        const buffer = Buffer.from(await file.arrayBuffer())
        const text = await extractText(buffer, file.name)

        if(!text || text.trim().length === 0) {
            return NextResponse.json(
                { error: "Could not extract any text from this file" },
                { status: 400 }
            )
        }

        const chunks = chunkText(text)

        //store chunks
        await db.knowledgeBase.createMany({
            data: chunks.map((chunk, index) => ({
                chatbotId: id,
                fileName: file.name,
                chunkText: chunk,
                chunkIndex: index,
            })),
        })

        return NextResponse.json(
            { message: `Uploaded successfully. ${chunks.length} chunks created.` },
            { status: 201 }
        )
    } catch(error) {
        console.error("Upload error: ", error)
        return NextResponse.json(
            { error: "Failed to process file" },
            { status: 500 }
        )
    }
}

//lists uplaoded files
export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
)
{
    const { id } = await context.params
    const session = await getServerSession(authOptions)
    
    if(!session) {
        return NextResponse.json({error: "unauthorized"}, {status: 401})
    }

    const chatbot = await db.chatbot.findUnique({
        where: {id: id},
    })

    if(!chatbot || chatbot.userId !== session.user.id){
        return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const files = await db.knowledgeBase.findMany({
        where: { chatbotId: id},
        distinct: ["fileName"],
        select: { fileName: true, createdAt: true},
        orderBy: {createdAt: "desc"},
    })

    return NextResponse.json(files)
}