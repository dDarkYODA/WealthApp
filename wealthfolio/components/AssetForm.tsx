'use client'

import { addAsset, updateAsset } from '@/actions/assets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AssetForm({ asset, onClose }: { asset?: any, onClose?: () => void }) {
  const isEdit = !!asset

  async function action(formData: FormData) {
      try {
          if (isEdit) {
              await updateAsset(asset.id, formData)
          } else {
              await addAsset(formData)
          }
          if (onClose) onClose()
      } catch (e: any) {
          alert(e.message)
      }
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="asset_type" className="font-bold">Asset Type</Label>
        <Select name="asset_type" defaultValue={asset?.asset_type || "Stock"}>
          <SelectTrigger className="border-2 border-black font-medium">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent className="border-2 border-black">
            <SelectItem value="Stock">Stock</SelectItem>
            <SelectItem value="MF">Mutual Fund</SelectItem>
            <SelectItem value="Real Estate">Real Estate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="name" className="font-bold">Name</Label>
        <Input name="name" defaultValue={asset?.name} className="border-2 border-black font-medium" placeholder="e.g. Apple Inc. or Apartment 101" />
      </div>

      <div>
        <Label htmlFor="ticker_or_code" className="font-bold">Ticker / Code</Label>
        <Input name="ticker_or_code" defaultValue={asset?.ticker_or_code} className="border-2 border-black font-medium" placeholder="AAPL or MF-123" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <Label htmlFor="quantity" className="font-bold">Quantity</Label>
            <Input name="quantity" type="number" step="any" defaultValue={asset?.quantity} className="border-2 border-black font-medium" />
        </div>
        <div>
            <Label htmlFor="avg_price_inr" className="font-bold">Avg Price (INR)</Label>
            <Input name="avg_price_inr" type="number" step="any" defaultValue={asset?.avg_price_inr} className="border-2 border-black font-medium" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="market_value_inr" className="font-bold">Market Value (INR)</Label>
            <Input name="market_value_inr" type="number" step="any" defaultValue={asset?.market_value_inr} className="border-2 border-black font-medium" placeholder="For Real Estate" />
          </div>
          <div>
            <Label htmlFor="loan_amount_inr" className="font-bold">Loan Amount (INR)</Label>
            <Input name="loan_amount_inr" type="number" step="any" defaultValue={asset?.loan_amount_inr} className="border-2 border-black font-medium" placeholder="For Real Estate" />
          </div>
      </div>

      <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800 font-bold border-2 border-transparent mt-4">
        {isEdit ? 'Update Asset' : 'Add Asset'}
      </Button>
    </form>
  )
}
