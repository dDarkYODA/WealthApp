import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="border-b border-black p-4 mb-4 flex justify-between items-center bg-white sticky top-0 z-50">
      <Link href="/" className="text-2xl font-bold text-black">WealthFolio</Link>
      <nav className="flex gap-6 items-center">
        <Link href="/" className="text-black font-bold hover:underline">Dashboard</Link>
        <Link href="/assets" className="text-black font-bold hover:underline">Assets</Link>
        <Link href="/expenses" className="text-black font-bold hover:underline">Expenses</Link>
        <form action="/api/backup" method="get">
             {/* Mock backup button for now, logic later */}
             <Button variant="outline" className="text-black border-black font-bold">Download CSV</Button>
        </form>
      </nav>
    </header>
  )
}
