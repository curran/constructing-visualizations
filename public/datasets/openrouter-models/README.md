# OpenRouter Models API

**Snapshot of AI models available on OpenRouter with pricing and capabilities.**

A dated snapshot of all models available on the OpenRouter platform. Each row
contains the model identifier, human-readable name, provider, context length,
pricing per token, modality, and a short description. Useful for analyzing
the landscape of available LLMs and their pricing.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `openrouter_models.csv` | 114 KB | 339 rows × 10 columns |

---

## Schema (10 columns)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `model_id` | string | Model identifier | `anthropic/claude-3.5-sonnet` |
| 2 | `name` | string | Human-readable name | `Claude 3.5 Sonnet` |
| 3 | `provider` | string | Top provider name | `Anthropic` |
| 4 | `context_length` | number | Max context tokens | `200000` |
| 5 | `prompt_price_per_token` | number | Price per prompt token ($) | `0.000003` |
| 6 | `completion_price_per_token` | number | Price per completion token ($) | `0.000015` |
| 7 | `modality` | string | text, multimodal, etc. | `multimodal` |
| 8 | `snapshot_date` | string | ISO date of snapshot | `2026-06-26` |
| 9 | `description` | string | Short description | `Best all-round model for complex tasks` |
| 10 | `created_timestamp` | number | Model creation timestamp | `1728000000` |

---

## Methodology

### Source
```
https://openrouter.ai/api/v1/models
```

### Processing Steps

1. **Fetch** from `https://openrouter.ai/api/v1/models` (no API key required).
2. **Parse** JSON array of model objects.
3. **Extract** fields: `id`, `name`, `created`, `context_length`,
   `pricing.prompt`, `pricing.completion`, `architecture.modality`,
   `architecture.tokenizer`, `top_provider`, `description`.
4. **Add** `snapshot_date` column set to the fetch date.
5. **Write CSV**.

### Prerequisites

- Node.js ≥ 18 (built-in `fetch`)

### Expected Runtime

~5 seconds (single API call).

---

## Usage Ideas

- **Bar chart**: model pricing comparison (prompt vs. completion)
- **Table**: sortable/filterable model catalog
- **Scatter plot**: context length vs. price per token
- **Treemap**: models grouped by provider
- **Course use**: API data fetching, data table visualization

---

## License

Data sourced from OpenRouter's public API. No license restrictions.