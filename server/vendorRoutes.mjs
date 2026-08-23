/**
 * vendorRoutes.mjs
 *
 * Express router covering the pieces the implementation guide calls
 * for that weren't built yet: daily check-in, tomorrow's recommendation,
 * and the ledger summary. Mount this in server.mjs — see bottom of file
 * for the exact snippet to add.
 *
 * Storage: JSON file on disk (see loadHistory/saveHistory below), so
 * recorded check-ins survive a server restart instead of resetting to
 * seed data every time. Swap for Supabase/Firebase later if there's
 * time — see the TODOs below — but this fixes the "my recorded sale
 * disappeared" issue for now.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { generateRecommendation, estimateImpact } from './recommendationEngine.mjs';
import { demoHistory, demoUnitPrices } from './demoData.mjs';
import { getInventorySummary, restockItem, deductForSale, costPerUnit } from './inventoryData.mjs';

export const vendorRouter = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HISTORY_FILE = path.join(__dirname, 'checkinHistory.json');

// TODO: replace with a real DB read (Supabase table `daily_records`).
// Until then, this file-backed store is what survives `node server.mjs`
// restarts — the in-memory-only version was silently losing real
// check-ins every time the server restarted during development.
function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('[vendorRoutes] Could not read checkinHistory.json, falling back to seed data:', error.message);
  }
  return [...demoHistory];
}

function saveHistory() {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('[vendorRoutes] Could not persist checkinHistory.json:', error.message);
  }
}

let history = loadHistory();

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function tomorrowWeekday() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return WEEKDAYS[tomorrow.getDay()];
}

/**
 * Reuses the existing GET /api/weather endpoint already built and
 * tested in server.mjs (real OpenWeatherMap call + its own demo
 * fallback) instead of duplicating weather logic here. Maps its
 * `tomorrow` shape into what the recommendation engine expects:
 * { condition, rainProbability, temperatureC, isDemoData }.
 */
async function getTomorrowWeatherForEngine() {
  try {
    const response = await fetch('http://localhost:3001/api/weather');
    const data = await response.json();
    const main = (data.tomorrow?.weatherMain || 'Clear').toLowerCase();

    return {
      condition: main.includes('rain') ? 'rain' : main,
      rainProbability: data.tomorrow?.rainProbability ?? 0,
      temperatureC: data.tomorrow?.temperature ?? 28,
      isDemoData: data.demo === true,
    };
  } catch (error) {
    console.error('[vendorRoutes] Could not reach /api/weather, using safe fallback:', error.message);
    // Last-resort fallback only if /api/weather itself is unreachable
    // (its own internal fallback already covers the OpenWeatherMap call failing).
    return { condition: 'rain', rainProbability: 40, temperatureC: 26, isDemoData: true };
  }
}

/**
 * POST /api/checkin
 * Body: { date, items: [{ name, sold, leftover, unitPrice }], expenses }
 *
 * Saves a vendor's daily record. Per the guide, the FRONTEND is
 * responsible for showing an editable confirmation screen before this
 * is called — this endpoint trusts the numbers it's given, it does not
 * re-interpret them with an LLM.
 */
vendorRouter.post('/checkin', (req, res) => {
  const { date, items, expenses } = req.body;

  if (!date || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'date and a non-empty items array are required.' });
  }

  for (const item of items) {
    if (!item.name || typeof item.sold !== 'number' || typeof item.leftover !== 'number') {
      return res.status(400).json({ error: 'Each item needs name, sold (number), and leftover (number).' });
    }
  }

  const weekday = WEEKDAYS[new Date(date).getDay()];
  const record = { date, weekday, items, expenses: expenses || 0 };

  // TODO: replace with a real DB insert. For now, persisted to disk
  // (see loadHistory/saveHistory above) so this survives a restart.
  history.push(record);
  saveHistory();

  const revenue = items.reduce((sum, item) => sum + item.sold * (item.unitPrice || 0), 0);

  // Close the loop: a recorded sale consumes ingredients, so Inventory
  // reflects reality without a separate manual step.
  const inventoryChanges = items.flatMap((item) => deductForSale(item.name, item.sold));

  res.status(201).json({ saved: record, revenue, inventoryChanges });
});

/**
 * GET /api/inventory
 * Returns current stock levels with a derived status (good/low/critical)
 * and an estimated stock value — replaces the hardcoded array that used
 * to live directly in InventoryPage.jsx.
 */
vendorRouter.get('/inventory', (req, res) => {
  res.json(getInventorySummary());
});

/**
 * POST /api/inventory/restock
 * Body: { id: "oil", quantity: 3 }
 * Adds stock (e.g. after a supplier delivery). Use a negative quantity
 * to manually correct a count down.
 */
vendorRouter.post('/inventory/restock', (req, res) => {
  const { id, quantity } = req.body;

  if (!id || typeof quantity !== 'number') {
    return res.status(400).json({ error: 'id (string) and quantity (number) are required.' });
  }

  const updated = restockItem(id, quantity);
  if (!updated) {
    return res.status(404).json({ error: `No inventory item with id "${id}".` });
  }

  res.json({ updated });
});

/**
 * GET /api/recommendation
 * Query: ?items=samosa,tea&event=none
 *
 * Returns tomorrow's prepare-quantity plan. This is the core
 * "explainable AI" feature — every number here traces back to a rule,
 * not an LLM guess.
 */
