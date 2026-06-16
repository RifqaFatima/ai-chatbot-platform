import { GoogleGenerativeAI } from "@google/generative-ai"

//create Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function getChatResponse(
    message: string,
    context: string = "",
    history: {
        role: "user" | "model";
        parts: { text: string }[]
    } [] = []

) {
    //get the model
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
    })

    //build system prompt
    const systemPrompt = context?
    `You are a helpful assistant. Use the following information to answer questions. If the answer isn't in the provided information, say so honestly.\n\nContext:\n${context}`
    : "You are a helpful assistant."

    //start a chat session, provide history
    const chat = model.startChat({
        history:[
            {
                role: "user",
                parts: [{ text: systemPrompt }],
            },
            {
                role: "model",
                parts: [{ text: "Understood. I'll help based on the provided context." }],
            },
            ...history, 
        ],

    })
    //send the user's latest message
    const result = await chat.sendMessage(message)

    //extract response from the object returned by SDK
    const response = await result.response

    //extract text from meta data
    return response.text()
}

//handles: connection to gemini, hwo to send msg & chat history, how to return teh Ai's response

