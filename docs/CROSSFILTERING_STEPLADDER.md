# Crossfilter stepladder

A practical progression from simplest to fastest.

---

## 1. Local React state + synchronous filtering

Use this first for tiny datasets and to get the interaction model right.

```ts
type Filters = {
  age?: [number, number];
  state?: string[];
};

function filterRows(rows: any[], filters: Filters) {
  return rows.filter((row) => {
    if (filters.age) {
      const [min, max] = filters.age;
      if (row.age < min || row.age > max) return false;
    }
    if (filters.state?.length) {
      if (!filters.state.includes(row.state)) return false;
    }
    return true;
  });
}
```

```tsx
const [filters, setFilters] = useState<Filters>({});

const filteredRows = useMemo(() => filterRows(rows, filters), [rows, filters]);
```

Use when:

- under ~10k rows
- simple dashboard
- correctness first

---

## 2. Centralize filter state

Make one canonical `filters` object and let every chart read/write it.

```tsx
function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
  setFilters((prev) => ({ ...prev, [key]: value }));
}
```

```tsx
<Histogram
  value={filters.age}
  onChange={(range) => updateFilter("age", range)}
/>

<StateFilter
  value={filters.state}
  onChange={(states) => updateFilter("state", states)}
/>
```

Key idea:

- React owns filter state
- charts are controlled components

---

## 3. Throttle recomputation

Keep interaction immediate, but limit expensive recompute.

```ts
function useThrottledValue<T>(value: T, delay: number) {
  const [throttled, setThrottled] = useState(value);
  const lastRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const latestRef = useRef(value);

  useEffect(() => {
    latestRef.current = value;
    const now = Date.now();
    const elapsed = now - lastRef.current;

    const run = () => {
      lastRef.current = Date.now();
      setThrottled(latestRef.current);
      timeoutRef.current = null;
    };

    if (elapsed >= delay) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      run();
    } else if (!timeoutRef.current) {
      timeoutRef.current = window.setTimeout(run, delay - elapsed);
    }
  }, [value, delay]);

  return throttled;
}
```

```tsx
const throttledFilters = useThrottledValue(filters, 500);
const filteredRows = useMemo(() => filterRows(rows, throttledFilters), [rows, throttledFilters]);
```

Better for brushing:

- throttle during drag
- commit final value on brush end

---

## 4. Move filtering into a Web Worker

Now the main thread stays responsive.

### worker

```ts
let dataset: any[] = [];

self.onmessage = (event) => {
  const msg = event.data;

  if (msg.type === 'init') {
    dataset = msg.rows;
    self.postMessage({ type: 'ready' });
    return;
  }

  if (msg.type === 'filter') {
    const { version, filters } = msg;

    const indices: number[] = [];
    for (let i = 0; i < dataset.length; i += 1) {
      const row = dataset[i];
      let pass = true;

      if (filters.age) {
        const [min, max] = filters.age;
        if (row.age < min || row.age > max) pass = false;
      }
      if (pass && filters.state?.length) {
        if (!filters.state.includes(row.state)) pass = false;
      }
      if (pass) indices.push(i);
    }

    self.postMessage({ type: 'result', version, indices });
  }
};
```

### main thread

```ts
const worker = new Worker(new URL('./worker.ts', import.meta.url), {
  type: 'module',
});

worker.postMessage({ type: 'init', rows });
```

Use when:

- filtering starts causing jank
- still okay with full scans in worker

---

## 5. Single-flight worker scheduling

Only one worker job runs at a time. Latest state wins.

```ts
let version = 0;
let latestRequestedVersion = 0;
let inFlightVersion: number | null = null;

function requestCompute(filters: Filters) {
  const nextVersion = ++version;
  latestRequestedVersion = nextVersion;

  if (inFlightVersion == null) {
    inFlightVersion = nextVersion;
    worker.postMessage({ type: 'filter', version: nextVersion, filters });
  }
}

worker.onmessage = (event) => {
  const { version, indices } = event.data;

  setIndices(indices);
  inFlightVersion = null;

  if (latestRequestedVersion > version) {
    inFlightVersion = latestRequestedVersion;
    worker.postMessage({
      type: 'filter',
      version: latestRequestedVersion,
      filters: latestFiltersRef.current,
    });
  }
};
```

Key idea:

- no queue
- no `shallowEqual`
- version numbers only

---

## 6. Return indices, not full rows

Avoid sending big cloned objects across threads.

```ts
self.postMessage({ type: 'result', version, indices });
```

```tsx
const filteredRows = useMemo(() => indices.map((i) => rows[i]), [indices, rows]);
```

Even better:

- charts consume `rows + indices`
- only tables reconstruct full rows

