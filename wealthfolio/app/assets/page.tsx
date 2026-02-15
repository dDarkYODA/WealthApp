import { createClient } from '@/utils/supabase/server'
import AssetManager from '@/components/AssetManager'

export default async function AssetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-4 text-black font-bold">Please log in to view assets.</div>
  }

  const { data: assets } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black border-b-4 border-black pb-2">Asset Management</h1>
      <AssetManager initialAssets={assets || []} />
    </div>
  )
}
