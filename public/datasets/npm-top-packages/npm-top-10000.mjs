import fs from "node:fs";
import { stringify } from "csv-stringify/sync";
import pLimit from "p-limit";

const SIZE = 10000;
const CONCURRENCY = 30;

const FETCH_OPTS = {
  headers: {
    Accept: "application/json",
    "User-Agent": "npm-top-10000/1.0.0 (research)",
  },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Phase 1: Collect candidates from search API with rate-limit-friendly sequential pagination.
async function getCandidates() {
  const map = new Map();
  const PAGE_SIZE = 250;

  // 50 diverse broad terms that appear in many package descriptions
  const terms = [
    // Common English words that appear in descriptions
    "the", "module", "support", "simple", "library",
    "node", "cli", "api", "file", "data",
    "test", "run", "use", "tool", "plugin",
    "handler", "loader", "middleware", "service", "client",
    // Common programming terms
    "config", "error", "event", "format", "function",
    "helper", "input", "key", "list", "log",
    "map", "method", "options", "output", "parse",
    "path", "request", "response", "result", "source",
    "string", "target", "type", "update", "util",
    "value", "version", "work", "wrapper", "transform",
  ];

  let termIndex = 0;
  while (map.size < SIZE && termIndex < terms.length) {
    const text = terms[termIndex];
    console.error(`[${termIndex+1}/${terms.length}] Searching term: "${text}" (${map.size} unique so far)`);
    let totalResults = Infinity;
    let consecutiveEmptyPages = 0;
    let pageCount = 0;

    for (let from = 0; map.size < SIZE && from < totalResults && pageCount < 40; from += PAGE_SIZE) {
      if (consecutiveEmptyPages >= 2) break;

      const url =
        `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(text)}` +
        `&size=${PAGE_SIZE}&from=${from}&popularity=1.0&quality=0.0&maintenance=0.0`;

      let resp;
      try {
        resp = await fetch(url, FETCH_OPTS);
      } catch (err) {
        console.error(`fetch error at from=${from}: ${err.message}`);
        await sleep(2000);
        continue;
      }

      if (resp.status === 429 || resp.status === 503) {
        console.error(`rate limited (${resp.status}), sleeping 5s...`);
        await sleep(5000);
        from -= PAGE_SIZE;
        continue;
      }

      if (!resp.ok) {
        console.error(`search failed at from=${from}: ${resp.status}`);
        break;
      }

      const data = await resp.json();
      totalResults = data.total ?? totalResults;
      const objects = data.objects ?? [];
      if (objects.length === 0) break;

      let newInPage = 0;
      for (const obj of objects) {
        const name = obj.package.name;
        if (!map.has(name)) {
          map.set(name, obj.downloads?.monthly ?? 0);
          newInPage++;
        }
      }

      pageCount++;
      if (pageCount % 5 === 0 || newInPage > 0) {
        console.error(`  from=${from}: ${objects.length} results, ${newInPage} new, ${map.size} unique`);
      }

      if (newInPage === 0) {
        consecutiveEmptyPages++;
      } else {
        consecutiveEmptyPages = 0;
      }

      await sleep(200);
    }

    termIndex++;
    await sleep(500);
  }

  console.error(`Total unique packages from search API: ${map.size}`);
  const finalCandidates = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, SIZE);
  // Save candidates checkpoint
  fs.writeFileSync("candidates.json", JSON.stringify(finalCandidates));
  console.error(`Saved candidates checkpoint (${finalCandidates.length} packages)`);
  return finalCandidates;
}

async function getMetadata(name, dl) {
  const encoded = encodeURIComponent(name);
  const resp = await fetch(`https://registry.npmjs.org/${encoded}`, FETCH_OPTS);
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}`);
  }
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
    repository:
      typeof v?.repository === "string"
        ? v.repository
        : v?.repository?.url ?? "",
    keywords: JSON.stringify(v?.keywords ?? doc.keywords ?? []),
    maintainers: JSON.stringify(
      (doc.maintainers ?? []).map((m) => m.name ?? m)
    ),
    created: doc.time?.created ?? "",
    modified: doc.time?.modified ?? "",
    versions_count: Object.keys(doc.versions ?? {}).length,
    dependencies: JSON.stringify(v?.dependencies ?? {}),
    devDependencies: JSON.stringify(v?.devDependencies ?? {}),
    peerDependencies: JSON.stringify(v?.peerDependencies ?? {}),
  };
}

console.error("Phase 1: Collecting candidates from search API...");
let candidates;
if (fs.existsSync("candidates.json")) {
  candidates = JSON.parse(fs.readFileSync("candidates.json", "utf-8"));
  console.error(`Loaded ${candidates.length} candidates from checkpoint`);
} else {
  candidates = await getCandidates();
}
console.error(`Got ${candidates.length} candidates`);

console.error("Phase 2: Fetching metadata...");
const limit = pLimit(CONCURRENCY);
let done = 0;
const total = candidates.length;

const rows = await Promise.all(
  candidates.map(([name, dl]) =>
    limit(async () => {
      try {
        const row = await getMetadata(name, dl);
        done++;
        if (done % 200 === 0 || done === total) {
          console.error(`progress: ${done}/${total}`);
        }
        return row;
      } catch (err) {
        console.error(`failed ${name}: ${err.message}`);
        done++;
        return null;
      }
    })
  )
);

const clean = rows.filter(Boolean);
fs.writeFileSync("npm-top-10000.csv", stringify(clean, { header: true }));
console.error(`Wrote npm-top-10000.csv with ${clean.length} rows`);