import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // MOCK MODE if API key is missing (for local testing/verification without key)
    if (!process.env.GEMINI_API_KEY) {
        console.log('Using Mock Gemini Response')
        return NextResponse.json({
            transactions: [
                { date: '15/02/2026', description: 'UBER TRIP', amount: 450, category: 'Travel' },
                { date: '14/02/2026', description: 'AMAZON RETAIL', amount: 1299, category: 'Shopping' },
                { date: '12/02/2026', description: 'STARBUCKS', amount: 350, category: 'Dining' },
                { date: '10/02/2026', description: 'NETFLIX', amount: 199, category: 'Entertainment' },
            ]
        })
    }

    const apiKey = process.env.GEMINI_API_KEY
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')

    const prompt = `You are a financial auditor. Extract all transactions from this credit card statement.
    Output a JSON array with: date (DD/MM/YYYY), description, amount (INR), and category (Groceries, Travel, Dining, Shopping, Bills, etc.).
    Ensure the output is strictly valid JSON with no markdown formatting.`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      },
    ])

    const response = await result.response
    let text = response.text()

    // Clean up markdown code blocks if present
    text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim()

    const transactions = JSON.parse(text)

    return NextResponse.json({ transactions })
  } catch (error: any) {
    console.error('Error parsing statement:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
