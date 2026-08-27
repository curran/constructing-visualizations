import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Configuration ────────────────────────────────────────────────────

const SERIES = [
  { id: "SP500", name: "sp500" },
  { id: "DFF", name: "fed_funds_rate" },
  { id: "CPIAUCSL", name: "cpi" },
  { id: "UNRATE", name: "unemployment_rate" },
  { id: "GDPC1", name: "real_gdp" },
  { id: "DGS10", name: "treasury_10y" },
  { id: "T10YIE", name: "breakeven_inflation" },
];

const BASE_URL =
  "https://fred.stlouisfed.org/graph/fredgraph.csv" +
  "?bgcolor=%23e1e9f0&chart_type=line&drp=0&fo=open%20sans" +
  "&graph_bgcolor=%23ffffff&height=450&mode=fred&recession_bars=on" +
  "&txtcolor=%23444444&ts=12&tts=12&width=1168&nt=0&thu=0&trc=0" +
  "&show_legend=yes&show_axis_titles=yes&show_tooltip=yes" +
  "&scale=left&cosd=2000-01-01&coed=2026-01-01&id=";

const OUTPUT_CSV = join(__dirname, "fred_macro.csv");

// ── CSV helpers ──────────────────────────────────────────────────────

/** Parse a CSV string into an array of { date, value } objects. */
function parseSeriesCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  // First line is header: DATE, SERIES_ID
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Simple split — FRED CSV has no quoted fields in practice
    const commaIdx = line.indexOf(",");
    if (commaIdx === -1) continue;

    const date = line.slice(0, commaIdx).trim();
    const value = line.slice(commaIdx + 1).trim();

    // Skip missing values
    if (value === "." || value === "") continue;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) continue;

    results.push({ date, value: numValue });
  }

  return results;
}

/** Resample daily/quarterly data to monthly (last available value in each month). */
function resampleToMonthly(records) {
  // Group by YYYY-MM
  const months = {};

  for (const r of records) {
    // date is "YYYY-MM-DD" — extract YYYY-MM
    const monthKey = r.date.slice(0, 7); // e.g. "2023-01"
    // Keep last value — later dates overwrite earlier ones
    months[monthKey] = r.value;
  }

  // Sort by month key and return
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, value]) => ({ date: monthKey + "-01", value }));
}

/** Format a row as a CSV line, quoting if needed. */
function formatCSVLine(values) {
  return values
    .map((v) => {
      const str = v == null ? "" : String(v);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    })
    .join(",");
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("Fetching FRED macro indicators (CSV export, no API key needed)...");

  // Fetch all series and resample to monthly
  const monthlySeries = {};

  for (const series of SERIES) {
    const url = BASE_URL + series.id;
    console.log(`  Fetching ${series.id} (${series.name})...`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `FRED returned HTTP ${response.status} for series ${series.id}`
      );
    }

    const text = await response.text();
    const records = parseSeriesCSV(text);
    console.log(`    Parsed ${records.length} raw observations`);

    const monthly = resampleToMonthly(records);
    console.log(`    Resampled to ${monthly.length} monthly observations`);

    monthlySeries[series.name] = monthly;
  }

  // Merge all series by date
  // Collect all unique months across all series
  const allMonths = new Set();
  for (const series of Object.values(monthlySeries)) {
    for (const r of series) {
      allMonths.add(r.date);
    }
  }

  // Sort months
  const sortedMonths = [...allMonths].sort();

  // Build index maps for fast lookup: { date => value }
  const valueMaps = {};
  for (const [name, records] of Object.entries(monthlySeries)) {
    const map = {};
    for (const r of records) {
      map[r.date] = r.value;
    }
    valueMaps[name] = map;
  }

  // Build wide-format rows
  const headers = ["date", ...SERIES.map((s) => s.name)];
  const csvLines = [formatCSVLine(headers)];

  for (const date of sortedMonths) {
    const row = [date];
    for (const series of SERIES) {
      const val = valueMaps[series.name][date];
      // Use empty string for missing values (series didn't start yet)
      // but format them as empty so it renders correctly
      row.push(val !== undefined ? val : "");
    }
    csvLines.push(formatCSVLine(row));
  }

  const csvContent = csvLines.join("\n");
  writeFileSync(OUTPUT_CSV, csvContent, "utf-8");

  // Summary
  const fileSize = readFileSync(OUTPUT_CSV).length;
  console.log(`\nWrote ${OUTPUT_CSV}`);
  console.log(`File size: ${(fileSize / 1024).toFixed(1)} KB`);
  console.log(`Rows: ${sortedMonths.length}`);

  // Per-series stats
  for (const series of SERIES) {
    const hasVal = sortedMonths.filter((d) => valueMaps[series.name][d] !== undefined).length;
    const pct = ((hasVal / sortedMonths.length) * 100).toFixed(0);
    console.log(`  ${series.name}: ${hasVal}/${sortedMonths.length} months (${pct}%)`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
