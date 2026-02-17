'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { bulkAddExpenses } from '@/actions/expenses'
import { useRouter } from 'next/navigation'

export default function StatementReview({ initialTransactions, onCancel }: { initialTransactions: any[], onCancel: () => void }) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleChange = (id: string, field: string, value: string | number) => {
    setTransactions(prev => prev.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ))
  }

  const handleDelete = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await bulkAddExpenses(transactions)
      router.push('/expenses')
    } catch (err: any) {
      alert('Failed to save: ' + err.message)
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black">Review Extracted Data</h1>
        <div className="space-x-4">
            <Button variant="outline" onClick={onCancel} className="border-2 border-black font-bold">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-black text-white hover:bg-gray-800 font-bold border-2 border-transparent">
                {saving ? 'Saving...' : 'Confirm & Save All'}
            </Button>
        </div>
      </div>

      <div className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
        <Table>
          <TableHeader className="bg-black">
            <TableRow className="border-b-2 border-white hover:bg-black">
              <TableHead className="text-white font-bold w-[120px]">Date</TableHead>
              <TableHead className="text-white font-bold">Description</TableHead>
              <TableHead className="text-white font-bold w-[150px]">Category</TableHead>
              <TableHead className="text-white font-bold w-[120px] text-right">Amount (INR)</TableHead>
              <TableHead className="text-white font-bold w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id} className="border-b-2 border-black hover:bg-gray-50 last:border-b-0">
                <TableCell>
                    <Input
                        value={t.date}
                        onChange={(e) => handleChange(t.id, 'date', e.target.value)}
                        className="border-black font-medium h-8"
                    />
                </TableCell>
                <TableCell>
                    <Input
                        value={t.description}
                        onChange={(e) => handleChange(t.id, 'description', e.target.value)}
                        className="border-black font-medium h-8"
                    />
                </TableCell>
                <TableCell>
                    <Input
                        value={t.category}
                        onChange={(e) => handleChange(t.id, 'category', e.target.value)}
                        className="border-black font-medium h-8"
                    />
                </TableCell>
                <TableCell>
                    <Input
                        type="number"
                        value={t.amount}
                        onChange={(e) => handleChange(t.id, 'amount', Number(e.target.value))}
                        className="border-black font-medium h-8 text-right"
                    />
                </TableCell>
                <TableCell>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(t.id)}
                        className="text-red-600 hover:text-red-900 font-bold hover:bg-red-50"
                    >
                        X
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
