# OneAtlas.dev

OneAtlas.dev is a developer-focused catalog for discovering, comparing, and evaluating AI models, companies, providers, and benchmark records.

## Stack

Next.js 16 App Router, TypeScript strict mode, Tailwind CSS 4, PostgreSQL, Prisma ORM 7 with `@prisma/adapter-pg`, and a server-side REST API. The Prisma schema uses decimal pricing, normalized joins, foreign keys, indexes, and a generated client at `generated/prisma`.

## Setup

1. Set `DATABASE_URL` in the local environment to a PostgreSQL connection string.
2. Install dependencies with the repository package manager (`npm`, as configured by the provided Next.js scaffold).
3. Generate the client: `npm db:generate`.
4. Validate the schema: `npm db:validate`.
5. Apply migrations: `npm db:migrate`.
6. Seed clearly marked illustrative demo records: `npm db:seed`.
7. Start the development app: `npm dev`.

The initial migration is tracked under `prisma/migrations`. Do not use `db push` as a substitute for migrations. Seed pricing and benchmark scores are explicitly flagged as demo data and should not be represented as verified facts.

## Routes

- `/` discovery overview
- `/models` model catalog and URL-based filters
- `/models/[slug]` model specifications, provider listings, pricing, benchmarks, and releases
- `/compare?models=slug1,slug2` shareable model comparisons
- `/rankings` benchmark leaderboards
- `/companies` and `/companies/[slug]`
- `/providers` and `/providers/[slug]`

REST endpoints are available under `/api/models`, `/api/search`, `/api/stats`, `/api/compare`, `/api/rankings`, `/api/companies`, and `/api/providers`. Admin writes should be protected with the `ADMIN_SECRET` server environment variable and the `x-admin-secret` header.
