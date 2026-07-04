#!/usr/bin/env node

/**
 * fetch-onlineretail.mjs
 *
 * Downloads UCI Online Retail II Excel file, parses it, filters out
 * cancellations and invalid rows, aggregates by month/country/product,
 * and writes online_retail_ii.csv.
 *
 * Usage: node fetch-onlineretail.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";
import { stringify } from "csv-stringify/sync";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// URLs to try in order
const URLS = [
  "https://archive.ics.uci.edu/ml/machine-learning-databases/00502/online_retail_II.xlsx",
  "https://archive.ics.uci.edu/static/public/502/online+retail+ii.zip",
];

const EXCEL_FILENAME = "online_retail_II.xlsx";
const OUTPUT_FILENAME = "online_retail_ii.csv";

/**
 * Downloads a file from a URL to a local path.
 */
async function download(url, dest) {
  console.log(`Downloading ${url} ...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Download failed: HTTP ${response.status} ${response.statusText}`
    );
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(dest, buffer);
  console.log(`Downloaded ${buffer.length} bytes to ${dest}`);
}

/**
 * Attempts to download the Excel file from each URL in order.
 */
async function downloadExcel() {
  const dest = path.join(__dirname, EXCEL_FILENAME);

  for (const url of URLS) {
    try {
      await download(url, dest);
      return dest;
    } catch (err) {
      console.warn(`  Failed: ${err.message}`);
    }
  }

  if (fs.existsSync(dest)) {
    console.log(`Using existing file: ${dest}`);
    return dest;
  }

  throw new Error(
    "Could not download the Excel file from any URL and no local copy exists."
  );
}

/**
 * Parse an InvoiceDate value into an ISO month string "YYYY-MM".
 * Handles JS Date objects, Excel serial numbers, and date string formats.
 */
function toMonth(value) {
  if (value == null) return null;

  // Already a Date object
  if (value instanceof Date && !isNaN(value.getTime())) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
  }

  // Number — Excel serial date
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return `${parsed.y}-${String(parsed.m).padStart(2, "0")}`;
    }
    return null;
  }

  // String — try to parse
  const s = value.toString().trim();
  // UCI format: DD/MM/YYYY HH:MM:SS
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) {
    return `${m[3]}-${String(parseInt(m[2], 10)).padStart(2, "0")}`;
  }
  // ISO fallback
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  return null;
}

/**
 * Process rows from a single sheet, returning filtered + transformed rows.
 */
function processSheet(rows) {
  const results = [];
  let skipMissing = 0;
  let skipCancel = 0;
  let skipBadQty = 0;
  let skipBadPrice = 0;
  let skipBadDate = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const invoice = row.Invoice || row.InvoiceNo || "";
    const stockCode = row.StockCode || "";
    const description = (row.Description || "").toString().trim();
    const quantity = parseFloat(row.Quantity);
    const price = parseFloat(row.UnitPrice || row.Price);
    const invoiceDate = row.InvoiceDate || row.Date;
    const customerId = row.CustomerID || row.CustomerId || "";
    const country = (row.Country || "").toString().trim();

    // Skip rows missing critical fields
    if (!invoice || !stockCode || !description || !invoiceDate || !country) {
      skipMissing++;
      continue;
    }

    // Skip cancellations (Invoice starts with "C")
    const invoiceStr = invoice.toString().trim().toUpperCase();
    if (invoiceStr.startsWith("C")) {
      skipCancel++;
      continue;
    }

    // Skip non-positive quantity
    if (isNaN(quantity) || quantity <= 0) {
      skipBadQty++;
      continue;
    }

    // Skip non-positive price
    if (isNaN(price) || price <= 0) {
      skipBadPrice++;
      continue;
    }

    // Parse month
    const month = toMonth(invoiceDate);
    if (!month) {
      skipBadDate++;
      continue;
    }

    results.push({
      month,
      country,
      stockCode: stockCode.toString().trim(),
      description,
      quantity,
      revenue: quantity * price,
      invoiceKey: invoiceStr,
      customerId: customerId.toString().trim(),
    });
  }

  if (skipMissing > 0) console.log(`    filter: missing=${skipMissing}`);
  if (skipCancel > 0) console.log(`    filter: cancellation=${skipCancel}`);
  if (skipBadQty > 0) console.log(`    filter: badQty=${skipBadQty}`);
  if (skipBadPrice > 0) console.log(`    filter: badPrice=${skipBadPrice}`);
  if (skipBadDate > 0) console.log(`    filter: badDate=${skipBadDate}`);

  return results;
}

