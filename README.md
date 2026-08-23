<div align="center">

# 🛒 VendorSaathi
### *Har Thelewale Ka Smart Saathi*
**An AI-powered business companion for street-food vendors**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_App-brightgreen?style=for-the-badge)](https://vendor-saathi-ctug5naxa-sigma-gpt.vercel.app/)

</div>

---

## 📖 Overview
VendorSaathi helps street-food vendors starting in Lucknow  make smarter decisions using sales, demand, inventory, profit, weather, AI assistance, and government-scheme guidance in one simple dashboard. **Vision:** expand across India to different types of street vendors.

## 🎯 Problem
Vendors rely on guesswork for sales/demand, inventory, pricing/profit, weather planning, and finding relevant government support — with no simple digital tool to help.

## 💡 Solution
```
Vendor Data → Sales/Inventory/Profit/Weather → VendorSaathi → AI Insights → Better Decisions
```

## ✨ Key Features
| Feature | Highlights |
|---|---|
| 📊 **Dashboard** | Sales, predicted demand, profit, inventory status, weekly overview, weather, recommendations |
| 💰 **Sales & Demand** | Add sales, weekly visualization, history, demand insights *(sample data in prototype)* |
| 📦 **Inventory** | Stock overview, recommendations, status, value *(not manually editable yet)* |
| 🧮 **Profit Calculator** | Revenue, cost, profit, margin + AI insight |
| 🤖 **AI Assistant** | Real AI via Groq (GPT-OSS-20B), Hinglish-friendly, text-based |
| ☁️ **Weather** | Live temp, condition, humidity, feels-like via OpenWeather |
| 🏛️ **Schemes & Support** | Guided questionnaire → relevant scheme guidance + official links *(not an approval system)* |

## 🏗️ Architecture
```
React + Vite Frontend
        ↓
Node.js + Express Backend
        ↓
   ┌────────┴────────┐
   ↓                 ↓
Groq API        OpenWeather API
   ↓                 ↓
GPT-OSS-20B     Weather Data
   ↓
AI Response
```
**AI Flow:** `React → Express Backend → Groq API → GPT-OSS-20B → AI Response`

🔒 Groq API key stays server-side in environment variables — never exposed to frontend.

## 🛠️ Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React.js, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js, REST API, CORS |
| AI | Groq API, GPT-OSS-20B |
| Weather | OpenWeather API |
| Deployment | Vercel (frontend), Render (backend) |
| Version Control | Git, GitHub |

## 📁 Project Structure
```
VendorSaathi/
├── client/src/
│   ├── App.jsx
│   ├── InventoryPage.jsx
│   ├── ProfitPage.jsx
│   ├── AIAssistantPage.jsx
│   └── SchemesSupportPage.jsx
└── server/server.mjs
```

## 🚀 Setup
```bash
git clone https://github.com/nabiyarafat05/VendorSaathi.git
cd client && npm install
cd ../server && npm install
```
Run:
```bash
cd server && node server.mjs   # backend
cd client && npm run dev       # frontend
```

## 🌐 Live Demo
<div align="center">

[![Try VendorSaathi](https://img.shields.io/badge/🔗_Try_VendorSaathi-Live_App-blue?style=for-the-badge)](https://vendor-saathi-ctug5naxa-sigma-gpt.vercel.app/)

</div>

## 🔭 Future Scope
Voice AI (Hindi/regional) · WhatsApp assistant · Advanced demand forecasting · Vision-based inventory detection · Location/footfall intelligence · UPI & digital ledger · Expanded scheme assistance · Offline/low-data support · Expansion beyond Lucknow

## 👥 Team
| Name | Role | Contribution |
|---|---|---|
| **Nabiya Rafat** | Team Leader & Frontend | Led team, built most of frontend, integrated features |
| **Isha Landge** | API Integration | External service & API connectivity |
| **Anshika Gupta** | Frontend | Frontend & UI development |

## 🌟 Vision
<div align="center">

*Making practical digital intelligence accessible to every street vendor — one thela, one decision, one city at a time.*

**Har Thelewale Ka Smart Saathi.** 🛒

</div>
