"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"

type FileEntry = {
    fileName: string
    createdAt: string
}

export function KnowledgeBaseUpload(
    {chatbotId}: {chatbotId: string}
){
    const [files, setFiles]= useState<FileEntry[]>([])
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const fetchFiles = async () => {
        const res = await fetch(`/api/chatbots/${chatbotId}/upload`)
        if(res.ok) {
            const data = await res.json()
            setFiles(data)
        }
    }

    useEffect(() => {
        fetchFiles()
    }, [chatbotId])

    //runs when user selects a file
    //e is a change event coming from an HTML input element
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        //this file is just a browser object not a ready to send http payload
        if(!file) return
        
        setUploading(true)
        setMessage("")

        //FormData is a built in browser object used to send files/form ip/text field to a server
        const formData = new FormData()
        formData.append("file", file)

        try{
            const res = await fetch(
            `/api/chatbots/${chatbotId}/upload`,
            {
                method: "POST",
                body: formData
            })

            const data = await res.json()

            if (!res.ok) {
                setMessage(data.error || "Upload failed")
            } else {
                setMessage(data.message)
                fetchFiles()
            }

        }catch(error) {
            setMessage("Upload failed. Try again")
        } finally {
            setUploading(false)
            if(fileInputRef.current)fileInputRef.current.value =""
        } 
    }

    return (
        <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3">Knowledge Base</h3>

            <input
            ref={fileInputRef}
            type="file"
            accept=".pdf, .docx, .txt, .md"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="kb-upload"
            />

            <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            >
                {uploading? "Uploading..." : "Upload Document"}
            </Button>

            {message && (
                <p className="text-xs text-gray-500 mt-2">{message}</p>
            )}

            <div className="mt-3 space-y-1">
                {files.length === 0 && (
                    <p className="text-xs text-gray-400">No documents uploaded yet</p>
                )}
                {files.map((f) => (
                    <div key={f.fileName} 
                    className="text-xs flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                        <span className="truncate">{f.fileName}</span>
                    </div>

                ))}

            </div>
        </div>
    )

}