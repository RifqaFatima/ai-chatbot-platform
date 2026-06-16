export function chunkText(
    text: string, //ip doc text
    chunkSize: number = 1000 //default if not provided

): string[] {
    const cleaned = text.replace(/\s+/g, " ").trim()

    //if 200<=1000, no need ot split return one chunk.
    if(cleaned.length <= chunkSize) {
        return [cleaned]
    }

    const chunks: string[]=[]
    let start = 0

    while(start < cleaned.length) {
        const end = start + chunkSize
        chunks.push(cleaned.slice(start, end))
        start = end
    }

    return chunks
}