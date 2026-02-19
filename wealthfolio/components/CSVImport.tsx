'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { addAssetsBulk } from '@/actions/assets'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function CSVImport() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data
        const mappedData = data.map((row: any) => ({
            asset_type: 'Stock',
            ticker_or_code: row.Ticker,
            quantity: Number(row.Qty),
            avg_price_inr: Number(row.PurchasePrice),
            name: row.Ticker,
        }))

        try {
            await addAssetsBulk(mappedData)
            setOpen(false)
            alert('Import successful!')
        } catch (err: any) {
            alert('Import failed: ' + err.message)
        } finally {
            setLoading(false)
        }
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-2 border-black font-bold text-black hover:bg-black hover:text-white">Import CSV</Button>
      </DialogTrigger>
      <DialogContent className="border-4 border-black">
        <DialogHeader>
          <DialogTitle className="font-black text-xl">Import Assets from CSV</DialogTitle>
          <DialogDescription className="font-medium text-black">
            Upload a CSV with headers: Ticker, Qty, PurchasePrice, Date.
          </DialogDescription>
        </DialogHeader>
        <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="csv" className="font-bold">CSV File</Label>
            <Input id="csv" type="file" accept=".csv" onChange={handleFileUpload} className="border-2 border-black font-medium" />
            {loading && <p className="font-bold">Importing...</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
