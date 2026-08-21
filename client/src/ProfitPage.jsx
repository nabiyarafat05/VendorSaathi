import { useState } from 'react'
import { Icon } from './InventoryIcons.jsx'
import './ProfitPage.css'

const money = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`

function ProfitMetric({ label, value, detail, tone }) {
  return <article className={`profit-metric ${tone}`}><p className="eyebrow">{label}</p><strong>{value}</strong><span>{detail}</span></article>
}

export default function ProfitPage() {
  const [sellingPrice, setSellingPrice] = useState(15)
  const [costPerItem, setCostPerItem] = useState(7)
  const [quantity, setQuantity] = useState(180)
  const revenue = sellingPrice * quantity
  const totalCost = costPerItem * quantity
  const profit = revenue - totalCost
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0
  const safeNumber = (value) => Math.max(0, Number(value) || 0)

  return <div className="page-content profit-page">
    <section className="profit-page-header"><div><p className="date-label">BUSINESS NUMBERS</p><h1>Profit &amp; Earnings</h1><p>Understand what you earn and where you can save.</p></div></section>
    <section className="profit-workspace"><article className="panel profit-calculator"><div className="panel-heading"><div><p className="eyebrow">LOCAL CALCULATOR</p><h2>Estimate your profit</h2></div><span className="calculator-mark">₹</span></div><p className="calculator-intro">Adjust the numbers below to see how each sale affects your earnings.</p><form className="profit-form"><label>Product<select value="Samosa" aria-label="Product" readOnly><option>Samosa</option></select></label><label>Selling price per item<input type="number" min="0" value={sellingPrice} onChange={(event) => setSellingPrice(safeNumber(event.target.value))} /><span className="input-prefix">₹</span></label><label>Cost per item<input type="number" min="0" value={costPerItem} onChange={(event) => setCostPerItem(safeNumber(event.target.value))} /><span className="input-prefix">₹</span></label><label>Expected quantity sold<input type="number" min="0" value={quantity} onChange={(event) => setQuantity(safeNumber(event.target.value))} /><span className="input-suffix">items</span></label></form></article><article className="panel profit-insight"><div className="ai-badge"><Icon name="sparkles" size={17} /></div><p className="eyebrow">VENDORSAATHI AI</p><h2>AI Profit Insight</h2><p>Preparing around 160 samosas instead of 180 on a rainy day could reduce potential wastage and protect approximately <strong>₹140 in ingredient costs.</strong></p><small>Estimate based on demo sales and weather data.</small></article></section>
  <section className="profit-metrics"><ProfitMetric label="REVENUE" value={money(revenue)} detail="Selling price × quantity" tone="revenue" /><ProfitMetric label="TOTAL COST" value={money(totalCost)} detail="Ingredient cost × quantity" tone="cost" /><ProfitMetric label="ESTIMATED PROFIT" value={money(profit)} detail="Revenue − total cost" tone="profit" /><ProfitMetric label="PROFIT MARGIN" value={`${margin.toFixed(1)}%`} detail="Profit as % of revenue" tone="margin" /></section>
  <section className="snapshot-grid"><article className="panel business-snapshot"><div className="panel-heading"><div><p className="eyebrow">TODAY</p><h2>Today's Business Snapshot</h2></div></div><div className="snapshot-items"><div><span>Average selling price</span><strong>₹15</strong></div><div><span>Average cost</span><strong>₹7</strong></div><div><span>Expected sales</span><strong>180</strong></div><div><span>Potential unsold stock</span><strong>20</strong></div></div></article><article className="panel weekly-savings"><p className="eyebrow">THIS WEEK</p><h2>Potential savings</h2><strong>₹620</strong><div className="savings-bar"><span /></div><small>Estimated opportunity from smarter preparation</small></article></section>
  </div>
}
