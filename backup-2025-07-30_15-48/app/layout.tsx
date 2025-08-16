import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import SimpleLayout from "./SimpleLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <SimpleLayout>{children}</SimpleLayout>
      </body>
    </html>
  )
}
