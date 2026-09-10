# Kituo Digitali

Kituo Digitali is an original full-stack digital workbench inspired by the information architecture of a service hub. It is intentionally not a copy of the supplied reference: it uses its own name, visual language, copy, iconography, and sample data.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4 with an authored CSS design system
- Express + tRPC 11 for typed server procedures
- Drizzle ORM + MySQL/TiDB for persisted service runs
- Built-in Manus OAuth for authentication
- Vitest for backend contract tests

## Product structure

- `/` — overview dashboard with hero, balance, service cards, search, and next-step prompt
- `/services` — filterable service library with detail modal
- `/workbench` — structured service brief form backed by `workItems.create`
- `/history` — persisted or seeded activity history
- `/account` — account, privacy, and credit usage settings

## Local development

```bash
pnpm install
pnpm dev
```

Useful checks:

```bash
pnpm check
pnpm test
pnpm build
```

The application uses the environment variables supplied by the full-stack template. Do not commit `.env` files or secrets.

## Where to edit

- `client/src/pages/Home.tsx` — page composition, navigation, forms, and interaction states
- `client/src/index.css` — global tokens, responsive layout, and component styling
- `shared/catalog.ts` — original service catalog and seeded activity
- `server/routers.ts` — typed tRPC API contracts
- `server/db.ts` — Drizzle query helpers
- `drizzle/schema.ts` — database schema
- `docs/reference-analysis.md` — reference analysis and deliberate divergence notes

## GitHub source of truth

The repository is intended to be the canonical editable source. Keep feature work in GitHub branches and use pull requests for review. The Manus preview is a development and verification environment, not the only place the source lives.

## Notes

The starter service runs are intentionally safe demo records. Connect a real service implementation behind the existing `workItems.create` procedure when product behavior is ready to move beyond the prototype.
