import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import ClientLayout from "./ClientLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  // Metadata não pode ser exportada de um Client Component, será ignorada.
  title: "Everest Preparatórios",
  description: "Plataforma completa de estudos com flashcards avançados para preparatórios.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
