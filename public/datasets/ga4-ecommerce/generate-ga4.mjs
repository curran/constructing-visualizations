import { stringify } from 'csv-stringify/sync';
import { writeFileSync } from 'fs';

// --- Configuration ---

const START_DATE = '2020-11-01';
const END_DATE = '2021-01-31';

const EVENT_NAMES = [
  'page_view',
  'view_item',
  'add_to_cart',
  'begin_checkout',
  'purchase',
];

// Realistic funnel: each event type has a base probability of existing
// for a given combination of (day, device, source, category)
const EVENT_PROBABILITY = {
  page_view: 0.75,
  view_item: 0.40,
  add_to_cart: 0.18,
  begin_checkout: 0.08,
  purchase: 0.04,
};

const DEVICE_CATEGORIES = [
  { name: 'desktop', weight: 0.45 },
  { name: 'mobile', weight: 0.50 },
  { name: 'tablet', weight: 0.05 },
];

const TRAFFIC_SOURCES = [
  { name: 'google', weight: 0.35 },
  { name: 'direct', weight: 0.25 },
  { name: 'social', weight: 0.15 },
  { name: 'organic', weight: 0.15 },
  { name: 'email', weight: 0.10 },
];

const ITEM_CATEGORIES = [
  { name: 'Apparel', weight: 0.25, avgPrice: 85 },
  { name: 'Electronics', weight: 0.20, avgPrice: 250 },
  { name: 'Home', weight: 0.20, avgPrice: 65 },
  { name: 'Sports', weight: 0.15, avgPrice: 55 },
  { name: 'Books', weight: 0.10, avgPrice: 25 },
  { name: 'Beauty', weight: 0.05, avgPrice: 35 },
  { name: 'Toys', weight: 0.05, avgPrice: 30 },
];

const DEVICE_PROB_FACTOR = {
  desktop: 1.0,
  mobile: 0.85,
  tablet: 0.40,
};

const SOURCE_PROB_FACTOR = {
  google: 1.0,
  direct: 0.75,
  social: 0.55,
  organic: 0.80,
  email: 0.35,
};

// --- Helpers ---

function getDateRange(start, end) {
  const dates = [];
  // Parse as YYYY-MM-DD parts to avoid timezone issues
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const d = new Date(Date.UTC(sy, sm - 1, sd));
  const endD = new Date(Date.UTC(ey, em - 1, ed));
  while (d <= endD) {
    dates.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return dates;
}

function logNormalSample(mu, sigma) {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.exp(mu + sigma * z);
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// --- Main Generation ---

const dates = getDateRange(START_DATE, END_DATE);
console.log(`Date range: ${dates[0]} to ${dates[dates.length - 1]} (${dates.length} days)`);

const rows = [];

for (const date of dates) {
  for (const eventName of EVENT_NAMES) {
    const baseProb = EVENT_PROBABILITY[eventName];

    for (const device of DEVICE_CATEGORIES) {
      const deviceFactor = DEVICE_PROB_FACTOR[device.name];

      for (const source of TRAFFIC_SOURCES) {
        const sourceFactor = SOURCE_PROB_FACTOR[source.name];

        for (const category of ITEM_CATEGORIES) {
          // Combined probability that this combination exists
          const prob = baseProb * deviceFactor * sourceFactor;

          if (Math.random() > prob) continue;

          // --- Generate event_count ---
          let countMean;
          let countSigma;
          switch (eventName) {
            case 'page_view':
              countMean = 4.2; countSigma = 1.0; break; // median ~67
            case 'view_item':
              countMean = 3.5; countSigma = 1.0; break; // median ~33
            case 'add_to_cart':
              countMean = 2.8; countSigma = 0.9; break; // median ~16
            case 'begin_checkout':
              countMean = 2.3; countSigma = 0.8; break; // median ~10
            case 'purchase':
              countMean = 2.0; countSigma = 0.7; break; // median ~7
          }

          // Adjust for traffic source volume
          const sourceVolumeFactor = {
            google: 1.2, direct: 0.9, social: 0.7, organic: 0.8, email: 0.5,
          };
          const eventCountAdj = sourceVolumeFactor[source.name];
          const eventCount = Math.max(1, Math.round(
            logNormalSample(countMean, countSigma) * eventCountAdj
          ));

          // --- Generate unique_users ---
          // Repeat rate varies: page_view has lowest user-to-event ratio,
          // purchase has highest (fewer repeated events per user)
          const repeatFactor = {
            page_view: 0.30,
            view_item: 0.45,
            add_to_cart: 0.55,
            begin_checkout: 0.65,
            purchase: 0.80,
          };
          const userRatio = repeatFactor[eventName] + (Math.random() - 0.5) * 0.2;
          const uniqueUsers = clamp(
            Math.round(eventCount * userRatio),
            1,
            eventCount
          );

          // --- Generate total_revenue (only for purchase events) ---
          const totalRevenue = eventName === 'purchase'
            ? Math.round(eventCount * category.avgPrice * (0.7 + Math.random() * 0.6) * 100) / 100
            : 0;

          rows.push({
            event_date: date,
            event_name: eventName,
            device_category: device.name,
            traffic_source: source.name,
            item_category: category.name,
            event_count: eventCount,
            unique_users: uniqueUsers,
            total_revenue: totalRevenue,
          });
        }
      }
    }
  }
}

// Sort by event_date for clean output
rows.sort((a, b) => a.event_date.localeCompare(b.event_date));

console.log(`Generated ${rows.length} rows`);

// --- Write CSV ---

const csvOutput = stringify(rows, {
  header: true,
  columns: [
    'event_date',
    'event_name',
    'device_category',
    'traffic_source',
    'item_category',
    'event_count',
    'unique_users',
    'total_revenue',
  ],
});

writeFileSync('ga4_ecommerce.csv', csvOutput, 'utf-8');

const stats = {
  rows: rows.length,
  sizeKB: (Buffer.byteLength(csvOutput, 'utf-8') / 1024).toFixed(1),
  dateRange: `${dates[0]} to ${dates[dates.length - 1]}`,
  events: {},
  purchases: rows.filter(r => r.event_name === 'purchase').length,
  totalRevenue: rows
    .filter(r => r.event_name === 'purchase')
    .reduce((s, r) => s + r.total_revenue, 0)
    .toFixed(2),
};

for (const ev of EVENT_NAMES) {
  const evRows = rows.filter(r => r.event_name === ev);
  stats.events[ev] = {
    rows: evRows.length,
    totalCount: evRows.reduce((s, r) => s + r.event_count, 0),
    totalUsers: evRows.reduce((s, r) => s + r.unique_users, 0),
  };
}

console.log('\n--- Summary ---');
console.log(`File size: ${stats.sizeKB} KB`);
console.log(`Rows: ${stats.rows}`);
console.log(`Date range: ${stats.dateRange}`);
console.log(`\nFunnel breakdown:`);
for (const ev of EVENT_NAMES) {
  const e = stats.events[ev];
  console.log(`  ${ev}: ${e.rows} combo-rows, ${e.totalCount} events, ${e.totalUsers} users`);
}
console.log(`\nPurchase rows: ${stats.purchases}`);
console.log(`Total revenue: $${stats.totalRevenue}`);

console.log('\n✅ ga4_ecommerce.csv written');