import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import Papa from 'papaparse'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Fetch all assets
  const { data: assets } = await supabase.from('assets').select('*').eq('user_id', user.id)

  const csvData = Papa.unparse(assets || [])

  return new NextResponse(csvData, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="wealthfolio_assets_${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
