'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import ExpenseForm from './ExpenseForm'
import { deleteExpense } from '@/actions/expenses'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function ExpenseManager({ initialExpenses }: { initialExpenses: any[] }) {
  const [isAddOpen, setIsAddOpen] = useState(false)

  const handleDelete = async (id: string) => {
    if (confirm('Delete this expense?')) {
        await deleteExpense(id)
    }
  }

  const recurring = initialExpenses.filter(e => e.is_recurring)
  const history = initialExpenses.filter(e => !e.is_recurring)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-gray-800 font-bold border-2 border-transparent">Add Expense</Button>
          </DialogTrigger>
          <DialogContent className="border-4 border-black">
            <DialogHeader>
              <DialogTitle className="font-black text-xl">Add New Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm onClose={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Recurring Section */}
      <div className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gray-50 p-4">
        <h2 className="text-2xl font-black mb-4 border-b-2 border-black pb-1">Fixed Monthly Burn (Recurring)</h2>
        <Table>
            <TableHeader className="bg-black">
                <TableRow className="border-b-2 border-white hover:bg-black">
                    <TableHead className="text-white font-bold border-r border-white">Category</TableHead>
                    <TableHead className="text-white font-bold border-r border-white text-right">Amount</TableHead>
                    <TableHead className="text-white font-bold border-r border-white">Next Post Date</TableHead>
                    <TableHead className="text-white font-bold text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {recurring.map(exp => (
                    <TableRow key={exp.id} className="border-b-2 border-black hover:bg-white last:border-b-0">
                        <TableCell className="font-bold border-r-2 border-black">{exp.category}</TableCell>
                        <TableCell className="text-right border-r-2 border-black font-bold">{formatCurrency(exp.amount_inr)}</TableCell>
                        <TableCell className="border-r-2 border-black font-medium">{formatDate(exp.next_post_date)}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(exp.id)} className="font-bold border-2 border-black">Remove</Button>
                        </TableCell>
                    </TableRow>
                ))}
                 {recurring.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center font-medium p-4">No recurring expenses configured.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
      </div>

      {/* History Section */}
      <div className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
        <h2 className="text-2xl font-black mb-4 border-b-2 border-black pb-1">Transaction History</h2>
        <Table>
            <TableHeader className="bg-black">
                <TableRow className="border-b-2 border-white hover:bg-black">
                    <TableHead className="text-white font-bold border-r border-white">Date</TableHead>
                    <TableHead className="text-white font-bold border-r border-white">Category</TableHead>
                    <TableHead className="text-white font-bold border-r border-white text-right">Amount</TableHead>
                    <TableHead className="text-white font-bold text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {history.map(exp => (
                    <TableRow key={exp.id} className="border-b-2 border-black hover:bg-gray-100 last:border-b-0">
                        <TableCell className="font-medium border-r-2 border-black">{formatDate(exp.date)}</TableCell>
                        <TableCell className="font-bold border-r-2 border-black">{exp.category}</TableCell>
                        <TableCell className="text-right border-r-2 border-black font-bold">{formatCurrency(exp.amount_inr)}</TableCell>
                        <TableCell className="text-right">
                             <Button variant="destructive" size="sm" onClick={() => handleDelete(exp.id)} className="font-bold border-2 border-black">Delete</Button>
                        </TableCell>
                    </TableRow>
                ))}
                {history.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center font-medium p-4">No expense history.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
      </div>
    </div>
  )
}
