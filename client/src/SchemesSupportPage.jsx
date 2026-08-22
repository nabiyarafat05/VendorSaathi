import { useState } from 'react'
import { Icon } from './InventoryIcons.jsx'
import './SchemesSupportPage.css'

const questions = [
  {
    id: 'vendor',
    title: 'Do you run a street-vending business?',
    description: 'For example, a food cart, tea stall, fruit cart, or roadside shop.',
  },
  {
    id: 'identity',
    title: 'Do you have a valid identity document?',
    description: 'For example, Aadhaar or another government-issued ID.',
  },
  {
    id: 'bank',
    title: 'Do you have an active bank account?',
    description: 'A bank account may be needed for financial-support applications.',
  },
  {
    id: 'proof',
    title: 'Do you have vending-related proof or local documentation?',
    description: 'For example, a vending certificate or local-body document.',
  },
]

export default function SchemesSupportPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [completed, setCompleted] = useState(false)

  const question = questions[step]
  const selectedAnswer = answers[question.id]

  const selectAnswer = (answer) => {
    setAnswers((current) => ({ ...current, [question.id]: answer }))
  }

  const continueFlow = () => {
    if (step === questions.length - 1) {
      setCompleted(true)
    } else {
      setStep((current) => current + 1)
    }
  }

  const restart = () => {
    setStep(0)
    setAnswers({})
    setCompleted(false)
  }

  const likelyVendor = answers.vendor === 'yes'
  const hasBasicDocuments = answers.identity === 'yes' && answers.bank === 'yes'

  return (
    <div className="page-content schemes-page">
      <section className="schemes-page-header">
        <div>
          <p className="date-label">SUPPORT FOR YOUR BUSINESS</p>
          <h1>Schemes & Support</h1>
          <p>Answer a few simple questions to understand possible next steps.</p>
        </div>
        <div className="scheme-header-icon">
          <Icon name="support" size={24} />
        </div>
      </section>

      {!completed ? (
        <section className="panel scheme-question-card">
          <div className="scheme-progress">
            <span>STEP {step + 1} OF {questions.length}</span>
            <div className="progress-track">
              <i style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
            </div>
          </div>

          <div className="scheme-question-icon">
            <Icon name="support" size={22} />
          </div>

          <h2>{question.title}</h2>
          <p>{question.description}</p>

          <div className="scheme-options">
            <button
              type="button"
              className={selectedAnswer === 'yes' ? 'selected' : ''}
              onClick={() => selectAnswer('yes')}
            >
              Yes
            </button>

            <button
              type="button"
              className={selectedAnswer === 'no' ? 'selected' : ''}
              onClick={() => selectAnswer('no')}
            >
              No
            </button>
          </div>

          <div className="scheme-actions">
            {step > 0 && (
              <button
                type="button"
                className="outline-button"
                onClick={() => setStep((current) => current - 1)}
              >
                Back
              </button>
            )}

            <button
              type="button"
              className="primary-button"
              disabled={!selectedAnswer}
              onClick={continueFlow}
            >
              {step === questions.length - 1 ? 'See guidance' : 'Continue'}
              <Icon name="arrow" size={15} />
            </button>
          </div>
        </section>
      ) : (
        <section className="panel scheme-result-card">
          <div className="result-badge">
            <Icon name="sparkles" size={20} />
          </div>

          <p className="eyebrow">GUIDANCE RESULT</p>

          {likelyVendor && hasBasicDocuments ? (
            <>
              <h2>You may explore vendor-support schemes</h2>
              <p>
                Based on your answers, you may be ready to explore PM SVANidhi-style
                vendor support. Verify the latest eligibility through official channels.
              </p>
            </>
          ) : (
            <>
              <h2>Prepare your details before applying</h2>
              <p>
                Keep your identity, bank, and vending-related documents ready before
                exploring formal vendor-support options.
              </p>
            </>
          )}

          <div className="documents-list">
            <h3>Your preparation checklist</h3>
            <p className={answers.identity === 'yes' ? 'done' : ''}>
              {answers.identity === 'yes' ? '✓' : '○'} Identity document
            </p>
            <p className={answers.bank === 'yes' ? 'done' : ''}>
              {answers.bank === 'yes' ? '✓' : '○'} Active bank account details
            </p>
            <p className={answers.proof === 'yes' ? 'done' : ''}>
              {answers.proof === 'yes' ? '✓' : '○'} Vending proof or local documentation
            </p>
          </div>
          <div className="scheme-next-steps">
  <h3>What to do next</h3>
  <ol>
    <li>Keep your identity, bank, and vending-related documents ready.</li>
    <li>Visit your local Nagar Nigam / Urban Local Body for guidance.</li>
    <li>Use the official PM SVANidhi portal to verify the latest process.</li>
  </ol>
</div>

<div className="scheme-disclaimer">
  <strong>Important:</strong> This is indicative guidance only. It is not a
  loan approval or official eligibility decision.
</div>

<div className="scheme-result-actions">
  <a
    className="primary-button scheme-portal-button"
    href="https://pmsvanidhi.mohua.gov.in"
    target="_blank"
    rel="noreferrer"
  >
    Open Official Portal
    <Icon name="arrow" size={15} />
  </a>

  <button type="button" className="outline-button" onClick={restart}>
    Check again
  </button>
</div>
        </section>
      )}
    </div>
  )
}