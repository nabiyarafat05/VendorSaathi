import { useState, useEffect, useCallback } from 'react'
import { Icon } from './InventoryIcons.jsx'
import './ProfitPage.css'

const API_BASE = 'http://localhost:3001/api'

const money = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`

function ProfitMetric({ label, value, detail, tone }) {
  return (
    <article className={`profit-metric ${tone}`}>
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  )
}

export default function ProfitPage() {
  const [profitData, setProfitData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // "What-if" calculator — still a manual tool by design (the guide
  // treats this as an interactive estimator), but now DEFAULTS to real
  // cost/price data instead of hardcoded ₹15 / ₹7 / 180 once it loads.
  const [sellingPrice, setSellingPrice] = useState(15)
  const [costPerItem, setCostPerItem] = useState(7)
  const [quantity, setQuantity] = useState(180)
  const [defaultsApplied, setDefaultsApplied] = useState(false)

  const loadProfit = useCallback(async () => {
    try {
      setLoading(true)
      setError(false)
      const response = await fetch(`${API_BASE}/profit`)
      if (!response.ok) throw new Error('Could not load profit data.')
      const data = await response.json()
      setProfitData(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfit()
  }, [loadProfit])

  // Apply real defaults to the calculator once, the first time data
  // arrives — after that the user's own edits take over, so we don't
  // fight them by resetting on every background refresh.
  useEffect(() => {
    if (profitData && !defaultsApplied) {
      setSellingPrice(profitData.avgSellingPrice)
      setCostPerItem(profitData.costPerUnit.samosa)
      setQuantity(profitData.expectedSalesTomorrow)
      setDefaultsApplied(true)
    }
  }, [profitData, defaultsApplied])

  const revenue = sellingPrice * quantity
  const totalCost = costPerItem * quantity
  const profit = revenue - totalCost
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0
  const safeNumber = (value) => Math.max(0, Number(value) || 0)

  return (
    <div className="page-content profit-page">
      <section className="profit-page-header">
        <div>
          <p className="date-label">BUSINESS NUMBERS</p>
          <h1>Profit &amp; Earnings</h1>
          <p>Understand what you earn and where you can save.</p>
        </div>
      </section>

      <section className="profit-workspace">
        <article className="panel profit-calculator">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">LOCAL CALCULATOR</p>
              <h2>Estimate your profit</h2>
            </div>
            <span className="calculator-mark">₹</span>
          </div>
          <p className="calculator-intro">
            Adjust the numbers below to see how each sale affects your earnings.
            {defaultsApplied && " Pre-filled with your real average price, cost, and tomorrow's expected quantity."}
          </p>
          <form className="profit-form">
            <label>
              Product
              <select value="Samosa" aria-label="Product" readOnly>
                <option>Samosa</option>
              </select>
            </label>
            <label>
              Selling price per item
              <input
                type="number"
                min="0"
                value={sellingPrice}
                onChange={(event) => setSellingPrice(safeNumber(event.target.value))}
              />
              <span className="input-prefix">₹</span>
            </label>
            <label>
              Cost per item
              <input
                type="number"
                min="0"
                value={costPerItem}
                onChange={(event) => setCostPerItem(safeNumber(event.target.value))}
              />
              <span className="input-prefix">₹</span>
            </label>
            <label>
              Expected quantity sold
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(event) => setQuantity(safeNumber(event.target.value))}
              />
              <span className="input-suffix">items</span>
            </label>
          </form>
        </article>

        <article className="panel profit-insight">
          <div className="ai-badge">
            <Icon name="sparkles" size={17} />
          </div>
          <p className="eyebrow">VENDORSAATHI AI</p>
          <h2>AI Profit Insight</h2>
          {loading ? (
            <p>Loading…</p>
          ) : error || !profitData ? (
            <p>Could not load a fresh insight right now — the calculator above still works with your own numbers.</p>
          ) : (
            <>
              <p>
                {profitData.insight.changePercent < 0 ? (
                  <>
                    Preparing {profitData.expectedSalesTomorrow} samosas instead of your recent average could
                    reduce potential wastage and protect approximately{' '}
                    <strong>{money(profitData.estimatedWasteAvoidedTomorrow)} in ingredient costs.</strong>
                  </>
                ) : (
                  <>
                    Demand looks steady or higher for tomorrow — preparing around{' '}
                    <strong>{profitData.expectedSalesTomorrow} samosas</strong> should match expected sales
                    without over- or under-preparing.
                  </>
                )}
              </p>
              <small>
                {profitData.insight.isDemoData
                  ? 'Estimate based on demo weather and your recorded sales.'
                  : "Estimate based on tomorrow's real weather forecast and your recorded sales."}
              </small>
            </>
          )}
        </article>
      </section>

      <section className="profit-metrics">
        <ProfitMetric label="REVENUE" value={money(revenue)} detail="Selling price × quantity" tone="revenue" />
        <ProfitMetric label="TOTAL COST" value={money(totalCost)} detail="Ingredient cost × quantity" tone="cost" />
        <ProfitMetric label="ESTIMATED PROFIT" value={money(profit)} detail="Revenue − total cost" tone="profit" />
        <ProfitMetric label="PROFIT MARGIN" value={`${margin.toFixed(1)}%`} detail="Profit as % of revenue" tone="margin" />
      </section>

      <section className="snapshot-grid">
        <article className="panel business-snapshot">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">LAST 7 DAYS</p>
              <h2>Business Snapshot</h2>
            </div>
          </div>
          <div className="snapshot-items">
            <div>
              <span>Average selling price</span>
              <strong>{loading || !profitData ? '—' : money(profitData.avgSellingPrice)}</strong>
            </div>
            <div>
              <span>Average cost</span>
              <strong>{loading || !profitData ? '—' : money(profitData.costPerUnit.samosa)}</strong>
            </div>
            <div>
              <span>Expected sales (tomorrow)</span>
              <strong>{loading || !profitData ? '—' : profitData.expectedSalesTomorrow}</strong>
            </div>
            <div>
              <span>Avg. unsold stock</span>
              <strong>{loading || !profitData ? '—' : profitData.avgLeftover}</strong>
            </div>
          </div>
        </article>

        <article className="panel weekly-savings">
          <p className="eyebrow">THIS WEEK</p>
          <h2>Weekly profit</h2>
          <strong>{loading || !profitData ? '—' : money(profitData.weeklyProfit)}</strong>
          <div className="savings-bar">
            <span
              style={{
                width: profitData && profitData.weeklyRevenue > 0
                  ? `${Math.min(100, Math.round((profitData.weeklyProfit / profitData.weeklyRevenue) * 100))}%`
                  : '0%',
              }}
            />
          </div>
          <small>
            {loading || !profitData
              ? 'Loading…'
              : `Revenue ${money(profitData.weeklyRevenue)} − expenses ${money(profitData.weeklyExpenses)}, last 7 days`}
          </small>
        </article>
      </section>
    </div>
  )
}