---

## 7. URL-sync committed filter state

Now deep linking and back/forward work.

### parse + serialize

```ts
type UrlSchema = {
  age: { type: 'numeric-range' };
  state: { type: 'categorical-set' };
};

function parseFilters(params: URLSearchParams): Filters {
  const filters: Filters = {};

  const age = params.get('age');
  if (age) {
    const m = age.match(/^(-?\d+\.?\d*)\.\.(-?\d+\.?\d*)$/);
    if (m) filters.age = [Number(m[1]), Number(m[2])];
  }

  const states = params.getAll('state');
  if (states.length) filters.state = states;

  return filters;
}

function serializeFilters(filters: Filters) {
  const params = new URLSearchParams();

  if (filters.age) {
    params.set('age', `${filters.age[0]}..${filters.age[1]}`);
  }
  if (filters.state) {
    for (const s of filters.state) params.append('state', s);
  }

  return params;
}
```

### React Router hook

```tsx
const [searchParams, setSearchParams] = useSearchParams();

const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

function patchFilters(patch: Partial<Filters>, history: 'push' | 'replace' = 'replace') {
  const next = { ...filters, ...patch };
  setSearchParams(serializeFilters(next), {
    replace: history !== 'push',
  });
}
```

Use:

- `replace` while dragging
- `push` on commit

---

## 8. URL becomes source of truth

Stop duplicating committed filter state in React.

```txt
URL -> parse -> filters -> worker -> results -> charts
```

Only keep transient state locally.

```tsx
const [agePreview, setAgePreview] = useState<[number, number] | undefined>();

const effectiveFilters = {
  ...filtersFromUrl,
  age: agePreview ?? filtersFromUrl.age,
};
```

Pattern:

- local preview during drag
- URL on commit
- worker uses `preview ?? committed`

---

## 9. Move aggregation into the worker

Do not return only indices. Return chart-ready data.

```ts
self.postMessage({
  type: 'result',
  version,
  selectedCount: indices.length,
  histograms: {
    age: { min, max, step, counts },
  },
  categoryCounts: {
    state: [
      ['NY', 42],
      ['CA', 31],
    ],
  },
  scatter: {
    x: scatterX,
    y: scatterY,
  },
});
```

Main thread becomes render-only.

```tsx
<Histogram counts={result.histograms.age.counts} />
<BarChart counts={result.categoryCounts.state} />
<Scatterplot x={result.scatter.x} y={result.scatter.y} />
```

This is the first big production-grade jump.

---

## 10. Columnar storage in the worker

Convert rows to columns once.

```ts
const age = Float64Array.from(rows.map((r) => r.age));
const income = Float64Array.from(rows.map((r) => r.income));
const state = rows.map((r) => r.state);
```

Why:

- less property lookup
- better cache locality
- much faster scans

---

## 11. Bitset masks per dimension

Represent passing rows with bitsets.

```ts
function createBitset(n: number) {
  return new Uint32Array(Math.ceil(n / 32));
}

function setBit(bs: Uint32Array, i: number) {
  bs[i >> 5] |= 1 << (i & 31);
}

function getBit(bs: Uint32Array, i: number) {
  return (bs[i >> 5] >>> (i & 31)) & 1;
}
```

Each dimension gets its own mask:

```txt
ageMask
stateMask
incomeMask
```

Then combine:

```ts
for (let word = 0; word < combined.length; word += 1) {
  combined[word] = ageMask[word] & stateMask[word] & incomeMask[word];
}
```

---

## 12. Sorted numeric indexes + binary search

For numeric range filters, avoid scanning whole columns.

```ts
function stableSortedIndex(values: Float64Array) {
  return Uint32Array.from(
    Array.from({ length: values.length }, (_, i) => i).sort((a, b) => values[a] - values[b]),
  );
}
```

```ts
function lowerBound(index: Uint32Array, values: Float64Array, x: number) {
  let lo = 0,
    hi = index.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (values[index[mid]] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
```

Apply range filter:

```ts
mask.fill(0);
const start = lowerBound(index, values, min);
const end = upperBound(index, values, max);

for (let i = start; i < end; i += 1) {
  setBit(mask, index[i]);
}
```

Now range filtering is closer to:

- `O(log N + K)` instead of `O(N)`

---

## 13. Encoded categorical columns

Encode strings once.

```ts
const valueToCode = new Map<string, number>();
const codeToValue: string[] = [];
const encoded = new Uint32Array(rows.length);
const buckets = new Map<number, number[]>();

for (let i = 0; i < rows.length; i += 1) {
  const raw = rows[i].state;
  let code = valueToCode.get(raw);
  if (code == null) {
    code = codeToValue.length;
    valueToCode.set(raw, code);
    codeToValue.push(raw);
    buckets.set(code, []);
  }
  encoded[i] = code;
  buckets.get(code)!.push(i);
}
```

