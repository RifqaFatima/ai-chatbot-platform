import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"

type Chatbot = {
  id: string
  name: string
  createdAt: Date
}

export function ChatbotList({ chatbots }: { chatbots: Chatbot[] }) {
    if(chatbots.length === 0) {
        return (
            <div className="text-center text-gray-500 mt-12">
                <p>You don't have any chatbots yet.</p>
                <p className="text-sm">Click "+ New Chatbot" to create your first one.</p>
            </div>

        )
    }

    return(
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {chatbots.map((bot)=> (
                <Link key={bot.id} href={`/chatbots/${bot.id}`}>
                    <Card className="hover:shadow-md transition cursor-pointer">
                        <CardHeader>
                        <CardTitle className="text-lg">{bot.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <p className="text-xs text-gray-500">
                            Created {new Date(bot.createdAt).toLocaleDateString()}
                        </p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>

    )
}