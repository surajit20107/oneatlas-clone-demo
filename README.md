# OneAtlas

**An open catalogue for discovering, comparing, and evaluating AI models, companies, and inference providers.**

OneAtlas brings model specifications, pricing, provider availability, capabilities, and benchmark results into a single normalized dataset — then exposes it through a fast, filterable web UI and a typed REST API.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

> **Demo data notice:** all seeded models, prices, and benchmark scores are illustrative sample records (`isDemo = true`). They are not verified, live measurements and must not be presented as authoritative figures.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Data model](#data-model)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Web routes](#web-routes)
- [API reference](#api-reference)
- [Admin API](#admin-api)
- [Scripts](#scripts)
- [Data integrity conventions](#data-integrity-conventions)

---

## Features

- **Model catalogue** — browse active models with URL-addressable filters for company, provider, capability, modality, open-source status, pricing, and context window.
- **Rich model profiles** — specifications, context limits, licence and release history, provider listings, current pricing, capabilities, modalities, and benchmark results, plus related models.
- **Side-by-side comparison** — compare 2–4 models, shareable via `/compare?models=slug-a,slug-b`.
- **Benchmark rankings** — leaderboards derived from the latest result per model and benchmark, filterable by category, company, provider, and open-source status.
- **Company and provider directories** — organisation pages linking every model, listing, and price they are associated with.
- **Instant global search** — debounced, grouped search across models, companies, and providers, with a `⌘K` / `Ctrl+K` command palette.
- **Protected admin workspace** — create, edit, and delete models from `/admin` using a shared admin secret.
- **Consistent API envelope** — every endpoint returns the same `success` / `data` / `meta` / `error` shape with Zod-validated inputs.
- **Dark, responsive UI** — Tailwind CSS 4, shadcn/ui primitives, and Recharts visualisations.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16.4 (App Router, Route Handlers, Server Components) |
| UI runtime | React 19, React DOM 19 |
| Language | TypeScript 5.7, `strict` mode, `@/*` path alias |
| Styling | Tailwind CSS 4 (PostCSS), `tw-animate-css` |
| Components | shadcn/ui, Base UI (`@base-ui/react`), Lucide icons, Sonner toasts |
| Client data | TanStack Query 5 |
| Forms & validation | React Hook Form 7, `@hookform/resolvers`, Zod 4 |
| Charts | Recharts 3 |
| Search palette | cmdk |
| Database | PostgreSQL |
| ORM | Prisma 7 with the `@prisma/adapter-pg` driver adapter |
| Theming | next-themes (dark-first) |
| Utilities | clsx, tailwind-merge, class-variance-authority, date-fns |
| Analytics | Vercel Analytics (production only) |
| Tooling | tsx (seed runner), dotenv, PostCSS |

---

## Architecture

```mermaid
flowchart LR
  subgraph Client["Browser"]
    UI["Pages & components<br/>React 19 / TanStack Query"]
    Admin["/admin workspace"]
  end

  subgraph Next["Next.js 16 App Router"]
    Pages["Server & client pages<br/>/models · /compare · /rankings …"]
    API["REST route handlers<br/>/api/*"]
    Guard["Admin guard<br/>x-admin-secret → timingSafeEqual"]
    Http["Response envelope<br/>ok / notFound / fail"]
    Zod["Zod schemas<br/>query & body validation"]
  end

  subgraph Data["Data layer"]
    Prisma["Prisma Client<br/>generated/prisma"]
    Adapter["@prisma/adapter-pg"]
    DB[("PostgreSQL")]
  end

  UI -->|fetch JSON| API
  Admin -->|authorised writes| Guard
  Pages --> API
  API --> Zod
  Zod --> Http
  Guard --> Http
  API --> Prisma
  Prisma --> Adapter --> DB
  Http --> API
```

**Request lifecycle**

1. A page or client component issues a `fetch` to a `/api/*` route (client components use TanStack Query for caching and refetching).
2. The route handler validates input with Zod — invalid input becomes a `400 VALIDATION_ERROR`.
3. Admin routes additionally require a matching `x-admin-secret` header, compared in constant time.
4. Prisma queries PostgreSQL through the `pg` driver adapter and returns typed results.
5. The shared `ok` / `notFound` / `fail` helpers wrap the payload in the standard response envelope.

---

## Data model

The Prisma schema (`prisma/schema.prisma`) normalises the catalogue around joined models and explicit foreign keys with index coverage on common filters.

```mermaid
erDiagram
  Company ||--o{ Model : develops
  Company ||--o{ Provider : operates
  Model ||--o{ ModelProvider : offered_by
  Provider ||--o{ ModelProvider : lists
  Model ||--o{ ModelCapability : has
  Capability ||--o{ ModelCapability : tagged
  Model ||--o{ ModelModality : supports
  Modality ||--o{ ModelModality : tagged
  Model ||--o{ Pricing : priced
  Provider ||--o{ Pricing : applies_to
  Model ||--o{ BenchmarkResult : scored
  Benchmark ||--o{ BenchmarkResult : measures
  Model ||--o{ ModelRelease : released_as

  Company {
    string id PK
    string name UK
    string slug UK
    string website
    string headquarters
    datetime foundedAt
  }
  Provider {
    string id PK
    string name UK
    string slug UK
    string documentationUrl
    string companyId FK
  }
  Model {
    string id PK
    string slug UK
    string modelIdentifier UK
    string companyId FK
    int contextWindow
    int maxOutputTokens
    boolean isOpenSource
    enum status "ACTIVE | DEPRECATED | PREVIEW | RETIRED"
    boolean isDemo
  }
  ModelProvider {
    string modelId PK,FK
    string providerId PK,FK
    string endpoint
    boolean isAvailable
    string[] supportedFeatures
  }
  Pricing {
    decimal inputPricePerMillionTokens
    decimal outputPricePerMillionTokens
    decimal cachedInputPricePerMillionTokens
    string currency
    datetime effectiveFrom
    datetime effectiveTo
  }
  BenchmarkResult {
    decimal score
    string scoreUnit
    datetime evaluationDate
    boolean isDemo
  }
  Benchmark {
    string name UK
    string slug UK
    enum category
  }
  ModelRelease {
    string version
    datetime releaseDate
    string changelog
  }
```

**Key relationships**

- A **Model** belongs to one **Company** and can be offered by many **Providers** through `ModelProvider`.
- **Pricing** is time-versioned: `effectiveFrom` / `effectiveTo`, with `effectiveTo = null` marking the current price. Decimal `(12, 6)` precision is used for per-million-token costs.
- **Benchmark results** are unique per `(model, benchmark, evaluationDate)`, so historical scores are preserved and the latest score can be selected.
- **Capabilities** and **Modalities** are many-to-many join tables; modality rows record whether the model supports the modality as input and/or output.
- Enum types `ModelStatus` and `BenchmarkCategory` keep status and category values constrained at the database level.

---

## Project structure

```text
.
├── app/
│   ├── layout.tsx                  # Root layout, metadata, providers, header
│   ├── page.tsx                    # Discovery overview + hero search
│   ├── models/
│   │   ├── page.tsx                # Filterable model catalogue
│   │   └── [slug]/page.tsx         # Model profile
│   ├── compare/page.tsx            # 2–4 model comparison
│   ├── rankings/page.tsx           # Benchmark leaderboards
│   ├── companies/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── providers/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── admin/page.tsx              # Secret-gated model CRUD workspace
│   ├── api/                        # REST route handlers (see API reference)
│   ├── error.tsx · loading.tsx · not-found.tsx
│   └── globals.css
├── components/
│   ├── atlas/                      # Header, query provider, org detail
│   ├── models/model-card.tsx
│   └── ui/                         # shadcn/ui primitives
├── lib/
│   ├── prisma.ts                   # Singleton Prisma client + pg adapter
│   ├── utils.ts
│   └── server/
│       ├── admin-auth.ts           # Constant-time admin secret check
│       ├── http.ts                  # Response envelope helpers
│       └── validation.ts            # Shared Zod query schema
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                     # Illustrative demo dataset
│   └── migrations/                 # Tracked SQL migrations
├── generated/prisma/               # Generated client (not hand-edited)
├── prisma.config.ts                # Schema, migration, seed configuration
└── next.config.mjs                 # Security headers, image config
```

---

## Getting started

### Prerequisites

- **Node.js 20+**
- **PostgreSQL 14+** (local instance or a hosted database)
- **npm** (a `package-lock.json` is committed)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure the environment
cp .env.example .env
#    then set DATABASE_URL (and optionally ADMIN_SECRET)

# 3. Generate the Prisma client into generated/prisma
npm run db:generate

# 4. Validate the schema
npm run db:validate

# 5. Apply migrations
npm run db:migrate

# 6. Seed illustrative demo records
npm run db:seed

# 7. Start the development server
npm run dev
```

Open <http://localhost:3000>.

> Do **not** use `prisma db push` in place of migrations. The initial migration lives in `prisma/migrations` and is the source of truth for the schema.

### Production build

```bash
npm run build
npm run start
```

---

## Environment variables

| Variable | Required | Used by | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma, seed script | PostgreSQL connection string, e.g. `postgresql://user:password@localhost:5432/oneatlas` |
| `ADMIN_SECRET` | For admin routes | `lib/server/admin-auth.ts` | Shared secret required in the `x-admin-secret` header. Admin endpoints return `401` while this is unset. |

`.env.example` provides the template. Never commit real credentials.

---

## Web routes

| Route | Description |
| --- | --- |
| `/` | Discovery overview: catalogue stats, featured models, popular providers, benchmark highlights, and live search. |
| `/models` | Full model catalogue with URL-synced filters and sorting. |
| `/models/[slug]` | Model specifications, provider listings, pricing history, benchmarks, releases, and related models. |
| `/compare?models=slug-a,slug-b` | Shareable comparison of 2–4 models. |
| `/rankings` | Benchmark leaderboards with category and entity filters. |
| `/companies` | Company directory with model counts and latest release. |
| `/companies/[slug]` | Company profile and its full model portfolio. |
| `/providers` | Inference provider directory with listing counts. |
| `/providers/[slug]` | Provider profile and every model it serves. |
| `/admin` | Client-side model management workspace, unlocked with the admin secret. |

---

## API reference

Base URL: `/api`

### Response envelope

Successful responses:

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 38, "totalPages": 2 }
}
```

The `meta` object is present only on paginated endpoints.

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request parameters are invalid",
    "details": { "search": ["..."] }
  }
}
```

| Status | Code | Meaning |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | Query or body failed Zod validation; `details` lists field errors. |
| `401` | `UNAUTHORIZED` | Admin route called without a valid `x-admin-secret`. |
| `404` | `NOT_FOUND` | Requested slug does not exist. |
| `500` | `INTERNAL_ERROR` | Unexpected server or database failure. |

### Endpoints

| Method | Endpoint | Description | Query parameters |
| --- | --- | --- | --- |
| `GET` | `/api/models` | Paginated **active** models with company, available providers, capabilities, modalities, and current price. | `search`, `company`, `provider`, `capabilities`, `modalities`, `openSource` (`true`/`false`), `minPrice`, `maxPrice`, `minContext`, `maxContext`, `sort`, `page`, `limit` |
| `GET` | `/api/models/[slug]` | Full model profile including all pricing, benchmark results, releases, and up to 3 `relatedModels`. | — |
| `GET` | `/api/compare` | Models in the requested order, with `null` for unknown slugs. Requires 2–4 slugs. | `models` (comma-separated slugs) |
| `GET` | `/api/rankings` | Latest result per model/benchmark, ranked within each benchmark. | `category`, `company`, `provider`, `openSource` |
| `GET` | `/api/search` | Grouped search results: up to 6 models, 4 companies, 4 providers. | `q` (required, 1–100 chars) |
| `GET` | `/api/stats` | Counts of active models, companies, providers, and benchmarks. | — |
| `GET` | `/api/benchmarks` | All benchmarks with result counts. | — |
| `GET` | `/api/benchmarks/[slug]` | Benchmark detail with its 100 most recent results. | — |
| `GET` | `/api/companies` | Companies with model counts and latest model. | `q` (name search) |
| `GET` | `/api/companies/[slug]` | Company with all models, current pricing, providers, capabilities, and modalities. | — |
| `GET` | `/api/providers` | Providers with listing counts. | `q` (name search) |
| `GET` | `/api/providers/[slug]` | Provider with every model listing. | — |
| `GET` | `/api/admin/models` | List up to 100 models plus company options. **Admin.** | — |
| `POST` | `/api/admin/models` | Create a model. **Admin.** | — |
| `PATCH` | `/api/admin/models/[id]` | Partially update a model. **Admin.** | — |
| `DELETE` | `/api/admin/models/[id]` | Delete a model. **Admin.** | `confirm=true` (required) |

#### `GET /api/models` options

| Parameter | Values | Default |
| --- | --- | --- |
| `sort` | `newest`, `oldest`, `inputPrice`, `outputPrice`, `context`, `name`, `popular` | `newest` |
| `page` | Integer ≥ 1 | `1` |
| `limit` | Integer 1–100 | `20` |
| `openSource` | `true`, `false` | — |
| `minPrice` / `maxPrice` | Non-negative number (USD per million input tokens) | — |
| `minContext` / `maxContext` | Non-negative integer (tokens) | — |

Multiple `search` terms are split on whitespace and combined with **AND**; each term matches model name, identifier, company name, family, description, capability, or modality. Unknown company/provider/capability/modality slugs simply yield no matches rather than an error.

#### `GET /api/rankings` categories

`GENERAL`, `REASONING`, `CODING`, `MATHEMATICS`, `VISION`, `OTHER`

Results are ordered by benchmark name, then descending score, capped at the 200 most recent rows before de-duplication.

### Examples

```bash
# Active open-source coding models under $2 / 1M input tokens, newest first
curl "http://localhost:3000/api/models?openSource=true&maxPrice=2&sort=newest&limit=10"

# Models available through a specific provider
curl "http://localhost:3000/api/models?provider=openrouter"

# Compare two models
curl "http://localhost:3000/api/compare?models=gpt-4.1,claude-opus-4"

# Reasoning leaderboard for one company
curl "http://localhost:3000/api/rankings?category=REASONING&company=openai"

# Global search
curl "http://localhost:3000/api/search?q=claude"
```

---

## Admin API

Write endpoints require the `x-admin-secret` header to equal `ADMIN_SECRET`. The comparison uses `crypto.timingSafeEqual`, and requests are rejected with `401` when the variable is unset.

```bash
# List models and company options
curl -H "x-admin-secret: $ADMIN_SECRET" \
  http://localhost:3000/api/admin/models

# Create a model
curl -X POST http://localhost:3000/api/admin/models \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Example Model",
    "slug": "example-model",
    "modelIdentifier": "vendor/example-model",
    "companyId": "<company-id>",
    "contextWindow": 128000,
    "isOpenSource": false
  }'

# Update a model
curl -X PATCH http://localhost:3000/api/admin/models/<model-id> \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"status":"DEPRECATED"}'

# Delete a model (confirmation is mandatory)
curl -X DELETE "http://localhost:3000/api/admin/models/<model-id>?confirm=true" \
  -H "x-admin-secret: $ADMIN_SECRET"
```

**Create payload:** `name`, `slug` (lowercase kebab-case), `modelIdentifier`, and `companyId` are required; `description`, `modelFamily`, `contextWindow`, `maxOutputTokens`, `isOpenSource`, and `license` are optional. Admin-created models are stored with `isDemo = false`.

The `/admin` page stores the secret in component state only — it is not persisted to storage.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve the production build. |
| `npm run typecheck` | Run `tsc --noEmit` across the project. |
| `npm run db:generate` | Generate the Prisma client into `generated/prisma`. |
| `npm run db:validate` | Validate `prisma/schema.prisma`. |
| `npm run db:migrate` | Create and apply a development migration. |
| `npm run db:seed` | Seed the illustrative demo dataset via `tsx prisma/seed.ts`. |

Regenerate the Prisma client after any schema change.

---

## Data integrity conventions

- **Migrations only.** Schema changes ship as tracked SQL migrations under `prisma/migrations`.
- **Demo data is labelled.** Seeded models, prices, and scores carry `isDemo = true` and are not verified facts. Admin-created records default to `isDemo = false`.
- **Prices are time-versioned decimals.** Current pricing is the row with `effectiveTo = null`; historical rows are retained.
- **Benchmarks are append-only.** Uniqueness on `(modelId, benchmarkId, evaluationDate)` preserves evaluation history.
- **Status filtering.** Public catalogue queries return `ACTIVE` models only; `PREVIEW`, `DEPRECATED`, and `RETIRED` remain queryable by slug.
- **Secrets stay server-side.** `ADMIN_SECRET` and `DATABASE_URL` are read only in server modules.
- **Strict types.** TypeScript `strict` mode is enabled; API inputs are validated at runtime with Zod.
- **Security headers.** `next.config.mjs` sets HSTS, `nosniff`, referrer policy, and a restrictive permissions policy on all responses.
