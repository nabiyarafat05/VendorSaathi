import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import InventoryPage from './InventoryPage.jsx'
import ProfitPage from './ProfitPage.jsx'
import AIAssistantPage from './AIAssistantPage.jsx'
import SchemesSupportPage from './SchemesSupportPage.jsx'
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
  { label: "Today's Sales", value: '₹2,700', meta: '+12.5% from yesterday', icon: 'trending', tone: 'mint' },
  { label: 'Predicted Demand', value: '180', unit: 'samosas', meta: 'For tomorrow', icon: 'target', tone: 'yellow' },
  { label: 'Estimated Profit', value: '₹1,350', meta: '50% margin today', icon: 'coins', tone: 'peach' },
  { label: 'Inventory Status', value: '3', unit: 'items need attention', meta: 'Review inventory', icon: 'box', tone: 'blue' },
]

const salesHistory = [
  ['Samosa', '24 pcs', '₹480', '14 May, 10:42 AM'],
  ['Masala Chai', '18 cups', '₹360', '14 May, 10:18 AM'],
  ['Samosa + Chai combo', '12 combos', '₹360', '13 May, 6:35 PM'],
  ['Samosa', '42 pcs', '₹840', '13 May, 1:15 PM'],
  ['Masala Chai', '31 cups', '₹620', '12 May, 5:50 PM'],
]

function Icon({ name, size = 18 }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    chart: <><path d="M4 19V5M4 19h17m-14-4 3-4 3 2 5-7" /></>,
    box: <><path d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7m-8 4v10" /></>,
    wallet: <><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H19v16H6.5A2.5 2.5 0 0 1 4 17.5v-11ZM4 7h15" /><path d="M16 13h5v4h-5a2 2 0 1 1 0-4Z" /></>,
    sparkles: <path d="m12 3-1.2 4.8L6 9l4.8 1.2L12 15l1.2-4.8L18 9l-4.8-1.2L12 3Zm7 13-.6 2.4L16 19l2.4.6L19 22l.6-2.4L22 19l-2.4-.6L19 16Z" />,
    support: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M4 14h3v5H5a1 1 0 0 1-1-1v-4Zm16 0h-3v5h2a1 1 0 0 0 1-1v-4Z" /><path d="M17 19c-1 2-5 2-6 2" /></>,
    trending: <><path d="M4 16V4m0 12h17m-14-4 3-3 3 2 5-6m-3 0h3v3" /></>,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><path d="M12 2v2m10 8h-2M12 22v-2M2 12h2" /></>,
    coins: <><circle cx="9" cy="9" r="5" /><path d="M15 7a5 5 0 1 1-3 9M9 7v4l2 1" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.3 11.3 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.6 6.4 19 5" /></>,
    cloud: <path d="M17.5 19H8a5 5 0 1 1 1.8-9.7A6 6 0 0 1 21 12.5a3.5 3.5 0 0 1-3.5 6.5Z" />,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  }

  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

