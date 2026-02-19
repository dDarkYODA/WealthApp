'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StatementReview from '@/components/StatementReview'

export default function UploadStatementPage() {
  const [parsedData, setParsedData] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/parse-statement', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to parse')
      }

      const data = await res.json()
      // Add temporary IDs for the UI
      const transactionsWithIds = data.transactions.map((t: any, index: number) => ({
        ...t,
        id: `temp-${index}`
      }))
      setParsedData(transactionsWithIds)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  })

  if (parsedData) {
    return <StatementReview initialTransactions={parsedData} onCancel={() => setParsedData(null)} />
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-black border-b-4 border-black pb-2">Upload Statement</h1>

      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Drag & Drop PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-4 border-dashed border-black p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'bg-gray-100' : 'bg-white'}`}
          >
            <input {...getInputProps()} />
            {loading ? (
              <p className="font-bold text-lg animate-pulse">Analyzing with Gemini AI...</p>
            ) : isDragActive ? (
              <p className="font-bold text-lg">Drop the PDF here...</p>
            ) : (
              <div className="space-y-2">
                <p className="font-bold text-lg">Drag & drop your Credit Card Statement (PDF)</p>
                <p className="text-sm font-medium">or click to select file</p>
              </div>
            )}
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-100 border-2 border-red-500 text-red-900 font-bold">
              Error: {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
