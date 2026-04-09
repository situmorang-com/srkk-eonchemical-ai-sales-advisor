# AI Sales Advisor — Setup Guide

## Requirements
- Node.js 18+ (project tested with Node 25)
- npm 10+

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Generate database schema migrations
npm run db:generate

# 3. Run migrations (creates ./data/sales_advisor.db)
npm run db:migrate

# 4. Seed with realistic dummy data
npm run db:seed

# 5. Start dev server
npm run dev
```

Visit: http://localhost:5173

## Or use the one-command setup

```bash
npm run setup && npm run dev
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run check` | TypeScript + Svelte type check |
| `npm run db:generate` | Generate Drizzle SQL migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed database with dummy data |
| `npm run db:studio` | Open Drizzle Studio (DB browser) |

## Project Structure

```
src/
├── lib/
│   ├── server/
│   │   ├── db/
│   │   │   ├── schema.ts           # Drizzle schema (12 tables)
│   │   │   └── index.ts            # SQLite connection
│   │   ├── repositories/           # Data access layer
│   │   │   ├── account.repository.ts
│   │   │   ├── opportunity.repository.ts
│   │   │   ├── product.repository.ts
│   │   │   ├── activity.repository.ts
│   │   │   └── recommendation.repository.ts
│   │   └── services/               # Business logic
│   │       ├── recommendation.engine.ts  # Core scoring engine
│   │       ├── dashboard.service.ts
│   │       └── copilot.service.ts
│   ├── types/index.ts              # Shared TypeScript types
│   └── components/ui/              # Reusable UI components
└── routes/
    ├── +page.svelte                # Dashboard
    ├── accounts/                   # Account list + detail
    ├── opportunities/              # Opportunity list + detail
    ├── manager/                    # Manager dashboard
    ├── copilot/                    # AI Copilot chat
    └── api/
        ├── copilot/+server.ts      # Copilot API
        └── recommendations/+server.ts  # Recs API

scripts/
├── migrate.ts                      # Database migration runner
└── seed.ts                         # Seed script (60 opps, 25 accounts, 50 products)

data/
└── sales_advisor.db                # SQLite database (auto-created)
```

## Seeded Data Summary

| Entity | Count |
|---|---|
| Industries | 3 (Marine/Ports, Mining, General Industrial) |
| Product Families | 5 |
| Products | 50 (realistic chemical products) |
| Accounts | 25 (Australian companies) |
| Opportunities | 60 (mixture of healthy + stalled) |
| Activities | 12 |
| Notes | 12 |
| Users / Reps | 5 |

## Recommendation Engine

The engine uses 4 signals, each weighted:

| Signal | Weight | Source |
|---|---|---|
| Industry Fit | 35% | `product_industry_fit` table |
| Similar Accounts | 25% | Collaborative filtering |
| Account Affinity | 20% | Historical purchases |
| Use-Case Fit | 20% | Keyword matching |

Returns: primary product, upsell, cross-sell, confidence score, and explanation text.

## Next Steps (Post-MVP)

- Replace copilot mock responses with real Claude API calls
- Add authentication (lucia-auth or better-auth)
- Add opportunity create/edit forms
- Add activity logging from within the app
- Export to PDF / CRM sync
