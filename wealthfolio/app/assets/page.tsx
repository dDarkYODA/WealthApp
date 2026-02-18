import { createClient } from '@/utils/supabase/server'
import AssetManager from '@/components/AssetManager'
import { DEMO_ASSETS } from '@/lib/demo-data'

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
      <AssetManager initialAssets={assets} isDemo={!user} />
    </div>
  )
}
export const dynamic = 'force-dynamic'
