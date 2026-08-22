import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Groq from 'groq-sdk'

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is missing. Check your .env file.')
}

const app = express()
const port = 3001

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

app.use(cors({
  origin: 'http://localhost:5173',
}))

app.use(express.json())

app.post('/api/chat', async (request, response) => {
  try {
    const { message } = request.body

    if (!message || typeof message !== 'string') {
      return response.status(400).json({
        error: 'Please enter a message.',
      })
    }

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'system',
          content: `You are VendorSaathi, a friendly AI business assistant for Indian street-food vendors.

Give practical and short advice about sales, inventory, profit, food wastage, and customer demand.

Use simple English or Hinglish when the user writes in Hinglish.

Do not use Markdown symbols such as **, #, bullet characters, tables, or numbered lists. Write plain, short sentences.

Do not invent vendor sales data. If the vendor has not provided their sales or inventory data, clearly say that your recommendation is a general estimate.

Never promise exact profit, loan approval, or guaranteed demand.Answer in 2 to 4 complete sentences. Never end with an incomplete sentence.`,
        },
        {
          role: 'user',
          content: message.slice(0, 1000),
        },
      ],
      temperature: 0.5,
      max_completion_tokens: 250,
    })

    const reply = completion.choices[0]?.message?.content
      || 'Sorry, I could not generate a response right now.'

    response.json({ reply })
  } catch (error) {
    console.error(error)

    response.status(500).json({
      error: 'VendorSaathi AI is temporarily unavailable. Please try again.',
    })
  }
})

app.listen(port, () => {
  console.log(`VendorSaathi API running at http://localhost:${port}`)
})