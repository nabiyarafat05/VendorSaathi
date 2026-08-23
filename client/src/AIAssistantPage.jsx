import { useState } from 'react'
import { Icon } from './InventoryIcons.jsx'
import './AIAssistantPage.css'

// See api.js for the same VITE_API_BASE_URL pattern — set in the
// client's Vercel project settings for production.
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3001/api'

const quickQuestions = [
  'How many samosas should I prepare tomorrow?',
  'What should I restock today?',
  'How can I reduce food wastage?',
  'How much profit can I make tomorrow?',
]

function Message({ message }) {
  return (
    <div className={`chat-message ${message.role}`}>
      <div className="message-avatar">
        {message.role === 'ai' ? <Icon name="sparkles" size={14} /> : 'R'}
      </div>

      <div className="message-content">
        <p>{message.text}</p>
        <time>{message.time}</time>
      </div>
    </div>
  )
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: 'Namaste Ravi! I can help you make smarter decisions about your stall today. What would you like to know?',
      time: 'Just now',
    },
  ])

  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState('')

  const sendMessage = async (question = input) => {
    const trimmedQuestion = question.trim()

    if (!trimmedQuestion || sending) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: trimmedQuestion,
      time: 'Just now',
    }

    setMessages((current) => [...current, userMessage])
    setInput('')
    setSelectedQuestion(trimmedQuestion)
    setSending(true)

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedQuestion,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to get an AI response.')
      }

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: data.reply,
          time: 'Just now',
        },
      ])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: error.message || 'Sorry, VendorSaathi AI is unavailable right now.',
          time: 'Just now',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="page-content ai-page">
      <section className="ai-page-header">
        <div>
          <p className="date-label">YOUR BUSINESS COMPANION</p>
          <h1>VendorSaathi AI</h1>
          <p>Your everyday business assistant.</p>
        </div>

        <span className="ai-ready">
          <i /> AI Assistant <b>• Ready</b>
        </span>
      </section>

      <section className="ai-intro panel">
        <div className="ai-hero-mark">
          <Icon name="sparkles" size={22} />
        </div>

        <div>
          <p className="eyebrow">🤖 VENDORSAATHI AI</p>
          <h2>Ask me about your sales, stock, pricing, or tomorrow's preparation.</h2>
        </div>
      </section>

      <section className="ai-chat-layout">
        <article className="panel chat-panel">
          <div className="chat-heading">
            <div>
              <p className="eyebrow">CONVERSATION</p>
              <h2>How can I help today?</h2>
            </div>

            <span className="chat-status">
              <i /> Online
            </span>
          </div>

          <div className="messages" aria-live="polite">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}

            {sending && (
              <div className="chat-message ai">
                <div className="message-avatar">
                  <Icon name="sparkles" size={14} />
                </div>

                <div className="typing-indicator">
                  <i /><i /><i />
                </div>
              </div>
            )}
          </div>

          <form
            className="chat-form"
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage()
            }}
          >
            <input
              aria-label="Ask VendorSaathi AI"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about your business..."
              disabled={sending}
            />

            <button
              type="submit"
              aria-label="Send message"
              disabled={sending || !input.trim()}
            >
              <Icon name="arrow" size={17} />
            </button>
          </form>
        </article>

        <aside className="quick-questions panel">
          <p className="eyebrow">QUICK QUESTIONS</p>
          <h2>Start with a question</h2>

          <div>
            {quickQuestions.map((question) => (
              <button
                className={selectedQuestion === question ? 'quick-question selected' : 'quick-question'}
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                disabled={sending}
              >
                <span>{question}</span>
                <Icon name="arrow" size={14} />
              </button>
            ))}
          </div>
        </aside>
      </section>

      <p className="ai-disclaimer">
        AI recommendations are estimates based on the information available and should be used as decision support.
      </p>
    </div>
  )
}
