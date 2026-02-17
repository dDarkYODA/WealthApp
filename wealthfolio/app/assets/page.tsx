import { createClient } from '@/utils/supabase/server'
import AssetManager from '@/components/AssetManager'

const DEMO_ASSETS = [
    { id: 'demo-1', user_id: 'demo', asset_type: 'Stock', ticker_or_code: 'AAPL', quantity: 15, avg_price_inr: 14500, market_value_inr: 0, loan_amount_inr: 0, name: 'Apple Inc.' },
    { id: 'demo-2', user_id: 'demo', asset_type: 'MF', ticker_or_code: 'SBI-BLUECHIP', quantity: 5000, avg_price_inr: 120, market_value_inr: 0, loan_amount_inr: 0, name: 'SBI Bluechip Fund' },
    { id: 'demo-3', user_id: 'demo', asset_type: 'Real Estate', ticker_or_code: 'APT-101', quantity: 1, avg_price_inr: 8500000, market_value_inr: 12000000, loan_amount_inr: 4500000, name: 'Luxury Apartment' },
]

export default async function AssetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let assets = []
  if (!user) {
      assets = DEMO_ASSETS
  } else {
      const { data } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      assets = data || []
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b-4 border-black pb-2">
          <h1 className="text-3xl font-black">Asset Management</h1>
          {!user && <span className="bg-black text-white px-3 py-1 font-bold text-sm">DEMO MODE (Read Only)</span>}
      </div>
      <AssetManager initialAssets={assets} />
    </div>
  )
}
