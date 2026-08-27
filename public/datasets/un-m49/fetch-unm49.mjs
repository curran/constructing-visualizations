#!/usr/bin/env node

// fetch-unm49.mjs — Download UN M49 country classification and build hierarchy CSV
// No dependencies required (uses built-in fetch).
//
// Source: https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv
// This is the only reliably available source; the direct UN Stats URL and
// the UN-M49/UN-M49 GitHub repo are no longer accessible (404).

const SOURCE_URL =
  'https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv';
const CSV_FILE = 'un_m49_hierarchy.csv';

// The source CSV columns (from lukes/ISO-3166):
//   1: name            — Country or area name
//   2: alpha-2         — ISO 3166-1 alpha-2 code
//   3: alpha-3         — ISO 3166-1 alpha-3 code
//   4: country-code    — UN M49 numeric code
//   5: iso_3166-2      — ISO 3166-2 code (e.g. "ISO 3166-2:AF")
//   6: region          — Region name (e.g. "Asia")
//   7: sub-region      — Sub-region name (e.g. "Southern Asia")
//   8: intermediate-region — Intermediate region name (e.g. "Middle Africa")
//   9: region-code     — M49 region code
//  10: sub-region-code — M49 sub-region code
//  11: intermediate-region-code — M49 intermediate region code

const HEADERS = [
  'name',
  'level',
  'm49_code',
  'iso_alpha3',
  'parent_name',
  'parent_m49',
  'region_name',
  'subregion_name',
];

// ---------------------------------------------------------------------------
// CSV parser (handles quoted fields with embedded commas/newlines)
// ---------------------------------------------------------------------------

function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

