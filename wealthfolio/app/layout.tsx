import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WealthFolio',
  description: 'Production-Grade Wealth & Expense Tracker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-white text-black min-h-screen"}>
        <Header />
        <main className="container mx-auto p-4 text-black">
          {children}
        </main>
      </body>
    </html>
  )
}
