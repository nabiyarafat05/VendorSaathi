import { useState } from 'react'
import { Icon } from './InventoryIcons.jsx'
import './InventoryPage.css'

const inventoryItems = [
  ['Potatoes', '5 kg', '10 kg', 'Low', 'low'],
  ['Flour', '8 kg', '10 kg', 'Good', 'good'],
  ['Cooking Oil', '1.5 L', '4 L', 'Critical', 'critical'],
  ['Samosa Sheets', '250 pieces', '300 pieces', 'Low', 'low'],
  ['Tea', '3 kg', '3 kg', 'Good', 'good'],
  ['Sugar', '4 kg', '4 kg', 'Good', 'good'],
]

function SummaryCard({ label, value, tone }) {
  return <article className="inventory-summary-card"><p className="eyebrow">{label}</p><strong className={tone}>{value}</strong></article>
}

export default function InventoryPage() {
  const [showToast, setShowToast] = useState(false)
  const createRestockList = () => {
    setShowToast(true)
    window.setTimeout(() => setShowToast(false), 2400)
  }

  return <div className="page-content inventory-page">
    <section className="inventory-page-header"><div><p className="date-label">STOCK CONTROL</p><h1>Inventory</h1><p>Know what you have, what you need, and when to restock.</p></div><button className="primary-button" type="button" onClick={createRestockList}><Icon name="plus" size={16} /> Quick Restock</button></section>
    <section className="inventory-summary-grid"><SummaryCard label="ITEMS TRACKED" value="6" /><SummaryCard label="LOW STOCK" value="2" tone="low" /><SummaryCard label="CRITICAL" value="1" tone="critical" /><SummaryCard label="ESTIMATED STOCK VALUE" value="₹2,450" /></section>
    <section className="inventory-layout"><article className="panel inventory-table-panel"><div className="panel-heading"><div><p className="eyebrow">CURRENT STOCK</p><h2>Inventory overview</h2></div><span className="history-total">Updated today, 10:45 AM</span></div><div className="inventory-table"><div className="inventory-row inventory-head"><span>PRODUCT</span><span>CURRENT</span><span>RECOMMENDED</span><span>STATUS</span></div>{inventoryItems.map(([product, current, recommended, status, tone]) => <div className="inventory-row" key={product}><strong>{product}</strong><span>{current}</span><span>{recommended}</span><span><b className={`status-pill ${tone}`}>{status}</b></span></div>)}</div></article><article className="panel restock-card"><div className="ai-badge"><Icon name="sparkles" size={17} /></div><p className="eyebrow">AI RECOMMENDATION</p><h2>Restock Recommendation</h2><p>Based on your recent sales, your current inventory, and expected demand, consider restocking cooking oil and potatoes before tomorrow.</p><button className="text-button" type="button" onClick={createRestockList}>Create restock list <Icon name="arrow" size={15} /></button></article></section>
    {showToast && <div className="inventory-toast" role="status"><Icon name="support" size={16} /> Restock list created.</div>}
    <footer>© 2024 VendorSaathi <span>Built for vendors, with care.</span></footer>
  </div>
}
