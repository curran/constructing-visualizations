import { createReadStream, createWriteStream, statSync } from "fs";
import { parse } from "csv-parse";
import { stringify } from "csv-stringify/sync";

const INPUT = new URL("bls_qcew_county.csv", import.meta.url).pathname;

// Output definitions: [filename, description, filterFn]
const DERIVED = [
  {
    file: "bls_qcew_county_all_industries.csv",
    desc: "'All Industries' (code=00) for all years, all counties",
    filter: (r) => r.industry_code === "00",
  },
  {
    file: "bls_qcew_county_all_industries_2024.csv",
    desc: "'All Industries' (code=00) for 2024 only",
    filter: (r) => r.industry_code === "00" && r.year === "2024",
  },
  {
    file: "bls_qcew_county_manufacturing.csv",
    desc: "Manufacturing (code=31-33) for all years, all counties",
    filter: (r) => r.industry_code === "31-33",
  },
  {
    file: "bls_qcew_county_2024.csv",
    desc: "All industry codes for 2024 only",
    filter: (r) => r.year === "2024",
  },
];

async function main() {
  console.log("Reading source CSV...");
  const rows = [];
  const parser = createReadStream(INPUT).pipe(
    parse({ columns: true, relax_quotes: true, relax_column_count: true })
  );
  for await (const row of parser) {
    // Normalise whitespace in industry_name
    if (row.industry_name) {
      row.industry_name = row.industry_name.replace(/\s+/g, " ").trim();
    }
    rows.push(row);
  }
  console.log(`  Read ${rows.length} rows\n`);

  const STATS = [];

  for (const { file, desc, filter } of DERIVED) {
    const filtered = rows.filter(filter);
    const csv = stringify(filtered, { header: true });
    const outPath = new URL(file, import.meta.url).pathname;
    createWriteStream(outPath).end(csv);
    const stats = statSync(outPath);
    STATS.push({ file, desc, rows: filtered.length, size: stats.size });
    console.log(
      `  ✅ ${file}  (${filtered.length.toLocaleString()} rows, ${(stats.size / 1024).toFixed(0)} KB)  ${desc}`
    );
  }

  console.log(`\nAll 4 derived files created.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});