import { getWealthDashboardData } from '@/actions/wealth-engine'
import { checkRecurringExpenses } from '@/actions/expenses'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default async function Dashboard() {
  await checkRecurringExpenses()

  const data = await getWealthDashboardData()

  // Data will be mock data if not logged in, or null if error
  if (!data) {
    return (
      <div className="p-4 text-center text-black">
        <h1 className="text-2xl font-bold mb-4">Welcome to WealthFolio</h1>
        <p>Unable to load data.</p>
      </div>
    )
  }

  const { summary, assets } = data

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-black border-b-4 border-black pb-2">Wealth Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Total Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{formatCurrency(summary.totalNetWorth)}</div>
          </CardContent>
        </Card>

        <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Equity (Stocks)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{formatCurrency(summary.equity)}</div>
          </CardContent>
        </Card>

        <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Mutual Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{formatCurrency(summary.mfValue)}</div>
          </CardContent>
        </Card>

        <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Real Estate Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{formatCurrency(summary.realEstateEquity)}</div>
            <p className="text-sm mt-2 font-bold border-t-2 border-black pt-1">USD/INR: ₹{summary.usdRate}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-black mb-6 border-b-4 border-black pb-2">Asset Breakdown</h2>
        <div className="overflow-x-auto border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <table className="w-full border-collapse">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-3 text-left font-bold border-r border-white">Name/Ticker</th>
                <th className="p-3 text-right font-bold border-r border-white">Type</th>
                <th className="p-3 text-right font-bold border-r border-white">Quantity</th>
                <th className="p-3 text-right font-bold border-r border-white">Live Price</th>
                 <th className="p-3 text-right font-bold">Value (INR)</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset: any) => (
                <tr key={asset.id} className="hover:bg-gray-100 border-b-2 border-black last:border-b-0">
                  <td className="p-3 text-black font-bold border-r-2 border-black">{asset.name || asset.ticker_or_code}</td>
                  <td className="p-3 text-right text-black font-medium border-r-2 border-black">{asset.asset_type}</td>
                  <td className="p-3 text-right text-black font-medium border-r-2 border-black">{asset.quantity}</td>
                  <td className="p-3 text-right text-black font-medium border-r-2 border-black">
                    {asset.asset_type !== 'Real Estate' ? formatCurrency(asset.current_price_inr) : '-'}
                  </td>
                  <td className="p-3 text-right text-black font-black">
                    {formatCurrency(asset.calculated_market_value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
