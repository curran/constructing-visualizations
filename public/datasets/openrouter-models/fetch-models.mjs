#!/usr/bin/env node

// fetch-models.mjs — Fetch OpenRouter models and write CSV
// No dependencies required (uses built-in fetch).

const API_URL = 'https://openrouter.ai/api/v1/models';
const CSV_FILE = 'openrouter_models.csv';

const HEADERS = [
  'model_id',
  'name',
  'provider',
  'context_length',
  'prompt_price_per_token',
  'completion_price_per_token',
  'modality',
  'snapshot_date',
  'description',
  'created_timestamp',
];

function providerFromId(id) {
  // Extract provider from model ID prefix (e.g. 'anthropic/claude-3' -> 'Anthropic')
  // Also handles leading '~' prefix (e.g. '~anthropic/...' -> 'Anthropic')
  const prefix = id.split('/')[0].replace(/^~/, '');
  const lower = prefix.toLowerCase();

  // Known provider name mappings
  const known = {
    openai: 'OpenAI',
    mistralai: 'Mistral AI',
    moonshotai: 'Moonshot AI',
    rekaai: 'Reka AI',
    inclusionai: 'Inclusion AI',
    allenai: 'Allen AI',
    bytedance: 'ByteDance',
    'bytedance-seed': 'ByteDance Seed',
    deepseek: 'DeepSeek',
    anthropic: 'Anthropic',
    sao10k: 'Sao10k',
    'x-ai': 'xAI',
    'z-ai': 'Z-AI',
    'arcee-ai': 'Arcee AI',
    ibm: 'IBM',
    'ibm-granite': 'IBM Granite',
    'nex-agi': 'Nex AGI',
    'anthracite-org': 'Anthracite',
    'ai21': 'AI21',
    'aion-labs': 'Aion Labs',
    cognitivecomputations: 'Cognitive Computations',
    deepcogito: 'DeepCogito',
    gryphe: 'Gryphe',
    kwaipilot: 'Kwai Pilot',
    nvidia: 'NVIDIA',
    nousresearch: 'Nous Research',
    stepfun: 'StepFun',
  };

  if (known[lower]) return known[lower];

  // Default: title-case each hyphen-separated segment, promote 'ai' -> 'AI'
  return prefix
    .split('-')
    .map((part) => {
      const lc = part.toLowerCase();
      if (lc === 'ai') return 'AI';
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

function escapeCsvField(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function toCsvRow(obj, keys) {
  return keys.map((k) => escapeCsvField(obj[k])).join(',');
}

async function main() {
  console.log(`Fetching ${API_URL}...`);

  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error(`API returned ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  // The OpenRouter API returns { data: [...] }
  const models = Array.isArray(json) ? json : json.data;
  if (!Array.isArray(models)) {
    throw new Error(
      `Unexpected API response shape — expected array or { data: array }`
    );
  }

  console.log(`Fetched ${models.length} models`);

  const snapshotDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const rows = models.map((m) => {
    const pricing = m.pricing || {};
    const architecture = m.architecture || {};

    return {
      model_id: m.id ?? '',
      name: m.name ?? '',
      provider: providerFromId(m.id),
      context_length: m.context_length ?? '',
      prompt_price_per_token: pricing.prompt ?? '',
      completion_price_per_token: pricing.completion ?? '',
      modality: architecture.modality ?? '',
      snapshot_date: snapshotDate,
      description: m.description ?? '',
      created_timestamp: m.created ?? '',
    };
  });

  // Build CSV content
  const csvLines = [toCsvRow(Object.fromEntries(HEADERS.map((h) => [h, h])), HEADERS)];
  for (const row of rows) {
    csvLines.push(toCsvRow(row, HEADERS));
  }
  const csvContent = csvLines.join('\n') + '\n';

  const { writeFileSync } = await import('fs');
  writeFileSync(CSV_FILE, csvContent, 'utf-8');

  const fileSize = Buffer.byteLength(csvContent, 'utf-8');
  console.log(`Wrote ${CSV_FILE} (${rows.length} data rows, ${fileSize} bytes)`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});