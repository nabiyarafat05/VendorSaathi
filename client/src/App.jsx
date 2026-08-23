import { useEffect, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import InventoryPage from './InventoryPage.jsx'
import ProfitPage from './ProfitPage.jsx'
import AIAssistantPage from './AIAssistantPage.jsx'
import SchemesSupportPage from './SchemesSupportPage.jsx'
import { PRODUCTS, recordSale, fetchLedger, fetchRecommendation, fetchWeather } from './api.js'
import './App.css'
import './DashboardDesign.css'

const navItems = [
  ['dashboard', 'Dashboard'],
  ['chart', 'Sales & Demand'],
  ['box', 'Inventory'],
  ['wallet', 'Profit'],
  ['sparkles', 'AI Assistant'],
  ['support', 'Schemes & Support'],
]

const stats = [
  {
    label: "Today's Sales",
    value: '₹2,700',
    meta: '+12.5% from yesterday',
    icon: 'trending',
    tone: 'mint',
  },
  {
    label: 'Predicted Demand',
    value: '180',
    unit: 'samosas',
    meta: 'For tomorrow',
    icon: 'target',
    tone: 'yellow',
  },
  {
    label: 'Estimated Profit',
    value: '₹1,350',
    meta: '50% margin today',
    icon: 'coins',
    tone: 'peach',
  },
  {
    label: 'Inventory Status',
    value: '3',
    unit: 'items need attention',
    meta: 'Review inventory',
    icon: 'box',
    tone: 'blue',
  },
]

function Icon({ name, size = 18 }) {
  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5M4 19h17m-14-4 3-4 3 2 5-7" />
      </>
    ),
    box: (
      <>
        <path d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7m-8 4v10" />
      </>
    ),
    wallet: (
      <>
        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H19v16H6.5A2.5 2.5 0 0 1 4 17.5v-11ZM4 7h15" />
        <path d="M16 13h5v4h-5a2 2 0 1 1 0-4Z" />
      </>
    ),
    sparkles: (
      <path d="m12 3-1.2 4.8L6 9l4.8 1.2L12 15l1.2-4.8L18 9l-4.8-1.2L12 3Zm7 13-.6 2.4L16 19l2.4.6L19 22l.6-2.4L22 19l-2.4-.6L19 16Z" />
    ),
    support: (
      <>
        <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
        <path d="M4 14h3v5H5a1 1 0 0 1-1-1v-4Zm16 0h-3v5h2a1 1 0 0 0 1-1v-4Z" />
        <path d="M17 19c-1 2-5 2-6 2" />
      </>
    ),
    trending: (
      <>
        <path d="M4 16V4m0 12h17m-14-4 3-3 3 2 5-6m-3 0h3v3" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m10 8h-2M12 22v-2M2 12h2" />
      </>
    ),
    coins: (
      <>
        <circle cx="9" cy="9" r="5" />
        <path d="M15 7a5 5 0 1 1-3 9M9 7v4l2 1" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.3 11.3 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.6 6.4 19 5" />
      </>
    ),
    cloud: (
      <path d="M17.5 19H8a5 5 0 1 1 1.8-9.7A6 6 0 0 1 21 12.5a3.5 3.5 0 0 1-3.5 6.5Z" />
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    menu: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </>
    ),
    check: <path d="M20 6 9 17l-5-5" />,
  }

  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function StatCard({ stat }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${stat.tone}`}>
        <Icon name={stat.icon} size={20} />
      </div>
      <p className="eyebrow">{stat.label}</p>
      <div className="stat-value">
        {stat.value} <span>{stat.unit}</span>
      </div>
      <p className="stat-meta">{stat.meta}</p>
    </article>
  )
}

function SalesChart() {
  return (
    <div className="chart-wrap">
      <div className="chart-axis">
        <span>₹3k</span>
        <span>₹2k</span>
        <span>₹1k</span>
        <span>₹0</span>
      </div>
      <div className="chart-area">
        <div className="grid-lines">
          <i />
          <i />
          <i />
          <i />
        </div>
        <svg className="sales-chart" viewBox="0 0 700 210" preserveAspectRatio="none">
          <defs>
            <linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#ee8a4d" stopOpacity=".28" />
              <stop offset="1" stopColor="#ee8a4d" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 158 L116 120 L233 138 L350 72 L466 105 L583 28 L700 61 V210 H0Z"
            fill="url(#salesFill)"
          />
          <path
            d="M0 158 L116 120 L233 138 L350 72 L466 105 L583 28 L700 61"
            fill="none"
            stroke="#ed8147"
            strokeWidth="3"
          />
        </svg>
        <div className="chart-days">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function PageHeader({ children }) {
  return (
    <header className="topbar">
      <button className="mobile-menu" aria-label="Open menu">
        <Icon name="menu" />
      </button>
      <div className="breadcrumb">
        <span>Workspace</span>
        <i>/</i>
        <strong>{children}</strong>
      </div>
      <div className="top-actions">
        <button className="icon-button" aria-label="Notifications">
          <Icon name="bell" />
          <em />
        </button>
        <div className="top-avatar">R</div>
        <span className="top-name">Ravi Kumar</span>
        <span className="chevron">⌄</span>
      </div>
    </header>
  )
}

// ======================================================
// DASHBOARD
// ======================================================
// NOTE: weather integration below is UNCHANGED from the teammate's
// version — only the "Record a sale" buttons were given an
// onClick to navigate to the working form on Sales & Demand.

function DashboardPage({ onRecordSaleClick }) {
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [weatherError, setWeatherError] = useState(false)

  useEffect(() => {
    const loadWeather = async () => {
      try {
        setWeatherLoading(true)
        setWeatherError(false)
        const data = await fetchWeather()
        setWeather(data)
      } catch (error) {
        console.error('Weather fetch error:', error)
        setWeatherError(true)
      } finally {
        setWeatherLoading(false)
      }
    }
    loadWeather()
  }, [])

  const currentTemperature = weather ? Math.round(weather.temperature) : '--'
  const feelsLike = weather ? Math.round(weather.feelsLike) : '--'
  const humidity = weather ? weather.humidity : '--'
  const todayTemperature =
    weather?.today?.temperature ?? (weather ? Math.round(weather.temperature) : '--')
  const tomorrowTemperature = weather?.tomorrow?.temperature ?? '--'
  const tomorrowRainProbability = weather?.tomorrow?.rainProbability ?? 0
  const tomorrowDescription = weather?.tomorrow?.description || ''
  const tomorrowHasRain =
    weather?.tomorrow?.weatherMain?.toLowerCase().includes('rain') ||
    tomorrowRainProbability >= 40 ||
    tomorrowDescription.toLowerCase().includes('rain')
  const weatherAlert = tomorrowHasRain
    ? `Rain expected tomorrow${tomorrowRainProbability ? ` (${tomorrowRainProbability}% chance)` : ''}`
    : 'No significant rain expected tomorrow'
  const currentWeatherMain = weather?.weatherMain?.toLowerCase() || ''
  const isCurrentlySunny = currentWeatherMain.includes('clear')
  const isCurrentlyRainy =
    currentWeatherMain.includes('rain') || currentWeatherMain.includes('drizzle')
  const currentWeatherIcon = isCurrentlySunny ? 'sun' : isCurrentlyRainy ? 'cloud' : 'cloud'
  const tomorrowWeatherMain = weather?.tomorrow?.weatherMain?.toLowerCase() || ''
  const tomorrowIsSunny = tomorrowWeatherMain.includes('clear')
  const tomorrowIcon = tomorrowIsSunny ? 'sun' : 'cloud'

  return (
    <div className="page-content">
      <section className="welcome">
        <div>
          <p className="date-label">TUESDAY, 14 MAY 2024</p>
          <h1>
            Good morning, Ravi <span>✦</span>
          </h1>
          <p>Here’s what’s happening with your stall today.</p>
        </div>
        <button className="outline-button" onClick={onRecordSaleClick}>
          <Icon name="plus" size={17} />
          Record a sale
        </button>
      </section>

      <section className="stat-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="content-grid">
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">PERFORMANCE</p>
              <h2>Sales overview</h2>
            </div>
            <button className="select-button">
              This week <span>⌄</span>
            </button>
          </div>
          <div className="chart-summary">
            <strong>₹14,850</strong>
            <span>
              <b>↑ 8.4%</b> vs last week
            </span>
          </div>
          <SalesChart />
        </article>

        <article className="panel weather-panel">
          <div className="weather-top">
            <div>
              <p className="eyebrow">
                {weather?.city
                  ? `${weather.city.toUpperCase()}, ${weather.country || 'IN'}`
                  : 'LUCKNOW, IN'}
              </p>
              <h2>{weatherLoading ? 'Loading...' : 'Today'}</h2>
              <p className="weather-alert">
                {weatherLoading ? 'Checking weather...' : weatherAlert}
              </p>
              {weather?.demo && <small className="weather-demo">Demo weather data</small>}
              {weatherError && (
                <small className="weather-demo">Using fallback weather data</small>
              )}
            </div>
            <div className="weather-icon">
              <Icon name={currentWeatherIcon} size={35} />
              <Icon name="sun" size={22} />
            </div>
          </div>

          <div className="temperature">
            <strong>{currentTemperature}°</strong>
            <span>
              Feels like {feelsLike}°
              <br />
              Humidity {humidity}%
            </span>
          </div>

          <div className="forecast">
            <span>
              Today
              <b>
                <Icon name={currentWeatherIcon} size={16} />
                {todayTemperature}°
              </b>
            </span>
            <span>
              Tomorrow
              <b>
                <Icon name={tomorrowIcon} size={16} />
                {tomorrowTemperature}°
              </b>
            </span>
          </div>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="panel recommendation">
          <div className="recommendation-head">
            <div className="ai-badge">
              <Icon name="sparkles" size={17} />
            </div>
            <div>
              <p className="eyebrow">SAATHI SUGGESTS</p>
              <h2>A small change, a big impact</h2>
            </div>
          </div>
          <p className="recommendation-copy">
            {tomorrowHasRain ? (
              <>
                Rain is expected tomorrow. Consider preparing around{' '}
                <strong>150–160 samosas</strong> instead of your usual 190 to reduce the risk
                of unsold food.
              </>
            ) : (
              <>
                Weather looks favorable tomorrow. You can consider preparing close to your
                usual stock while monitoring actual customer demand.
              </>
            )}
          </p>
        </article>

        <article className="panel quick-actions">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">SHORTCUTS</p>
              <h2>Quick actions</h2>
            </div>
          </div>
          <div className="action-list">
            <button onClick={onRecordSaleClick}>
              <span className="action-icon sales">
                <Icon name="plus" />
              </span>
              <span>Record a sale</span>
              <Icon name="arrow" size={15} />
            </button>
            <button>
              <span className="action-icon stock">
                <Icon name="box" />
              </span>
              <span>Update inventory</span>
              <Icon name="arrow" size={15} />
            </button>
            <button>
              <span className="action-icon report">
                <Icon name="chart" />
              </span>
              <span>View full report</span>
              <Icon name="arrow" size={15} />
            </button>
          </div>
        </article>
      </section>

      <footer>
        © 2024 VendorSaathi
        <span>Built for vendors, with care.</span>
      </footer>
    </div>
  )
}

// ======================================================
// SALES & DEMAND
// ======================================================
// NOTE: this page previously had a stub form
// (onSubmit={(event) => event.preventDefault()}). It now actually
// calls POST /api/checkin via api.js, and shows real recent sales
// pulled from GET /api/ledger.

function SalesDemandPage() {
  const [product, setProduct] = useState('Samosa')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState(String(PRODUCTS.Samosa.unitPrice))
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [recentSales, setRecentSales] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Step 4: real predicted demand, replacing the old hardcoded 180.
  const [prediction, setPrediction] = useState(null)
  const [predictionLoading, setPredictionLoading] = useState(true)
  const [predictionError, setPredictionError] = useState(false)

  const loadPrediction = useCallback(async () => {
    try {
      setPredictionLoading(true)
      setPredictionError(false)
      const data = await fetchRecommendation('samosa,tea', 'none')
      setPrediction(data)
    } catch {
      setPredictionError(true)
    } finally {
      setPredictionLoading(false)
    }
  }, [])

  const loadHistory = useCallback(async () => {
    try {
      const ledger = await fetchLedger()
      const rows = ledger.days
        .slice()
        .reverse()
        .flatMap((day) =>
          day.items.map((item) => ({
            key: `${day.date}-${item.name}`,
            product: item.name === 'samosa' ? 'Samosa' : 'Masala Chai',
            quantity: `${item.sold} ${item.name === 'samosa' ? 'pcs' : 'cups'}`,
            amount: `₹${item.sold * item.unitPrice}`,
            date: day.date,
          }))
        )
        .slice(0, 6)
      setRecentSales(rows)
    } catch {
      // Non-fatal — recent sales list just stays empty.
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
    loadPrediction()
  }, [loadHistory, loadPrediction])

  const handleProductChange = (event) => {
    const value = event.target.value
    // "Samosa + Chai combo" isn't a real backend item yet — fall back
    // to Samosa's price rather than crashing on an undefined lookup.
    setProduct(value)
    setPrice(String(PRODUCTS[value]?.unitPrice ?? PRODUCTS.Samosa.unitPrice))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!PRODUCTS[product]) {
      setFeedback({
        type: 'error',
        message: `"${product}" isn't tracked as a sellable item yet — choose Samosa or Masala Chai.`,
      })
      return
    }

    if (!quantity || Number(quantity) <= 0) {
      setFeedback({ type: 'error', message: 'Enter a quantity greater than 0.' })
      return
    }

    setSaving(true)
    setFeedback(null)

    try {
      await recordSale({ product, quantity, price })
      setFeedback({ type: 'success', message: `Saved: ${quantity} × ${product}.` })
      setQuantity('')
      loadHistory()
      loadPrediction()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Could not save the sale.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-content sales-demand-page">
      <section className="sales-page-header">
        <div>
          <p className="date-label">BUSINESS INSIGHTS</p>
          <h1>Sales & Demand</h1>
          <p>Use your sales history to estimate future demand and prepare just the right amount.</p>
        </div>
      </section>

      <section className="content-grid">
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">LAST 7 DAYS</p>
              <h2>Weekly sales</h2>
            </div>
          </div>
          <SalesChart />
        </article>

        <article className="panel predicted-card">
          <div className="stat-icon yellow">
            <Icon name="target" size={20} />
          </div>
          <p className="eyebrow">PREDICTED DEMAND</p>
          {predictionLoading ? (
            <div className="predicted-number">
              …<span>loading</span>
            </div>
          ) : (
            <div className="predicted-number">
              {prediction?.recommendations?.find((r) => r.item === 'samosa')?.prepare ?? '--'}
              <span>samosas</span>
            </div>
          )}
          <p>
            {predictionError
              ? 'Could not load — showing last known value.'
              : prediction?.isDemoData
                ? 'For tomorrow (demo data)'
                : 'For tomorrow'}
          </p>
        </article>
      </section>

      {prediction && !predictionLoading && (
        <section className="panel" style={{ marginBottom: 18 }}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">WHY THIS PLAN?</p>
              <h2>How Saathi calculated this</h2>
            </div>
          </div>
          <ul style={{ margin: '14px 0 0', paddingLeft: 18, color: '#5d6b63', fontSize: '12px', lineHeight: 1.9 }}>
            {prediction.reasonSummary.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel sale-entry">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">QUICK ENTRY</p>
            <h2>Add a sale</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Product
            <select value={product} onChange={handleProductChange}>
              <option>Samosa</option>
              <option>Masala Chai</option>
              <option>Samosa + Chai combo</option>
            </select>
          </label>

          <label>
            Quantity sold
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </label>

          <label>
            Selling price
            <input
              type="number"
              min="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </label>

          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save sale'}
            <Icon name="arrow" size={15} />
          </button>
        </form>

        {feedback && (
          <p
            className={feedback.type === 'success' ? 'form-feedback success' : 'form-feedback error'}
            role="status"
          >
            {feedback.type === 'success' && <Icon name="check" size={14} />} {feedback.message}
          </p>
        )}
      </section>

      <section className="panel recent-sales">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">RECENT ACTIVITY</p>
            <h2>Recent sales</h2>
          </div>
        </div>

        <div className="sales-table">
          <div className="sales-row table-head">
            <span>PRODUCT</span>
            <span>QUANTITY</span>
            <span>AMOUNT</span>
            <span>DATE</span>
          </div>

          {loadingHistory && (
            <p style={{ padding: '14px 0', color: '#95a39c', fontSize: '11px' }}>Loading…</p>
          )}

          {!loadingHistory && recentSales.length === 0 && (
            <p style={{ padding: '14px 0', color: '#95a39c', fontSize: '11px' }}>
              No sales recorded yet — add one above.
            </p>
          )}

          {recentSales.map((row) => (
            <div className="sales-row" key={row.key}>
              <span className="item-name">{row.product}</span>
              <span className="muted">{row.quantity}</span>
              <strong>{row.amount}</strong>
              <span className="muted">{row.date}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ======================================================
// MAIN APP
// ======================================================

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const path = location.pathname

  const activeNav =
    path === '/sales-demand'
      ? 'Sales & Demand'
      : path === '/inventory'
        ? 'Inventory'
        : path === '/profit'
          ? 'Profit'
          : path === '/ai-assistant'
            ? 'AI Assistant'
            : path === '/schemes-support'
              ? 'Schemes & Support'
              : 'Dashboard'

  const navigateTo = (label) => {
    const routes = {
      Dashboard: '/',
      'Sales & Demand': '/sales-demand',
      Inventory: '/inventory',
      Profit: '/profit',
      'AI Assistant': '/ai-assistant',
      'Schemes & Support': '/schemes-support',
    }
    navigate(routes[label])
  }

  const goToRecordSale = () => navigate('/sales-demand')

  const pageForPath =
    path === '/sales-demand'
      ? <SalesDemandPage />
      : path === '/inventory'
        ? <InventoryPage />
        : path === '/profit'
          ? <ProfitPage />
          : path === '/ai-assistant'
            ? <AIAssistantPage />
            : path === '/schemes-support'
              ? <SchemesSupportPage />
              : <DashboardPage onRecordSaleClick={goToRecordSale} />

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">V</div>
          <div>
            <strong>
              Vendor<span>Saathi</span>
            </strong>
            <small>YOUR BUSINESS COMPANION</small>
          </div>
        </div>

        <nav aria-label="Main navigation">
          <p className="nav-label">MENU</p>
          {navItems.map(([icon, label]) => (
            <button
              className={activeNav === label ? 'nav-item active' : 'nav-item'}
              key={label}
              onClick={() => navigateTo(label)}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {label === 'AI Assistant' && <b>New</b>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-box">
            <div className="help-icon">
              <Icon name="support" size={16} />
            </div>
            <strong>Need a little help?</strong>
            <p>Our guides can help you grow.</p>
          </div>

          <div className="profile">
            <div className="avatar">R</div>
            <div>
              <strong>Ravi Kumar</strong>
              <span>Samosa & Chai Stall</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <PageHeader>{activeNav}</PageHeader>
        {pageForPath}
      </main>
    </div>
  )
}

export default App
