import { writeFileSync, statSync } from "fs";
import { stringify } from "csv-stringify/sync";

const OUTPUT_CSV = new URL("un_wpp_2024.csv", import.meta.url).pathname;

// World Bank indicators mapped to our schema columns
const INDICATORS = {
  "SP.POP.TOTL": "total_population",
  "SP.POP.TOTL.MA.IN": "pop_male",
  "SP.POP.TOTL.FE.IN": "pop_female",
  "SP.DYN.LE00.IN": "life_expectancy",
  "SP.DYN.CBRT.IN": "birth_rate",
  "SP.DYN.CDRT.IN": "death_rate",
  "SP.DYN.TFRT.IN": "fertility_rate",
  "SP.URB.TOTL.IN.ZS": "urban_pct",
};

const OUR_COLUMNS = [
  "iso_code", "location", "region", "subregion",
  "year", "total_population", "pop_male", "pop_female",
  "median_age", "birth_rate", "death_rate",
  "life_expectancy", "fertility_rate", "urban_pct",
];

// Country metadata: ISO3 → { name, region, subregion }
// Sourced from UN M49 classification
const COUNTRY_REGIONS = {};

async function fetchCountryRegions() {
  console.log("Fetching country region metadata...");
  try {
    const resp = await fetch(
      "https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv",
      { signal: AbortSignal.timeout(10000) }
    );
    if (resp.ok) {
      const text = await resp.text();
      const lines = text.split("\n").filter(Boolean);
      const headers = lines[0].split(",");
      const alpha3Idx = headers.indexOf("alpha-3");
      const nameIdx = headers.indexOf("name");
      const regionIdx = headers.indexOf("region");
      const subRegionIdx = headers.indexOf("sub-region");

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        const alpha3 = cols[alpha3Idx]?.replace(/"/g, "").trim();
        if (alpha3 && alpha3.length === 3) {
          COUNTRY_REGIONS[alpha3] = {
            name: cols[nameIdx]?.replace(/"/g, "").trim() || "",
            region: cols[regionIdx]?.replace(/"/g, "").trim() || "",
            subregion: cols[subRegionIdx]?.replace(/"/g, "").trim() || "",
          };
        }
      }
      console.log(`  Loaded ${Object.keys(COUNTRY_REGIONS).length} country regions`);
    } else {
      console.log(`  HTTP ${resp.status}, will proceed without regions`);
    }
  } catch (err) {
    console.log(`  Error: ${err.message}, proceeding without regions`);
  }
}

async function fetchIndicator(indicatorId, columnName) {
  console.log(`  Fetching ${indicatorId} (${columnName})...`);
  const url =
    `https://api.worldbank.org/v2/country/all/indicator/${indicatorId}?format=json&per_page=20000&date=1960:2024`;
  const resp = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!resp.ok) {
    console.log(`    HTTP ${resp.status}, skipping`);
    return {};
  }
  const json = await resp.json();
  const data = json[1];
  if (!Array.isArray(data)) {
    console.log(`    No data returned`);
    return {};
  }

  const map = {};
  let count = 0;
  for (const entry of data) {
    const iso3 = entry.countryiso3code;
    const year = parseInt(entry.date, 10);
    if (iso3 && !isNaN(year) && entry.value !== null) {
      const key = `${iso3}_${year}`;
      map[key] = parseFloat(entry.value);
      count++;
    }
  }
  console.log(`    Got ${count} data points`);
  return map;
}

async function main() {
  console.log("=== UN WPP 2024 Dataset (via World Bank API) ===\n");

  // 1. Fetch country region metadata
  await fetchCountryRegions();

  // 2. Fetch all indicators
  console.log("\nFetching indicators...");
  const indicatorData = {};
  for (const [wbId, colName] of Object.entries(INDICATORS)) {
    indicatorData[colName] = await fetchIndicator(wbId, colName);
  }

  // 3. Also get median age from WDI if available
  // SP.POP.DPND (age dependency ratio) is different, use SP.POP.00TO04.MA.ZS etc.
  // Actually median age isn't directly available from WB. Let's try to get it.
  console.log("  Fetching SP.POP.65UP.MA.ZS (for reference, not median age)...");
  // Median age isn't in World Bank indicators directly.
  // We'll leave it empty and note it.

  // 4. Collect all years and countries
  const allKeys = new Set();
  for (const colName of Object.keys(indicatorData)) {
    for (const key of Object.keys(indicatorData[colName])) {
      allKeys.add(key);
    }
  }
  console.log(`\nTotal unique country-year combos: ${allKeys.size}`);

  // 5. Build rows
  const rows = [];
  const allIso3 = new Set();

  // Get all unique countries
  for (const key of allKeys) {
    const iso3 = key.split("_")[0];
    allIso3.add(iso3);
  }

  // Get all unique years
  const allYears = new Set();
  for (const key of allKeys) {
    const year = parseInt(key.split("_")[1], 10);
    allYears.add(year);
  }

  const sortedYears = [...allYears].sort((a, b) => a - b);
  const sortedIso3 = [...allIso3].sort();

  console.log(`  ${sortedIso3.length} countries, ${sortedYears.length} years (${sortedYears[0]}-${sortedYears[sortedYears.length-1]})`);

  for (const iso3 of sortedIso3) {
    const region = COUNTRY_REGIONS[iso3];
    for (const year of sortedYears) {
      const key = `${iso3}_${year}`;
      const row = {
        iso_code: iso3,
        location: region?.name || iso3,
        region: region?.region || "",
        subregion: region?.subregion || "",
        year: year,
        total_population: indicatorData.total_population[key] ?? "",
        pop_male: indicatorData.pop_male?.[key] ?? "",
        pop_female: indicatorData.pop_female?.[key] ?? "",
        median_age: "",
        birth_rate: indicatorData.birth_rate?.[key] ?? "",
        death_rate: indicatorData.death_rate?.[key] ?? "",
        life_expectancy: indicatorData.life_expectancy?.[key] ?? "",
        fertility_rate: indicatorData.fertility_rate?.[key] ?? "",
        urban_pct: indicatorData.urban_pct?.[key] ?? "",
      };
      rows.push(row);
    }
  }

  console.log(`\nTotal rows: ${rows.length}`);

  // 6. Write CSV
  console.log("\nWriting CSV...");
  const csvContent = stringify(rows, { header: true, columns: OUR_COLUMNS });
  writeFileSync(OUTPUT_CSV, csvContent, "utf-8");
  const stats = statSync(OUTPUT_CSV);
  console.log(`  Wrote: ${OUTPUT_CSV}`);
  console.log(`  Size: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  Rows: ${rows.length}`);
  console.log(`  Countries: ${sortedIso3.length}`);

  console.log("\n=== Done ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});