'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const DEMO_EXPENSES = [
    { id: 'demo-exp-1', user_id: 'demo', category: 'Rent', amount_inr: 25000, is_recurring: true, next_post_date: '2026-03-01', date: '2026-02-01' },
    { id: 'demo-exp-2', user_id: 'demo', category: 'Groceries', amount_inr: 5000, is_recurring: false, next_post_date: null, date: '2026-02-14' },
    { id: 'demo-exp-3', user_id: 'demo', category: 'Netflix', amount_inr: 699, is_recurring: true, next_post_date: '2026-03-10', date: '2026-02-10' },
]

export async function getExpenses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return DEMO_EXPENSES

  const { data } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  return data || []
}

export async function addExpense(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Demo Mode: Cannot add expense. Please sign in (Disabled).')

  const category = formData.get('category') as string
  const amount = Number(formData.get('amount_inr'))
  const isRecurring = formData.get('is_recurring') === 'on'
  const nextPostDate = formData.get('next_post_date') as string

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    category,
    amount_inr: amount,
    is_recurring: isRecurring,
    next_post_date: nextPostDate || null,
    date: new Date().toISOString().split('T')[0]
  })

  if (error) throw new Error(error.message)
  revalidatePath('/expenses')
  revalidatePath('/')
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Demo Mode: Cannot delete expense.')

  const { error } = await supabase.from('expenses').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/expenses')
  revalidatePath('/')
}

export async function checkRecurringExpenses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const today = new Date().toISOString().split('T')[0]

  const { data: recurring } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_recurring', true)
    .lte('next_post_date', today)

  if (recurring && recurring.length > 0) {
    for (const exp of recurring) {
      await supabase.from('expenses').insert({
        user_id: user.id,
        category: exp.category,
        amount_inr: exp.amount_inr,
        is_recurring: false,
        date: today
      })

      const nextDate = new Date(exp.next_post_date)
      nextDate.setMonth(nextDate.getMonth() + 1)
      const nextDateStr = nextDate.toISOString().split('T')[0]

      await supabase.from('expenses')
        .update({ next_post_date: nextDateStr })
        .eq('id', exp.id)
    }
    revalidatePath('/expenses')
    revalidatePath('/')
    return recurring.length
  }

  return 0
}

export async function bulkAddExpenses(expenses: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Demo Mode: Cannot save expenses.')

  const expensesToInsert = expenses.map(e => ({
    user_id: user.id,
    category: e.category,
    amount_inr: Number(e.amount),
    is_recurring: false,
    date: e.date.split('/').reverse().join('-'),
  }))

  const { error } = await supabase.from('expenses').insert(expensesToInsert)

  if (error) {
      console.error(error)
      throw new Error(error.message)
  }
  revalidatePath('/expenses')
  revalidatePath('/')
}
