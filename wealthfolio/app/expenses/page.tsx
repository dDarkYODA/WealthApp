import { getExpenses } from '@/actions/expenses'
import ExpenseManager from '@/components/ExpenseManager'
import { createClient } from '@/utils/supabase/server'

export default async function ExpensesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const expenses = await getExpenses()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b-4 border-black pb-2">
          <h1 className="text-3xl font-black">Expense Engine</h1>
          {!user && <span className="bg-black text-white px-3 py-1 font-bold text-sm">DEMO MODE (Read Only)</span>}
      </div>
      <ExpenseManager initialExpenses={expenses} isDemo={!user} />
    </div>
  )
}
export const dynamic = 'force-dynamic'
