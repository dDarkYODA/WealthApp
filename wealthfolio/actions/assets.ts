'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addAsset(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Demo Mode: Cannot add asset.')

  const assetType = formData.get('asset_type') as string
  const name = formData.get('name') as string
  const ticker = formData.get('ticker_or_code') as string
  const quantity = Number(formData.get('quantity')) || 0
  const avgPrice = Number(formData.get('avg_price_inr')) || 0
  const marketValue = Number(formData.get('market_value_inr')) || 0
  const loanAmount = Number(formData.get('loan_amount_inr')) || 0

  const { error } = await supabase.from('assets').insert({
    user_id: user.id,
    asset_type: assetType,
    name: name,
    ticker_or_code: ticker,
    quantity: quantity,
    avg_price_inr: avgPrice,
    market_value_inr: marketValue,
    loan_amount_inr: loanAmount
  })

  if (error) {
      console.error(error)
      throw new Error(error.message)
  }
  revalidatePath('/assets')
  revalidatePath('/')
}

export async function updateAsset(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Demo Mode: Cannot update asset.')

  const assetType = formData.get('asset_type') as string
  const name = formData.get('name') as string
  const ticker = formData.get('ticker_or_code') as string
  const quantity = Number(formData.get('quantity')) || 0
  const avgPrice = Number(formData.get('avg_price_inr')) || 0
  const marketValue = Number(formData.get('market_value_inr')) || 0
  const loanAmount = Number(formData.get('loan_amount_inr')) || 0

  const { error } = await supabase.from('assets').update({
    asset_type: assetType,
    name: name,
    ticker_or_code: ticker,
    quantity: quantity,
    avg_price_inr: avgPrice,
    market_value_inr: marketValue,
    loan_amount_inr: loanAmount,
    updated_at: new Date().toISOString()
  }).eq('id', id).eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/assets')
  revalidatePath('/')
}

export async function deleteAsset(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Demo Mode: Cannot delete asset.')

  const { error } = await supabase.from('assets').delete().eq('id', id).eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/assets')
  revalidatePath('/')
}

export async function addAssetsBulk(assets: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Demo Mode: Cannot import assets.')

  const assetsToInsert = assets.map(a => ({
    user_id: user.id,
    asset_type: a.asset_type,
    name: a.name || a.ticker_or_code,
    ticker_or_code: a.ticker_or_code,
    quantity: Number(a.quantity),
    avg_price_inr: Number(a.avg_price_inr),
    market_value_inr: Number(a.market_value_inr) || 0,
    loan_amount_inr: 0
  }))

  const { error } = await supabase.from('assets').insert(assetsToInsert)

  if (error) {
      console.error(error)
      throw new Error(error.message)
  }
  revalidatePath('/assets')
  revalidatePath('/')
}
