import { createClient } from '@/utils/supabase/server'
import ExpenseManager from '@/components/ExpenseManager'

export default async function ExpensesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-4 text-black font-bold">Please log in to view expenses.</div>
  }

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black border-b-4 border-black pb-2">Expense Engine</h1>
      <ExpenseManager initialExpenses={expenses || []} />
    </div>
  )
}