/**
 * Main processing pipeline.
 */
async function main() {
  // 1. Download (or find) the Excel file
  const xlsxPath = await downloadExcel();

  // 2. Read workbook
  console.log("Reading workbook (this may take a moment)...");
  const workbook = XLSX.readFile(xlsxPath, { cellDates: true });

  // 3. Collect all rows from all sheets (avoid spread on large arrays to prevent stack overflow)
  const allFiltered = [];

  for (let si = 0; si < workbook.SheetNames.length; si++) {
    const sheetName = workbook.SheetNames[si];
    console.log(`\nProcessing sheet: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
    console.log(`  ${rows.length} raw rows`);
    const filtered = processSheet(rows);
    console.log(`  ${filtered.length} valid rows`);
    // Use push in a loop to avoid stack overflow from spread operator on large arrays
    for (let j = 0; j < filtered.length; j++) {
      allFiltered.push(filtered[j]);
    }
  }

  console.log(`\nTotal valid rows: ${allFiltered.length}`);

  // 4. Aggregate by month + country + stockCode + description
  console.log("Aggregating...");
  const aggMap = new Map();
  const startTime = Date.now();

  for (let i = 0; i < allFiltered.length; i++) {
    const row = allFiltered[i];
    const key =
      row.month + "|" + row.country + "|" + row.stockCode + "|" + row.description;
    let existing = aggMap.get(key);
    if (existing) {
      existing.total_quantity += row.quantity;
      existing.total_revenue += row.revenue;
      if (row.invoiceKey) existing.invoices.add(row.invoiceKey);
      if (row.customerId) existing.customers.add(row.customerId);
    } else {
      const invoices = row.invoiceKey ? new Set([row.invoiceKey]) : new Set();
      const customers = row.customerId ? new Set([row.customerId]) : new Set();
      aggMap.set(key, {
        month: row.month,
        country: row.country,
        stock_code: row.stockCode,
        description: row.description,
        total_quantity: row.quantity,
        total_revenue: row.revenue,
        invoices,
        customers,
      });
    }
  }

  const aggTime = Date.now() - startTime;
  console.log(`Aggregation complete in ${aggTime}ms`);
  console.log(`Unique groups: ${aggMap.size}`);

  // 5. Convert to flat sorted array
  console.log("Sorting and formatting...");
  const aggregated = [];
  for (const item of aggMap.values()) {
    aggregated.push({
      month: item.month,
      country: item.country,
      stock_code: item.stock_code,
      description: item.description,
      total_quantity: Math.round(item.total_quantity),
      total_revenue: Math.round(item.total_revenue * 100) / 100,
      num_transactions: item.invoices.size,
      num_customers: item.customers.size,
    });
  }

  aggregated.sort((a, b) => {
    if (a.month !== b.month) return a.month < b.month ? -1 : 1;
    if (a.country !== b.country) return a.country < b.country ? -1 : 1;
    return a.stock_code < b.stock_code ? -1 : a.stock_code > b.stock_code ? 1 : 0;
  });

  console.log(`Sorted ${aggregated.length} rows`);

  // 6. Write CSV
  const csvPath = path.join(__dirname, OUTPUT_FILENAME);
  const csvContent = stringify(aggregated, {
    header: true,
    columns: [
      "month",
      "country",
      "stock_code",
      "description",
      "total_quantity",
      "total_revenue",
      "num_transactions",
      "num_customers",
    ],
  });
  fs.writeFileSync(csvPath, csvContent, "utf-8");

  const stats = fs.statSync(csvPath);
  console.log(`\nWrote ${csvPath}`);
  console.log(`  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Rows: ${aggregated.length}`);
  console.log("Done.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
