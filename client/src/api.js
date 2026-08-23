const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// Central place for product metadata the frontend needs (unit price is
// required by /api/checkin so revenue/waste-value can be computed).
// Keep this in sync with demoUnitPrices in the backend's demoData.mjs.
export const PRODUCTS = {
  Samosa: { itemName: 'samosa', unitPrice: 12 },
  'Masala Chai': { itemName: 'tea', unitPrice: 10 },
}

/**
 * Records a single sale. leftover defaults to 0 since the quick-entry
 * form only captures what sold — the fuller daily check-in (with
 * leftovers + expenses) can reuse this same endpoint later.
 */
export async function recordSale({ product, quantity, price }) {
  const meta = PRODUCTS[product]
  if (!meta) throw new Error(`Unknown product "${product}".`)

  const today = new Date().toISOString().slice(0, 10)

  const response = await fetch(`${API_BASE}/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date: today,
      items: [
        {
          name: meta.itemName,
          sold: Number(quantity),
          leftover: 0,
          unitPrice: Number(price) || meta.unitPrice,
        },
      ],
      expenses: 0,
    }),
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Could not record sale.')
  return data
}

export async function fetchLedger() {
  const response = await fetch(`${API_BASE}/ledger`)
  if (!response.ok) throw new Error('Could not load ledger.')
  return response.json()
}

export async function fetchRecommendation(items = 'samosa,tea', event = 'none') {
  const response = await fetch(`${API_BASE}/recommendation?items=${items}&event=${event}`)
  if (!response.ok) throw new Error('Could not load recommendation.')
  return response.json()
}

export async function fetchInventory() {
  const response = await fetch(`${API_BASE}/inventory`)
  if (!response.ok) throw new Error('Could not load inventory.')
  return response.json()
}