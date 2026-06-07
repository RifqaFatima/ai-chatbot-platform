import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/session-provider"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Chatbot Platform",
  description: "Create embeddable AI chatbots for your website",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}