function StatCard({ stat }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${stat.tone}`}><Icon name={stat.icon} size={20} /></div>
      <p className="eyebrow">{stat.label}</p>
      <div className="stat-value">{stat.value} <span>{stat.unit}</span></div>
      <p className="stat-meta">{stat.meta}</p>
    </article>
  )
}

function SalesChart() {
  return (
    <div className="chart-wrap">
      <div className="chart-axis"><span>₹3k</span><span>₹2k</span><span>₹1k</span><span>₹0</span></div>
      <div className="chart-area">
        <div className="grid-lines"><i /><i /><i /><i /></div>
        <svg className="sales-chart" viewBox="0 0 700 210" preserveAspectRatio="none">
          <defs>
            <linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#ee8a4d" stopOpacity=".28" />
              <stop offset="1" stopColor="#ee8a4d" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 158 L116 120 L233 138 L350 72 L466 105 L583 28 L700 61 V210 H0Z" fill="url(#salesFill)" />
          <path d="M0 158 L116 120 L233 138 L350 72 L466 105 L583 28 L700 61" fill="none" stroke="#ed8147" strokeWidth="3" />
        </svg>
        <div className="chart-days">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div>
      </div>
    </div>
  )
}

function PageHeader({ children }) {
  return (
    <header className="topbar">
      <button className="mobile-menu" aria-label="Open menu"><Icon name="menu" /></button>
      <div className="breadcrumb"><span>Workspace</span><i>/</i><strong>{children}</strong></div>
      <div className="top-actions">
        <button className="icon-button" aria-label="Notifications"><Icon name="bell" /><em /></button>
        <div className="top-avatar">R</div>
        <span className="top-name">Ravi Kumar</span>
        <span className="chevron">⌄</span>
      </div>
    </header>
  )
}

function DashboardPage() {
  return (
    <div className="page-content">
      <section className="welcome">
        <div>
          <p className="date-label">TUESDAY, 14 MAY 2024</p>
          <h1>Good morning, Ravi <span>✦</span></h1>
          <p>Here’s what’s happening with your stall today.</p>
        </div>
        <button className="outline-button"><Icon name="plus" size={17} /> Record a sale</button>
      </section>

      <section className="stat-grid">{stats.map((stat) => <StatCard key={stat.label} stat={stat} />)}</section>

      <section className="content-grid">
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">PERFORMANCE</p><h2>Sales overview</h2></div>
            <button className="select-button">This week <span>⌄</span></button>
          </div>
          <div className="chart-summary"><strong>₹14,850</strong><span><b>↑ 8.4%</b> vs last week</span></div>
          <SalesChart />
        </article>

        <article className="panel weather-panel">
          <div className="weather-top">
            <div><p className="eyebrow">LUCKNOW, IN</p><h2>Wednesday</h2><p className="weather-alert">Rain expected tomorrow</p></div>
            <div className="weather-icon"><Icon name="cloud" size={35} /><Icon name="sun" size={22} /></div>
          </div>
          <div className="temperature"><strong>28°</strong><span>Feels like 30°<br />Humidity 74%</span></div>
          <div className="forecast"><span>Today <b><Icon name="sun" size={16} /> 31°</b></span><span>Tomorrow <b><Icon name="cloud" size={16} /> 26°</b></span></div>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="panel recommendation">
          <div className="recommendation-head">
            <div className="ai-badge"><Icon name="sparkles" size={17} /></div>
            <div><p className="eyebrow">SAATHI SUGGESTS</p><h2>A small change, a big impact</h2></div>
          </div>
          <p className="recommendation-copy">Rain is expected tomorrow. Consider preparing around <strong>150–160 samosas</strong> instead of your usual 190 to reduce the risk of unsold food.</p>
        </article>

        <article className="panel quick-actions">
          <div className="panel-heading"><div><p className="eyebrow">SHORTCUTS</p><h2>Quick actions</h2></div></div>
          <div className="action-list">
            <button><span className="action-icon sales"><Icon name="plus" /></span><span>Record a sale</span><Icon name="arrow" size={15} /></button>
            <button><span className="action-icon stock"><Icon name="box" /></span><span>Update inventory</span><Icon name="arrow" size={15} /></button>
            <button><span className="action-icon report"><Icon name="chart" /></span><span>View full report</span><Icon name="arrow" size={15} /></button>
          </div>
        </article>
      </section>

      <footer>© 2024 VendorSaathi <span>Built for vendors, with care.</span></footer>
    </div>
  )
}

function SalesDemandPage() {
  const [product, setProduct] = useState('Samosa')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')

  return (
    <div className="page-content sales-demand-page">
      <section className="sales-page-header">
        <div><p className="date-label">BUSINESS INSIGHTS</p><h1>Sales & Demand</h1><p>Use your sales history to estimate future demand and prepare just the right amount.</p></div>
      </section>

      <section className="content-grid">
        <article className="panel chart-panel">
          <div className="panel-heading"><div><p className="eyebrow">LAST 7 DAYS</p><h2>Weekly sales</h2></div></div>
          <SalesChart />
        </article>

        <article className="panel predicted-card">
          <div className="stat-icon yellow"><Icon name="target" size={20} /></div>
          <p className="eyebrow">PREDICTED DEMAND</p>
          <div className="predicted-number">180 <span>samosas</span></div>
          <p>For tomorrow</p>
        </article>
      </section>

      <section className="panel sale-entry">
        <div className="panel-heading"><div><p className="eyebrow">QUICK ENTRY</p><h2>Add a sale</h2></div></div>
        <form onSubmit={(event) => event.preventDefault()}>
          <label>Product
            <select value={product} onChange={(event) => setProduct(event.target.value)}>
              <option>Samosa</option>
              <option>Masala Chai</option>
              <option>Samosa + Chai combo</option>
            </select>
          </label>
          <label>Quantity sold
            <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          </label>
          <label>Selling price
            <input type="number" min="1" value={price} onChange={(event) => setPrice(event.target.value)} />
          </label>
          <button className="primary-button" type="submit">Save sale <Icon name="arrow" size={15} /></button>
        </form>
      </section>
    </div>
  )
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const path = location.pathname

  const activeNav =
    path === '/sales-demand' ? 'Sales & Demand'
      : path === '/inventory' ? 'Inventory'
        : path === '/profit' ? 'Profit'
          : path === '/ai-assistant' ? 'AI Assistant'
            : path === '/schemes-support' ? 'Schemes & Support'
              : 'Dashboard'

  const pageForPath =
    path === '/sales-demand' ? <SalesDemandPage />
      : path === '/inventory' ? <InventoryPage />
        : path === '/profit' ? <ProfitPage />
          : path === '/ai-assistant' ? <AIAssistantPage />
            : path === '/schemes-support' ? <SchemesSupportPage />
              : <DashboardPage />

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

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">V</div>
          <div><strong>Vendor<span>Saathi</span></strong><small>YOUR BUSINESS COMPANION</small></div>
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
            <div className="help-icon"><Icon name="support" size={16} /></div>
            <strong>Need a little help?</strong>
            <p>Our guides can help you grow.</p>
          </div>

          <div className="profile">
            <div className="avatar">R</div>
            <div><strong>Ravi Kumar</strong><span>Samosa & Chai Stall</span></div>
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