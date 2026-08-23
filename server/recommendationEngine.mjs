/**
 * recommendationEngine.mjs
 *
 * Deterministic, rules-based demand forecasting for VendorSaathi.
 *
 * IMPORTANT DESIGN RULE (from the implementation guide, section 7):
 * The LLM interprets language. The RULES ENGINE decides quantities.
 * Nothing in this file calls an LLM. Every number here is calculated
 * from real inputs, so it stays explainable and testable for judges.
 */

/**
 * @typedef {Object} DailyRecord
 * @property {string} date - ISO date string, e.g. "2026-08-20"
 * @property {string} weekday - e.g. "Wednesday"
 * @property {{name: string, sold: number, leftover: number, unitPrice: number}[]} items
 * @property {number} expenses
 */

/**
 * @typedef {Object} WeatherInput
 * @property {"clear"|"rain"|"cloudy"|"extreme_heat"} condition
 * @property {number} rainProbability - 0-100
 * @property {number} temperatureC
 */

/**
 * @typedef {Object} ContextInput
 * @property {"none"|"school_day"|"festival"|"office_lunch_rush"} event
 */

/**
 * Compute the average quantity sold for a given item on a given weekday,
 * using only the vendor's own historical records. Falls back to the
 * overall average for that item if no same-weekday data exists yet.
 */
function averageSoldOnWeekday(history, itemName, weekday) {
  const sameWeekday = history
    .flatMap((day) => day.items.map((item) => ({ ...item, weekday: day.weekday })))
    .filter((item) => item.name === itemName && item.weekday === weekday);

  if (sameWeekday.length > 0) {
    const total = sameWeekday.reduce((sum, item) => sum + item.sold, 0);
    return total / sameWeekday.length;
  }

  // Fallback: average across all days for this item, so a brand-new
  // vendor with < 1 week of history still gets a sane number.
  const allDays = history.flatMap((day) => day.items).filter((item) => item.name === itemName);
  if (allDays.length === 0) return 0;
  return allDays.reduce((sum, item) => sum + item.sold, 0) / allDays.length;
}

/**
 * Compute the average leftover quantity for a given item across history.
 */
function averageLeftover(history, itemName) {
  const records = history.flatMap((day) => day.items).filter((item) => item.name === itemName);
  if (records.length === 0) return 0;
  return records.reduce((sum, item) => sum + item.leftover, 0) / records.length;
}

/**
 * Item-specific weather/context sensitivity. This is the only place
 * "how much does rain affect samosas vs tea" is decided, so it's easy
 * to tune and explain in a demo.
 *
 * multiplier applies when the condition is true; factors compound.
 */
const WEATHER_RULES = {
  samosa: [
    { when: (w) => w.rainProbability > 40, multiplier: 0.85, reason: 'Rain expected — fried snacks sell slower' },
    { when: (w) => w.temperatureC >= 38, multiplier: 0.9, reason: 'Extreme heat — lower footfall expected' },
  ],
  tea: [
    { when: (w) => w.rainProbability > 40, multiplier: 1.2, reason: 'Rain expected — tea demand rises' },
    { when: (w) => w.temperatureC <= 20, multiplier: 1.15, reason: 'Cool weather — tea demand rises' },
  ],
};

const CONTEXT_RULES = {
  festival: { multiplier: 1.25, reason: 'Festival day — higher footfall expected' },
  office_lunch_rush: { multiplier: 1.25, reason: 'Office lunch rush nearby — higher footfall expected' },
  school_day: { multiplier: 1.0, reason: null },
  none: { multiplier: 1.0, reason: null },
};

/**
 * Generate tomorrow's prepare-quantity recommendation for every item
 * the vendor sells, plus a human-readable, factor-by-factor explanation.
 *
 * @param {DailyRecord[]} history - the vendor's past daily records (oldest to newest)
 * @param {string[]} itemNames - which items to recommend for, e.g. ["samosa", "tea"]
 * @param {string} targetWeekday - the weekday being forecast, e.g. "Thursday"
 * @param {WeatherInput} weather
 * @param {ContextInput} context
 */
export function generateRecommendation(history, itemNames, targetWeekday, weather, context) {
  const recommendations = itemNames.map((itemName) => {
    const baseDemand = averageSoldOnWeekday(history, itemName, targetWeekday);
    const avgLeftover = averageLeftover(history, itemName);

    // Start from historical demand, adjusted down by average leftover
    // (i.e. we were over-preparing by roughly this much on average).
    let quantity = Math.max(0, baseDemand - avgLeftover);
    const appliedFactors = [];

    const weatherRules = WEATHER_RULES[itemName] || [];
    for (const rule of weatherRules) {
      if (rule.when(weather)) {
        quantity *= rule.multiplier;
        appliedFactors.push({ reason: rule.reason, multiplier: rule.multiplier });
      }
    }

    const contextRule = CONTEXT_RULES[context.event] || CONTEXT_RULES.none;
    if (contextRule.multiplier !== 1.0) {
      quantity *= contextRule.multiplier;
      appliedFactors.push({ reason: contextRule.reason, multiplier: contextRule.multiplier });
    }

    const finalQuantity = Math.round(quantity);
    const changePercent = baseDemand > 0
      ? Math.round(((finalQuantity - baseDemand) / baseDemand) * 100)
      : 0;

    return {
      item: itemName,
      prepare: finalQuantity,
      changePercent,
      baseDemand: Math.round(baseDemand),
      avgLeftover: Math.round(avgLeftover * 10) / 10,
      appliedFactors,
    };
  });

  return {
    targetWeekday,
    weather,
    context,
    recommendations,
    reasonSummary: buildReasonSummary(recommendations, weather, targetWeekday),
  };
}

/**
 * Build a short, judge-friendly (and vendor-friendly) plain-English
 * explanation of why these numbers came out the way they did.
 */
function buildReasonSummary(recommendations, weather, targetWeekday) {
  const parts = [];

  if (weather.rainProbability > 40) {
    parts.push(`Rain chance ${weather.rainProbability}%`);
  }

  for (const rec of recommendations) {
    parts.push(`Past ${targetWeekday} sales for ${rec.item}: ${rec.baseDemand}`);
    parts.push(`Average leftover for ${rec.item}: ${rec.avgLeftover}`);
  }

  return parts;
}

/**
 * Estimate revenue and waste-avoided for a recommendation set, given
 * unit prices. Kept separate from generateRecommendation so the core
 * quantity logic stays simple and independently testable.
 *
 * @param {{item: string, prepare: number, baseDemand: number}[]} recommendations
 * @param {Record<string, number>} unitPrices - e.g. { samosa: 12, tea: 10 }
 */
export function estimateImpact(recommendations, unitPrices) {
  let estimatedRevenue = 0;
  let estimatedWasteAvoided = 0;

  for (const rec of recommendations) {
    const price = unitPrices[rec.item] || 0;
    estimatedRevenue += rec.prepare * price;

    // Waste avoided = (what we would have over-prepared before) - (new plan),
    // valued at unit price. Only counts when the new plan is lower.
    const overPrepBefore = Math.max(0, rec.baseDemand - rec.prepare);
    estimatedWasteAvoided += overPrepBefore * price;
  }

  return {
    estimatedRevenue: Math.round(estimatedRevenue),
    estimatedWasteAvoided: Math.round(estimatedWasteAvoided),
  };
}
