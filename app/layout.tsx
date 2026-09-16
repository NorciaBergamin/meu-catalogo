import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PROCADE - Catálogo Oficial',
  description: 'Catálogo e Sistema de Pedidos',
  manifest: '/manifest.json',
  themeColor: '#0d47a1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PROACADE',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}