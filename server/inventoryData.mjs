/**
 * inventoryData.mjs
 *
 * Real inventory state — replaces the hardcoded array that was living
 * directly in InventoryPage.jsx. Persisted to a JSON file on disk (see
 * loadInventory/saveInventory below) so restocking or sale-driven
 * deductions survive a server restart instead of resetting to the
 * starting quantities every time.
 *
 * Status (good/low/critical) is DERIVED from quantity vs. threshold —
 * never hardcoded — so restocking or selling through stock immediately
 * reflects a correct status.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INVENTORY_FILE = path.join(__dirname, 'inventoryState.json');

// unit: display unit. threshold: recommended/target stock level.
const DEFAULT_INVENTORY = [
  { id: 'potatoes', name: 'Potatoes', quantity: 5, unit: 'kg', threshold: 10 },
  { id: 'flour', name: 'Flour', quantity: 8, unit: 'kg', threshold: 10 },
  { id: 'oil', name: 'Cooking Oil', quantity: 1.5, unit: 'L', threshold: 4 },
  { id: 'samosa_sheets', name: 'Samosa Sheets', quantity: 250, unit: 'pieces', threshold: 300 },
  { id: 'tea_leaves', name: 'Tea', quantity: 3, unit: 'kg', threshold: 3 },
  { id: 'sugar', name: 'Sugar', quantity: 4, unit: 'kg', threshold: 4 },
];

// TODO: replace with a real DB read (Supabase) when there's time.
function loadInventory() {
  try {
    if (fs.existsSync(INVENTORY_FILE)) {
      return JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('[inventoryData] Could not read inventoryState.json, using defaults:', error.message);
  }
  return DEFAULT_INVENTORY.map((item) => ({ ...item }));
}

function saveInventory() {
  try {
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventoryItems, null, 2));
  } catch (error) {
    console.error('[inventoryData] Could not persist inventoryState.json:', error.message);
  }
}

export let inventoryItems = loadInventory();

// Rough cost per unit, used only to estimate stock value on the dashboard.
const unitCost = {
  potatoes: 25, flour: 35, oil: 140, samosa_sheets: 2, tea_leaves: 320, sugar: 42,
};

const CRITICAL_RATIO = 0.4; // below 40% of threshold => critical
const LOW_RATIO = 0.85; // below 85% of threshold => low

export function statusFor(item) {
  const ratio = item.threshold > 0 ? item.quantity / item.threshold : 1;
  if (ratio < CRITICAL_RATIO) return 'critical';
  if (ratio < LOW_RATIO) return 'low';
  return 'good';
}

export function getInventorySummary() {
  const withStatus = inventoryItems.map((item) => ({ ...item, status: statusFor(item) }));

  const estimatedValue = inventoryItems.reduce(
    (sum, item) => sum + item.quantity * (unitCost[item.id] || 0),
    0
  );

  return {
    items: withStatus,
    itemsTracked: inventoryItems.length,
    lowCount: withStatus.filter((i) => i.status === 'low').length,
    criticalCount: withStatus.filter((i) => i.status === 'critical').length,
    estimatedValue: Math.round(estimatedValue),
  };
}

export function restockItem(id, addQuantity) {
  const item = inventoryItems.find((i) => i.id === id);
  if (!item) return null;
  item.quantity = Math.round((item.quantity + addQuantity) * 100) / 100;
  saveInventory();
  return { ...item, status: statusFor(item) };
}

/**
 * Called when a sale is recorded (Step 3). unitsConsumed maps
 * inventory item id -> amount used per unit sold, so a sale of
 * N samosas can roughly deduct flour/oil/sheets/potatoes.
 * Kept intentionally simple/rough for hackathon scope.
 */
const RECIPE = {
  samosa: { potatoes: 0.04, flour: 0.02, oil: 0.015, samosa_sheets: 1 },
  tea: { tea_leaves: 0.006, sugar: 0.008 },
};

export function deductForSale(itemName, quantitySold) {
  const recipe = RECIPE[itemName];
  if (!recipe) return [];

  const affected = [];
  for (const [ingredientId, perUnit] of Object.entries(recipe)) {
    const item = inventoryItems.find((i) => i.id === ingredientId);
    if (!item) continue;
    item.quantity = Math.max(0, Math.round((item.quantity - perUnit * quantitySold) * 100) / 100);
    affected.push({ ...item, status: statusFor(item) });
  }
  saveInventory();
  return affected;
}

/**
 * Real ingredient cost per single unit sold (e.g. cost to make ONE
 * samosa), derived from the same RECIPE + unitCost used for stock
 * deduction. This is what makes Profit (Step 5) a genuine calculation
 * instead of a hardcoded "₹7 per samosa" guess.
 */
export function costPerUnit(itemName) {
  const recipe = RECIPE[itemName];
  if (!recipe) return 0;
  return Object.entries(recipe).reduce(
    (sum, [ingredientId, perUnit]) => sum + perUnit * (unitCost[ingredientId] || 0),
    0
  );
}
