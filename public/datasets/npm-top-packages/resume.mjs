import fs from "node:fs";
import pLimit from "p-limit";
import { stringify } from "csv-stringify/sync";

const SIZE = 10000;
const CONCURRENCY = 50;

const FETCH_OPTS = {
  headers: {
    Accept: "application/json",
    "User-Agent": "npm-top-10000/1.0.0 (research)",
  },
};

const SLEEP_MS = 50; // small delay between tasks to avoid rate limiting
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getMetadata(name, dl) {
  const encoded = encodeURIComponent(name);
  const resp = await fetch(`https://registry.npmjs.org/${encoded}`, FETCH_OPTS);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const doc = await resp.json();
  const latest = doc["dist-tags"]?.latest;
  const v = latest ? doc.versions?.[latest] : {};

  return {
    name,
    downloads_last_month: dl,
    latest,
    description: doc.description ?? "",
    license: v?.license ?? doc.license ?? "",
    homepage: v?.homepage ?? doc.homepage ?? "",
    repository: typeof v?.repository === "string" ? v.repository : v?.repository?.url ?? "",
    keywords: JSON.stringify(v?.keywords ?? doc.keywords ?? []),
    maintainers: JSON.stringify((doc.maintainers ?? []).map((m) => m.name ?? m)),
    created: doc.time?.created ?? "",
    modified: doc.time?.modified ?? "",
    versions_count: Object.keys(doc.versions ?? {}).length,
    dependencies: JSON.stringify(v?.dependencies ?? {}),
    devDependencies: JSON.stringify(v?.devDependencies ?? {}),
    peerDependencies: JSON.stringify(v?.peerDependencies ?? {}),
  };
}

function sanitize(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") {
      out[k] = v.replace(/[\r\n]+/g, " ").trim();
    } else {
      out[k] = v;
    }
  }
  return out;
}

const candidates = JSON.parse(fs.readFileSync("candidates.json", "utf-8"));
console.error(`Loaded ${candidates.length} candidates`);

const limit = pLimit(CONCURRENCY);
let done = 0;
const total = candidates.length;

const rows = await Promise.all(
  candidates.map(([name, dl]) =>
    limit(async () => {
      try {
        await sleep(SLEEP_MS);
        const row = await getMetadata(name, dl);
        done++;
        if (done % 100 === 0) console.error(`progress: ${done}/${total}`);
        return row;
      } catch (err) {
        console.error(`failed ${name}: ${err.message}`);
        done++;
        return null;
      }
    })
  )
);

const clean = rows.filter(Boolean).map(sanitize);
fs.writeFileSync("npm-top-10000.csv", stringify(clean, { header: true }));
console.error(`Wrote npm-top-10000.csv with ${clean.length} rows`);