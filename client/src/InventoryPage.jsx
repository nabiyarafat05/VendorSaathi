import { useState, useEffect, useCallback } from 'react'
import { Icon } from './InventoryIcons.jsx'
import './InventoryPage.css'

const API_BASE = 'http://localhost:3001/api'

function SummaryCard({ label, value, tone }) {
  return <article className="inventory-summary-card"><p className="eyebrow">{label}</p><strong className={tone}>{value}</strong></article>
}

const STATUS_LABEL = { good: 'Good', low: 'Low', critical: 'Critical' }

export default function InventoryPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const fetchInventory = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch(`${API_BASE}/inventory`)
      if (!response.ok) throw new Error('Could not load inventory.')
      const data = await response.json()
      setSummary(data)
    } catch (err) {
      setError(err.message || 'Could not load inventory.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2400)
  }

  // Quick Restock: tops up every low/critical item to its threshold in
  // one call. A real "add specific quantity" flow can replace this later,
  // but this keeps the button meaningful right now instead of decorative.
  const createRestockList = async () => {
    if (!summary) return

    const toRestock = summary.items.filter((item) => item.status !== 'good')
    if (toRestock.length === 0) {
      showToast('Everything is already well stocked.')
      return
    }

    try {
      await Promise.all(
        toRestock.map((item) =>
          fetch(`${API_BASE}/inventory/restock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item.id, quantity: item.threshold - item.quantity }),
          })
        )
      )
      await fetchInventory()
      showToast(`Restocked ${toRestock.length} item${toRestock.length > 1 ? 's' : ''}.`)
    } catch {
      showToast('Restock failed — check the server connection.')
    }
  }

  if (loading) {
    return (
      <div className="page-content inventory-page">
        <p>Loading inventory…</p>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="page-content inventory-page">
        <p>{error || 'Inventory unavailable.'}</p>
        <button className="outline-button" type="button" onClick={fetchInventory}>Retry</button>
      </div>
    )
  }

  const restockNeeded = summary.items.filter((item) => item.status !== 'good')
  const restockCopy = restockNeeded.length > 0
    ? `Based on current stock levels, consider restocking ${restockNeeded.map((i) => i.name.toLowerCase()).join(' and ')} before tomorrow.`
    : 'All tracked items are currently at healthy stock levels.'

  return <div className="page-content inventory-page">
    <section className="inventory-page-header"><div><p className="date-label">STOCK CONTROL</p><h1>Inventory</h1><p>Know what you have, what you need, and when to restock.</p></div><button className="primary-button" type="button" onClick={createRestockList}><Icon name="plus" size={16} /> Quick Restock</button></section>
    <section className="inventory-summary-grid">
      <SummaryCard label="ITEMS TRACKED" value={summary.itemsTracked} />
      <SummaryCard label="LOW STOCK" value={summary.lowCount} tone="low" />
      <SummaryCard label="CRITICAL" value={summary.criticalCount} tone="critical" />
      <SummaryCard label="ESTIMATED STOCK VALUE" value={`₹${summary.estimatedValue.toLocaleString('en-IN')}`} />
    </section>
    <section className="inventory-layout">
      <article className="panel inventory-table-panel">
        <div className="panel-heading"><div><p className="eyebrow">CURRENT STOCK</p><h2>Inventory overview</h2></div></div>
        <div className="inventory-table">
          <div className="inventory-row inventory-head"><span>PRODUCT</span><span>CURRENT</span><span>RECOMMENDED</span><span>STATUS</span></div>
          {summary.items.map((item) => (
            <div className="inventory-row" key={item.id}>
              <strong>{item.name}</strong>
              <span>{item.quantity} {item.unit}</span>
              <span>{item.threshold} {item.unit}</span>
              <span><b className={`status-pill ${item.status}`}>{STATUS_LABEL[item.status]}</b></span>
            </div>
          ))}
        </div>
      </article>
      <article className="panel restock-card">
        <div className="ai-badge"><Icon name="sparkles" size={17} /></div>
        <p className="eyebrow">AI RECOMMENDATION</p>
        <h2>Restock Recommendation</h2>
        <p>{restockCopy}</p>
        <button className="text-button" type="button" onClick={createRestockList}>Create restock list <Icon name="arrow" size={15} /></button>
      </article>
    </section>
    {toast && <div className="inventory-toast" role="status"><Icon name="support" size={16} /> {toast}</div>}
    <footer>© 2024 VendorSaathi <span>Built for vendors, with care.</span></footer>
  </div>
}
