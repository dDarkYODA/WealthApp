'use server'

import { createClient } from '@/utils/supabase/server'
import { DEMO_ASSETS } from '@/lib/demo-data'

// Mock Data Fetchers
async function getUSDINRRate() {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000)
    })
    if (!res.ok) throw new Error('Failed to fetch')
    const data = await res.json()
    return data.rates?.INR ?? 84.0
  } catch (error) {
    console.error('Failed to fetch USD/INR rate:', error)
    return 84.0
  }
}

async function getStockPrice(ticker: string, usdRate: number) {
  const usTickers: Record<string, number> = {
    'AAPL': 175.0,
    'GOOGL': 140.0,
    'TSLA': 220.0,
    'MSFT': 400.0,
    'AMZN': 170.0
  }
  const t = ticker.toUpperCase()
  if (t in usTickers) {
     return usTickers[t] * usdRate
  }
  return 100.0 * usdRate
}

async function getMFNAV(schemeCode: string) {
  return 150.5
}

export async function getWealthDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let assets = []

  if (!user) {
    // Return Demo Data if no user
    assets = DEMO_ASSETS
  } else {
    const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)

    if (error) {
        console.error('Error fetching assets:', error)
        return null
    }
    assets = data || []
  }

  const usdRate = await getUSDINRRate()

  let totalNetWorth = 0
  let equity = 0
  let mfValue = 0
  let realEstateEquity = 0

  const processedAssets = await Promise.all(assets.map(async (asset) => {
    let currentPrice = Number(asset.avg_price_inr) || 0
    let marketValue = 0

    if (asset.asset_type === 'Stock') {
       currentPrice = await getStockPrice(asset.ticker_or_code, usdRate)
       marketValue = currentPrice * Number(asset.quantity)
       equity += marketValue
    } else if (asset.asset_type === 'MF') {
       currentPrice = await getMFNAV(asset.ticker_or_code)
       marketValue = currentPrice * Number(asset.quantity)
       mfValue += marketValue
    } else if (asset.asset_type === 'Real Estate') {
       marketValue = Number(asset.market_value_inr) || 0
       const loan = Number(asset.loan_amount_inr) || 0
       const reEquity = marketValue - loan
       realEstateEquity += reEquity
    }

    return {
      ...asset,
      current_price_inr: currentPrice,
      calculated_market_value: marketValue
    }
  }))

  totalNetWorth = equity + mfValue + realEstateEquity

  // Snapshot Logic (Only run if real user)
  if (user) {
      const today = new Date().toISOString().split('T')[0]
      const { data: history } = await supabase
        .from('net_worth_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('snapshot_date', today)
        .single()

      if (!history) {
        await supabase.from('net_worth_history').insert({
          user_id: user.id,
          snapshot_date: today,
          total_net_worth_inr: totalNetWorth
        })
      }
  }

  return {
    assets: processedAssets,
    summary: {
      totalNetWorth,
      equity,
      mfValue,
      realEstateEquity,
      usdRate
    }
  }
}
