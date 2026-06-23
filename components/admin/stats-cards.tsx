import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Stats = {
    totalUsers: number
    totalChatbots: number
    totalMessages: number
    totalQuotaUsed: number
}

export function StatsCards({ stats }: {stats: Stats}) {
    const items = [
        { label: "Total Users", value: stats.totalUsers },
        { label: "Total Chatbots", value: stats.totalChatbots },
        { label: "Total Messages", value: stats.totalMessages },
        { label: "Quota Consumed", value: stats.totalQuotaUsed },
    ]

    return (
        <div>
            {items.map((item) => (
                <Card key={item.label}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500 font-normal">
                            {item.label}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{item.value}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )





}