function escapeCsvField(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function toCsvRow(values, keys) {
  const obj = {};
  for (let i = 0; i < keys.length; i++) {
    obj[keys[i]] = values[i];
  }
  return keys.map((k) => escapeCsvField(obj[k])).join(',');
}

// ---------------------------------------------------------------------------
// Main logic
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Fetching ${SOURCE_URL}...`);

  const res = await fetch(SOURCE_URL);
  if (!res.ok) {
    throw new Error(`Source returned ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  const lines = text.trim().split('\n');
  console.log(`Fetched ${lines.length} lines`);

  // Parse header
  const headerFields = parseCsvLine(lines[0]);
  // Column index map
  const colIndex = {};
  headerFields.forEach((name, i) => {
    colIndex[name.trim().toLowerCase()] = i;
  });

  const COL_NAME = colIndex['name'];
  const COL_ALPHA3 = colIndex['alpha-3'];
  const COL_COUNTRY_CODE = colIndex['country-code'];
  const COL_REGION = colIndex['region'];
  const COL_SUBREGION = colIndex['sub-region'];
  const COL_INTERMEDIATE = colIndex['intermediate-region'];
  const COL_REGION_CODE = colIndex['region-code'];
  const COL_SUBREGION_CODE = colIndex['sub-region-code'];
  const COL_INTERMEDIATE_CODE = colIndex['intermediate-region-code'];

  if (COL_NAME === undefined) throw new Error('Could not find column "name"');
  if (COL_REGION === undefined) throw new Error('Could not find column "region"');
  if (COL_COUNTRY_CODE === undefined) throw new Error('Could not find column "country-code"');

  // Parse rows (skip header)
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      rows.push(parseCsvLine(lines[i]));
    }
  }
  console.log(`Parsed ${rows.length} data rows`);

  // ---------------------------------------------------------------------------
  // Step 1: Build the hierarchy maps from country rows
  // ---------------------------------------------------------------------------

  // Collect unique region entities
  const regionMap = new Map();   // m49_code -> { name, m49_code }
  const subRegionMap = new Map(); // m49_code -> { name, m49_code, region_code }
  const interRegionMap = new Map(); // m49_code -> { name, m49_code, subregion_code }

  // Also track which sub-region belongs to which region, and which
  // intermediate region belongs to which sub-region.
  const regionToSubRegions = new Map(); // region_code -> Set<subregion_code>
  const subRegionToInterRegions = new Map(); // subregion_code -> Set<inter_code>

  // Collect countries
  const countries = [];

  for (const row of rows) {
    const name = row[COL_NAME];
    const alpha3 = row[COL_ALPHA3] || '';
    const countryCode = row[COL_COUNTRY_CODE] || '';

    if (!countryCode) continue;

    const regionName = row[COL_REGION] || '';
    const subRegionName = row[COL_SUBREGION] || '';
    const interRegionName = row[COL_INTERMEDIATE] || '';
    const regionCode = row[COL_REGION_CODE] || '';
    const subRegionCode = row[COL_SUBREGION_CODE] || '';
    const interRegionCode = row[COL_INTERMEDIATE_CODE] || '';

    // Collect region entity
    if (regionName && regionCode) {
      regionMap.set(regionCode, { name: regionName, m49_code: regionCode });
    }

    // Collect sub-region entity with its parent region
    if (subRegionName && subRegionCode) {
      subRegionMap.set(subRegionCode, {
        name: subRegionName,
        m49_code: subRegionCode,
        region_code: regionCode,
      });
      if (regionCode) {
        if (!regionToSubRegions.has(regionCode)) {
          regionToSubRegions.set(regionCode, new Set());
        }
        regionToSubRegions.get(regionCode).add(subRegionCode);
      }
    }

    // Collect intermediate region entity with its parent sub-region
    if (interRegionName && interRegionCode) {
      interRegionMap.set(interRegionCode, {
        name: interRegionName,
        m49_code: interRegionCode,
        subregion_code: subRegionCode,
      });
      if (subRegionCode) {
        if (!subRegionToInterRegions.has(subRegionCode)) {
          subRegionToInterRegions.set(subRegionCode, new Set());
        }
        subRegionToInterRegions.get(subRegionCode).add(interRegionCode);
      }
    }

    countries.push({
      name,
      alpha3,
      countryCode,
      regionName,
      subRegionName,
      interRegionName,
      regionCode,
      subRegionCode,
      interRegionCode,
    });
  }

  // ---------------------------------------------------------------------------
  // Step 2: Assemble the hierarchy entity list
  // ---------------------------------------------------------------------------

  const entities = [];

  // Helper: find entity by m49_code
  function findEntity(code) {
    return entities.find((e) => e.m49_code === code);
  }

  // 2a. World (level 0)
  entities.push({
    name: 'World',
    level: 0,
    m49_code: '001',
    iso_alpha3: '',
    parent_name: '',
    parent_m49: '',
    region_name: '',
    subregion_name: '',
  });

  // 2b. Regions (level 1) — parent = World
  for (const [code, reg] of regionMap) {
    entities.push({
      name: reg.name,
      level: 1,
      m49_code: code,
      iso_alpha3: '',
      parent_name: 'World',
      parent_m49: '001',
      region_name: reg.name,
      subregion_name: '',
    });
  }

  // 2c. Sub-regions (level 2) — parent = Region
  for (const [code, sub] of subRegionMap) {
    const regionEntity = findEntity(sub.region_code);
    entities.push({
      name: sub.name,
      level: 2,
      m49_code: code,
      iso_alpha3: '',
      parent_name: regionEntity ? regionEntity.name : 'World',
      parent_m49: regionEntity ? regionEntity.m49_code : '001',
      region_name: regionEntity ? regionEntity.name : '',
      subregion_name: sub.name,
    });
  }

  // 2d. Intermediate Regions (level 3) — parent = Sub-region
  for (const [code, inter] of interRegionMap) {
    const subEntity = findEntity(inter.subregion_code);
    const regionEntity = subEntity ? findEntity(subEntity.parent_m49) : null;
    entities.push({
      name: inter.name,
      level: 3,
      m49_code: code,
      iso_alpha3: '',
      parent_name: subEntity ? subEntity.name : 'World',
      parent_m49: subEntity ? subEntity.m49_code : '001',
      region_name: regionEntity ? regionEntity.name : (subEntity ? subEntity.region_name : ''),
      subregion_name: subEntity ? subEntity.name : '',
    });
  }

  // 2e. Countries (level 4)
  for (const c of countries) {
    // Determine direct parent
    let parentName = 'World';
    let parentM49 = '001';
    let regionName = '';
    let subregionName = '';

    if (c.interRegionCode && findEntity(c.interRegionCode)) {
      const parent = findEntity(c.interRegionCode);
      parentName = parent.name;
      parentM49 = parent.m49_code;
      regionName = parent.region_name;
      subregionName = parent.subregion_name;
    } else if (c.subRegionCode && findEntity(c.subRegionCode)) {
      const parent = findEntity(c.subRegionCode);
      parentName = parent.name;
      parentM49 = parent.m49_code;
      regionName = parent.region_name;
      subregionName = parent.name;
    } else if (c.regionCode && findEntity(c.regionCode)) {
      const parent = findEntity(c.regionCode);
      parentName = parent.name;
      parentM49 = parent.m49_code;
      regionName = parent.name;
      subregionName = '';
    }

    // Handle edge cases (Antarctica, Taiwan — no region info)
    if (!c.regionCode && !c.subRegionCode && !c.interRegionCode) {
      parentName = 'World';
      parentM49 = '001';
      regionName = '';
      subregionName = '';
    }

    entities.push({
      name: c.name,
      level: 4,
      m49_code: c.countryCode,
      iso_alpha3: c.alpha3,
      parent_name: parentName,
      parent_m49: parentM49,
      region_name: regionName,
      subregion_name: subregionName,
    });
  }

  console.log(`Built hierarchy with ${entities.length} entities`);

  // ---------------------------------------------------------------------------
  // Step 3: Write CSV
  // ---------------------------------------------------------------------------

  const csvLines = [toCsvRow(HEADERS, HEADERS)];
  for (const entity of entities) {
    csvLines.push(
      toCsvRow(
        [
          entity.name,
          String(entity.level),
          entity.m49_code,
          entity.iso_alpha3,
          entity.parent_name,
          entity.parent_m49,
          entity.region_name,
          entity.subregion_name,
        ],
        HEADERS
      )
    );
  }
  const csvContent = csvLines.join('\n') + '\n';

  const { writeFileSync } = await import('fs');
  writeFileSync(CSV_FILE, csvContent, 'utf-8');

  const fileSize = Buffer.byteLength(csvContent, 'utf-8');
  console.log(`Wrote ${CSV_FILE} (${entities.length} rows, ${fileSize} bytes)`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
