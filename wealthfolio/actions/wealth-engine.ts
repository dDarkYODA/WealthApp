'use server'

import { createClient } from '@/utils/supabase/server'

// Mock Data Fetchers
async function getUSDINRRate() {
  // In production, fetch from an API like https://api.exchangerate-api.com/v4/latest/USD
  return 84.0 // Mock rate
}

async function getStockPrice(ticker: string) {
  // Mock logic
  // Assume US tickers are 1-4 letters, simple logic
  // Returns INR price
  // In real app, check if it is US or Indian.
  // Assuming US if 'AAPL', 'TSLA' etc.
  const usTickers = ['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'AMZN']
  if (usTickers.includes(ticker.toUpperCase())) {
     const usdRate = await getUSDINRRate()
     return (Math.random() * 100 + 150) * usdRate // Random price between 150-250 USD
  }
  return 100.0 // Default INR price
}

async function getMFNAV(schemeCode: string) {
  // Mock NAV
  return 150.5
}

export async function getWealthDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const usdRate = await getUSDINRRate()

  // Fetch Assets
  const { data: assets, error } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching assets:', error)
    return null
  }

  let totalNetWorth = 0
  let equity = 0
  let mfValue = 0
  let realEstateEquity = 0

  // To avoid mutating the original objects in a way TS dislikes (if strict), we map
  const processedAssets = await Promise.all(assets.map(async (asset) => {
    let currentPrice = Number(asset.avg_price_inr) || 0
    let marketValue = 0

    if (asset.asset_type === 'Stock') {
       currentPrice = await getStockPrice(asset.ticker_or_code)
       marketValue = currentPrice * Number(asset.quantity)
       equity += marketValue
    } else if (asset.asset_type === 'MF') {
       currentPrice = await getMFNAV(asset.ticker_or_code)
       marketValue = currentPrice * Number(asset.quantity)
       mfValue += marketValue
    } else if (asset.asset_type === 'Real Estate') {
       // Use stored market value
       marketValue = Number(asset.market_value_inr) || 0
       const loan = Number(asset.loan_amount_inr) || 0
       const reEquity = marketValue - loan
       realEstateEquity += reEquity
       // For Real Estate, marketValue acts as the asset value, but net worth contribution is equity
    }

    // Sum for Total Net Worth
    if (asset.asset_type !== 'Real Estate') {
        // For non-RE, Market Value contributes directly (assuming no loans on stocks/MFs tracked here)
        // If loan exists on RE, we added (Market - Loan) to realEstateEquity
    }

    return {
      ...asset,
      current_price_inr: currentPrice,
      calculated_market_value: marketValue
    }
  }))

  // Total Net Worth = Equity (Stocks) + MF Value + Real Estate Equity
  totalNetWorth = equity + mfValue + realEstateEquity

  // Snapshot Logic
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
