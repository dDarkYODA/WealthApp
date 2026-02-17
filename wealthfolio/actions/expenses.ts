'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getExpenses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

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
  if (!user) throw new Error('Not authenticated')

  const category = formData.get('category') as string
  const amount = Number(formData.get('amount_inr'))
  const isRecurring = formData.get('is_recurring') === 'on'
  const nextPostDate = formData.get('next_post_date') as string // YYYY-MM-DD

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
  if (!user) throw new Error('Not authenticated')

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

  // Find recurring expenses due
  const { data: recurring } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_recurring', true)
    .lte('next_post_date', today)

  if (recurring && recurring.length > 0) {
    for (const exp of recurring) {
      // 1. Create instance (history)
      await supabase.from('expenses').insert({
        user_id: user.id,
        category: exp.category,
        amount_inr: exp.amount_inr,
        is_recurring: false, // It's an instance, not the template
        date: today
      })

      // 2. Update next_post_date (add 1 month)
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
  if (!user) throw new Error('Not authenticated')

  const expensesToInsert = expenses.map(e => ({
    user_id: user.id,
    category: e.category,
    amount_inr: Number(e.amount),
    is_recurring: false,
    date: e.date.split('/').reverse().join('-'), // Convert DD/MM/YYYY to YYYY-MM-DD
    // Assuming description goes into category or we add a description column later.
    // For now, appending description to category if it's different, or just using category.
    // Ideally, we should migrate schema to add description, but to stick to current schema:
    // We will just use the category field for the category.
  }))

  const { error } = await supabase.from('expenses').insert(expensesToInsert)

  if (error) {
      console.error(error)
      throw new Error(error.message)
  }
  revalidatePath('/expenses')
  revalidatePath('/')
}
