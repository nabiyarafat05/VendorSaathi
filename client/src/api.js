const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3001/api'

// Central place for product metadata
export const PRODUCTS = {
  Samosa: {
    itemName: 'samosa',
    unitPrice: 12,
  },

  'Masala Chai': {
    itemName: 'tea',
    unitPrice: 10,
  },
}

// ================================
// RECORD SALE
// ================================

export async function recordSale({
  product,
  quantity,
  price,
}) {
  const meta = PRODUCTS[product]

  if (!meta) {
    throw new Error(
      `Unknown product "${product}".`
    )
  }

  const today =
    new Date().toISOString().slice(0, 10)

  const response = await fetch(
    `${API_BASE}/checkin`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        date: today,

        items: [
          {
            name: meta.itemName,
            sold: Number(quantity),
            leftover: 0,
            unitPrice:
              Number(price) || meta.unitPrice,
          },
        ],

        expenses: 0,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.error || 'Could not record sale.'
    )
  }

  return data
}

// ================================
// LEDGER
// ================================

export async function fetchLedger() {
  const response = await fetch(
    `${API_BASE}/ledger`
  )

  if (!response.ok) {
    throw new Error(
      'Could not load ledger.'
    )
  }

  return response.json()
}

// ================================
// AI RECOMMENDATION
// ================================

export async function fetchRecommendation(
  items = 'samosa,tea',
  event = 'none'
) {
  const response = await fetch(
    `${API_BASE}/recommendation?items=${items}&event=${event}`
  )

  if (!response.ok) {
    throw new Error(
      'Could not load recommendation.'
    )
  }

  return response.json()
}

// ================================
// INVENTORY
// ================================

export async function fetchInventory() {
  const response = await fetch(
    `${API_BASE}/inventory`
  )

  if (!response.ok) {
    throw new Error(
      'Could not load inventory.'
    )
  }

  return response.json()
}

// ================================
// PROFIT
// ================================

export async function fetchProfit() {
  const response = await fetch(
    `${API_BASE}/profit`
  )

  if (!response.ok) {
    throw new Error(
      'Could not load profit data.'
    )
  }

  return response.json()
}

// ================================
// WEATHER
// ================================

export async function fetchWeather() {
  try {
    const response = await fetch(
      `${API_BASE}/weather`
    )

    if (!response.ok) {
      throw new Error(
        'Could not load weather data.'
      )
    }

    return await response.json()
  } catch (error) {
    console.error(
      'Weather fetch error:',
      error
    )

    throw error
  }
}

// ================================
// AI CHAT
// ================================

export async function sendChatMessage(
  message
) {
  const response = await fetch(
    `${API_BASE}/chat`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        message,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.error ||
        'VendorSaathi AI is temporarily unavailable.'
    )
  }

  return data
}