vendorRouter.get('/recommendation', async (req, res) => {
  const itemNames = (req.query.items || 'samosa,tea').split(',').map((s) => s.trim());
  const event = req.query.event || 'none';

  const weather = await getTomorrowWeatherForEngine();
  const weekday = tomorrowWeekday();

  const result = generateRecommendation(history, itemNames, weekday, weather, { event });
  const impact = estimateImpact(result.recommendations, demoUnitPrices);

  res.json({
    ...result,
    ...impact,
    isDemoData: weather.isDemoData === true || history === demoHistory,
  });
});

/**
 * GET /api/ledger
 * Returns the last 7 days of records plus rollup totals, for the
 * Ledger/Profit dashboard.
 */
vendorRouter.get('/ledger', (req, res) => {
  const last7 = history.slice(-7);

  const totals = last7.reduce(
    (acc, day) => {
      const dayRevenue = day.items.reduce((sum, item) => sum + item.sold * (item.unitPrice || 0), 0);
      const dayLeftoverValue = day.items.reduce((sum, item) => sum + item.leftover * (item.unitPrice || 0), 0);
      acc.revenue += dayRevenue;
      acc.expenses += day.expenses;
      acc.wasteValue += dayLeftoverValue;
      return acc;
    },
    { revenue: 0, expenses: 0, wasteValue: 0 }
  );

  res.json({
    days: last7,
    totals: {
      revenue: Math.round(totals.revenue),
      expenses: Math.round(totals.expenses),
      profit: Math.round(totals.revenue - totals.expenses),
      wasteValue: Math.round(totals.wasteValue),
    },
  });
});

/**
 * GET /api/profit
 * Real numbers for the Profit page: real ingredient cost per item
 * (from inventoryData's RECIPE + unitCost, not a guessed "₹7"), real
 * average selling price and expected-sales/unsold-stock from actual
 * history, and tomorrow's waste-avoidance estimate from the same
 * recommendation engine used on Sales & Demand — so Profit and
 * Sales & Demand never show two different "tomorrow" numbers.
 */
vendorRouter.get('/profit', async (req, res) => {
  const last7 = history.slice(-7);

  // Real ingredient cost per item — this is the number that used to be
  // a hardcoded "₹7 per samosa" guess.
  const samosaCost = costPerUnit('samosa');
  const teaCost = costPerUnit('tea');

  // Average selling price actually charged, from real check-ins.
  const samosaSales = last7.flatMap((d) => d.items).filter((i) => i.name === 'samosa');
  const avgSellingPrice = samosaSales.length > 0
    ? samosaSales.reduce((sum, i) => sum + i.unitPrice, 0) / samosaSales.length
    : demoUnitPrices.samosa;
  const avgLeftover = samosaSales.length > 0
    ? samosaSales.reduce((sum, i) => sum + i.leftover, 0) / samosaSales.length
    : 0;

  // Reuse the exact same recommendation the Sales & Demand page shows,
  // so "expected sales tomorrow" is consistent across the app.
  const weather = await getTomorrowWeatherForEngine();
  const weekday = tomorrowWeekday();
  const recResult = generateRecommendation(history, ['samosa', 'tea'], weekday, weather, { event: 'none' });
  const recImpact = estimateImpact(recResult.recommendations, demoUnitPrices);
  const expectedSalesTomorrow = recResult.recommendations.find((r) => r.item === 'samosa')?.prepare ?? 0;

  const totals = last7.reduce(
    (acc, day) => {
      const dayRevenue = day.items.reduce((sum, item) => sum + item.sold * (item.unitPrice || 0), 0);
      const dayLeftoverValue = day.items.reduce((sum, item) => sum + item.leftover * (item.unitPrice || 0), 0);
      acc.revenue += dayRevenue;
      acc.expenses += day.expenses;
      acc.wasteValue += dayLeftoverValue;
      return acc;
    },
    { revenue: 0, expenses: 0, wasteValue: 0 }
  );

  res.json({
    costPerUnit: {
      samosa: Math.round(samosaCost * 100) / 100,
      tea: Math.round(teaCost * 100) / 100,
    },
    avgSellingPrice: Math.round(avgSellingPrice * 100) / 100,
    avgLeftover: Math.round(avgLeftover * 10) / 10,
    expectedSalesTomorrow,
    weeklyRevenue: Math.round(totals.revenue),
    weeklyExpenses: Math.round(totals.expenses),
    weeklyProfit: Math.round(totals.revenue - totals.expenses),
    weeklyWasteValue: Math.round(totals.wasteValue),
    estimatedWasteAvoidedTomorrow: recImpact.estimatedWasteAvoided,
    insight: {
      changePercent: recResult.recommendations.find((r) => r.item === 'samosa')?.changePercent ?? 0,
      reasonSummary: recResult.reasonSummary,
      isDemoData: weather.isDemoData === true,
    },
  });
});

/*
 * --- How to mount this in server.mjs ---
 *
 * Add these two lines near your other imports/middleware — your
 * server.mjs already has `const app = express()` and
 * `app.use(express.json())`, so you just need:
 *
 * import { vendorRouter } from './vendorRoutes.mjs';
 * app.use('/api', vendorRouter);
 *
 * Put that after `app.use(express.json())` and before `app.listen(...)`.
 *
 * // Now these are live:
 * //   POST /api/checkin
 * //   GET  /api/inventory
 * //   POST /api/inventory/restock
 * //   GET  /api/recommendation?items=samosa,tea&event=none
 * //   GET  /api/ledger
 * //   GET  /api/profit
 *
 * Note: getTomorrowWeatherForEngine() above calls your own
 * GET /api/weather endpoint over HTTP (localhost:3001) rather than
 * duplicating the OpenWeatherMap logic — so no weatherAdapter.mjs
 * file is needed. Delete it if you already created one.
 */
