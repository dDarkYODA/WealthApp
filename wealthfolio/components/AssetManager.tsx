'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import AssetForm from './AssetForm'
import CSVImport from './CSVImport'
import { deleteAsset } from '@/actions/assets'
import { formatCurrency } from '@/lib/utils'

export default function AssetManager({ initialAssets }: { initialAssets: any[] }) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<any>(null)

  const handleEdit = (asset: any) => {
    setEditingAsset(asset)
    setIsEditOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this asset?')) {
        await deleteAsset(id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-gray-800 font-bold border-2 border-transparent">Add Single Asset</Button>
            </DialogTrigger>
            <DialogContent className="border-4 border-black">
                <DialogHeader>
                <DialogTitle className="font-black text-xl">Add New Asset</DialogTitle>
                </DialogHeader>
                <AssetForm onClose={() => setIsAddOpen(false)} />
            </DialogContent>
            </Dialog>

            <CSVImport />
        </div>
      </div>

      <div className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <Table>
          <TableHeader className="bg-black">
            <TableRow className="hover:bg-black border-b-2 border-white">
              <TableHead className="text-white font-bold border-r border-white">Name</TableHead>
              <TableHead className="text-white font-bold border-r border-white">Type</TableHead>
              <TableHead className="text-white font-bold border-r border-white text-right">Qty</TableHead>
              <TableHead className="text-white font-bold border-r border-white text-right">Avg Price</TableHead>
              <TableHead className="text-white font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialAssets.map((asset) => (
              <TableRow key={asset.id} className="border-b-2 border-black hover:bg-gray-100 last:border-b-0">
                <TableCell className="font-bold border-r-2 border-black">{asset.name || asset.ticker_or_code}</TableCell>
                <TableCell className="border-r-2 border-black font-medium">{asset.asset_type}</TableCell>
                <TableCell className="text-right border-r-2 border-black font-medium">{asset.quantity}</TableCell>
                <TableCell className="text-right border-r-2 border-black font-medium">{formatCurrency(asset.avg_price_inr)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(asset)} className="mr-2 border-2 border-black font-bold hover:bg-black hover:text-white">Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(asset.id)} className="font-bold border-2 border-black text-white hover:bg-red-600">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {initialAssets.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center font-bold p-4">No assets found. Add one manually or import CSV.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border-4 border-black">
          <DialogHeader>
            <DialogTitle className="font-black text-xl">Edit Asset</DialogTitle>
          </DialogHeader>
          {editingAsset && (
            <AssetForm asset={editingAsset} onClose={() => setIsEditOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
