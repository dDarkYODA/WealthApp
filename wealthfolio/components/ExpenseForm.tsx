'use client'

import { addExpense } from '@/actions/expenses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from "@/components/ui/switch"

export default function ExpenseForm({ onClose }: { onClose?: () => void }) {
  async function action(formData: FormData) {
    try {
        await addExpense(formData)
        if (onClose) onClose()
    } catch (e: any) {
        alert(e.message)
    }
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="category" className="font-bold">Category</Label>
        <Input name="category" className="border-2 border-black font-medium" placeholder="e.g. Rent, Groceries" required />
      </div>

      <div>
        <Label htmlFor="amount_inr" className="font-bold">Amount (INR)</Label>
        <Input name="amount_inr" type="number" step="any" className="border-2 border-black font-medium" required />
      </div>

      <div className="flex items-center space-x-2 border-2 border-black p-3 rounded">
        <Switch id="is_recurring" name="is_recurring" />
        <Label htmlFor="is_recurring" className="font-bold cursor-pointer">Is Recurring (Fixed Monthly Burn)?</Label>
      </div>

      <div>
         <Label htmlFor="next_post_date" className="font-bold">Next Post Date (If Recurring)</Label>
         <Input name="next_post_date" type="date" className="border-2 border-black font-medium" />
         <p className="text-xs font-bold mt-1">Leave empty for one-time expense.</p>
      </div>

      <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800 font-bold border-2 border-transparent mt-4">
        Add Expense
      </Button>
    </form>
  )
}