Apply categorical filter:

```ts
mask.fill(0);
for (const value of selectedValues) {
  const code = valueToCode.get(value);
  if (code == null) continue;
  for (const rowIndex of buckets.get(code) ?? []) {
    setBit(mask, rowIndex);
  }
}
```

---

## 14. Full worker-side crossfilter engine

Now the worker owns:

- column store
- per-dimension masks
- combined mask
- aggregations

```ts
class CrossfilterEngine {
  compute(viewState: DashboardViewState) {
    this.applyFilters(viewState.filters);
    this.recomputeCombinedMask();

    return {
      selectedCount: this.selectedCount(),
      histograms:
        viewState.histograms?.map((h) => this.histogram(h.column, h.bins, h.domain)) ?? [],
      categoryCounts:
        viewState.categoryCounts?.map((c) => this.categoryCount(c.column, c.limit)) ?? [],
      scatter: viewState.scatter ? this.scatter(viewState.scatter) : undefined,
    };
  }
}
```

This is the clean “real” architecture.

---

## 15. React Router + worker + preview state together

The complete control flow:

```txt
React Router URL
  -> parse committed view state
  -> merge local preview state
  -> send effective state to worker
  -> render worker result
```

```tsx
const { viewState, patchViewState } = useDashboardUrlState(schema, defaults);
const [agePreview, setAgePreview] = useState<[number, number] | undefined>();

const effectiveViewState = useMemo(
  () => ({
    ...viewState,
    filters: {
      ...viewState.filters,
      age: agePreview ?? viewState.filters.age,
    },
  }),
  [viewState, agePreview],
);

const { result, isComputing } = useCrossfilterWorker(workerUrl, rows, schema, effectiveViewState);
```

Brush pattern:

```tsx
onBrush={(range) => {
  setAgePreview(range);               // local
}}

onBrushEnd={(range) => {
  setAgePreview(undefined);
  patchViewState({
    filters: { ...viewState.filters, age: range }
  }, "push");                         // URL commit
}}
```

---

## 16. Next-level production choices

### A. Aggregates only

Fastest default.

```ts
type ComputeResult = {
  selectedCount: number;
  histograms: HistogramResult[];
  categoryCounts: CategoryCountResult[];
  scatter?: ScatterResult;
};
```

### B. Include filtered indices

Needed for tables and exports.

```ts
type ComputeResult = {
  filteredIndices?: number[];
};
```

### C. Transfer typed arrays

Best for large scatter payloads.

```ts
self.postMessage({ x, y }, [x.buffer, y.buffer]);
```

### D. Ignore-self linked views

For classic crossfilter semantics, each chart is computed without its own dimension’s filter.

```txt
hist(age) uses all filters except age
bar(state) uses all filters except state
```

This needs per-chart mask composition.

### E. Worker-side paging

For large result tables, send only one page.

```ts
type TablePageRequest = { offset: number; limit: number };
```

### F. Incremental dimension updates

Current bitset combination is already fast. The next step is updating only changed rows and changed dimensions.

---

## 17. Recommended stopping points

### Good enough

- centralized filters
- worker filtering
- single-flight scheduling
- URL-synced committed filters

### Strong production baseline

- worker-side aggregates
- columnar storage
- bitsets
- sorted numeric indexes
- React Router source-of-truth URL

### Advanced

- ignore-self linked views
- transferables
- paging
- incremental updates
- compressed full dashboard state in URL

---

## 18. Final mental model

```txt
Level 1  : rows + filter()
Level 2  : centralized filters
Level 3  : throttling
Level 4  : worker full scans
Level 5  : single-flight worker
Level 6  : indices not rows
Level 7  : URL-synced committed state
Level 8  : URL as source of truth
Level 9  : worker-side aggregates
Level 10 : columnar storage
Level 11 : bitset masks
Level 12 : sorted numeric indexes
Level 13 : encoded categorical buckets
Level 14 : full crossfilter engine in worker
Level 15 : router + worker + preview architecture
Level 16 : transferables / ignore-self / paging / incremental updates
```

## 19. The simplest clean target

If you want one target architecture to implement and stop, choose this:

- React Router URL owns committed state
- local React state owns in-progress brush preview
- worker owns filtering + aggregation
- worker uses columnar storage + bitsets
- main thread renders only chart-ready results
- single-flight latest-wins scheduling

That is the best balance of:

- clean
- simple
- fast
- shareable
- scalable

If you want, I can turn this outline into a one-file “architecture README” formatted for your codebase.
