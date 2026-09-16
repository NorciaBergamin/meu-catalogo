import type { Metadata } from "next"
import "./globals.css"
import BackButtonHandler from "./components/BackButtonHandler"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "PROACADE - Catálogo",
  description: "Catálogo de Produtos e ERP",
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
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  )
}