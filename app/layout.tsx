import type { Metadata } from "next"
import "./globals.css"
import BackButtonHandler from "./components/BackButtonHandler"

export const metadata: Metadata = {
  title: "PROACADE - Catálogo",
  description: "Catálogo de Produtos",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-full flex flex-col antialiased bg-gray-50 text-gray-900">
        <BackButtonHandler />
        {children}
      </body>
    </html>
  )
}