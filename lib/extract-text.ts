import mammoth from "mammoth"

export async function extractText(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const extension = filename.split(".").pop()?.toLowerCase()

  switch (extension) {
    case "pdf": {
      const pdfParse = require("pdf-parse")
      const data = await pdfParse(buffer)
      return data.text
    }

    case "docx": {
      const result = await mammoth.extractRawText({ buffer })
      return result.value
    }

    case "txt":
    case "md": {
      return buffer.toString("utf-8")
    }

    default:
      throw new Error(`Unsupported file type: ${extension}`)
  }
}