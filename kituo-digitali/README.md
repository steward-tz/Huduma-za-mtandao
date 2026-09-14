# HUDUMA ZA MTANDAONI

HUDUMA ZA MTANDAONI ni full-stack application ya Kiswahili ya kusimamia huduma za kidijitali, tokeni, watumiaji, miamala, ujumbe, matangazo na usimamizi wa mfumo. Project imejengwa kwa React + Vite + Tailwind, Express + tRPC, Drizzle ORM na MySQL/TiDB.

## Vipengele vya production

- Usajili wa mtumiaji kwa jina, simu na PIN ya tarakimu sita.
- PIN haihifadhiwi plain text; inatumia salted `scrypt` hash na secure comparison.
- Login ya simu/PIN, session cookie ya HTTP-only, lockout baada ya majaribio matano na logout ya sessions zote.
- Manus OAuth bado ipo kama njia mbadala ya authentication.
- User isolation kupitia `protectedProcedure`: profile, tokeni, history, notifications na ujumbe huonekana kwa mmiliki pekee.
- Roles tano: `super_admin`, `admin`, `moderator`, `support`, `user`.
- Tables za roles, permissions, role permissions na user permissions kwa granular access control.
- Admin user management: approval, block/unblock, delete status, token adjustments, role changes na audited PIN reset.
- Service management: kuongeza na kusimamia huduma, gharama ya tokeni, icon, category, order na lock status.
- Token ledger yenye balance-after, references, operator, status na usage history.
- Transaction management, service analytics, popular-services reporting na audit logs.
- Messaging ya user mmoja au broadcast kwa users wote pamoja na notifications.
- Advertisement management yenye title, description, image/link URL, status na audit trail.
- Language catalog iliyoanza na Kiswahili na English; user language preference imehifadhiwa.
- Appearance settings: website name, colors, border radius na dark mode, zinazoweza kusomwa na public shell.
- Responsive user na admin dashboards kwa simu, tablet na desktop.
- Netlify SPA routing kupitia `netlify.toml` na `client/public/_redirects`.

## Kuendesha local

```bash
cd kituo-digitali
pnpm install
pnpm dev
```

Production validation:

```bash
pnpm check
pnpm test
pnpm build
```

## API na GitHub Pages

Frontend hutumia tRPC endpoint `POST /api/trpc/auth.login` kwa login na `POST /api/trpc/auth.register` kwa registration. Hizi si routes za HTML `/login` au `/register`. GitHub Pages ni static hosting na haiwezi kuendesha Express/tRPC; bila backend URL, request ya `/api/trpc` hurudisha HTML/405 badala ya JSON.

Weka URL ya server inayotumia `server/_core/index.ts` kwenye GitHub repository variable `VITE_API_BASE_URL`, kwa mfano `https://api.example.com` bila slash ya mwisho. Workflow ya Pages huiingiza wakati wa build. Usiiweke URL ya `steward-tz.github.io` kama API URL. Kwa local development, acha variable tupu ili kutumia `/api/trpc` kwenye server ya local.

Tazama `.env.example` kwa variables zinazohitajika. `DATABASE_URL`, `JWT_SECRET`, `SUPER_ADMIN_PHONE`, Forge URL na Forge key ni server-only secrets; usiziweke kwenye `VITE_*` variables wala frontend.

API client hukagua `Content-Type` kabla ya kutegemea JSON. Ikiwa hosting inarudisha HTML, console huhifadhi URL/status/body preview kwa debugging na mtumiaji huona ujumbe unaodhibitiwa badala ya `Unexpected token '<'`.

## Database

Schema iko `drizzle/schema.ts`. Migrations ziko `drizzle/` na migration ya production feature set ni `0005_production_requirements.sql`. Usibadilishe database moja kwa moja bila kuongeza schema na migration inayoweza kufuatiliwa.

Tables kuu ni `users`, `roles`, `permissions`, `rolePermissions`, `userPermissions`, `services`, `serviceRuns`, `serviceUsage`, `tokenTransactions`, `messages`, `notifications`, `advertisements`, `languages`, `appearanceSettings`, `systemSettings` na `adminActions`.

## Security

Usiweke admin PIN au credentials ndani ya React, HTML, GitHub au source code. Owner wa Manus OAuth anapewa `super_admin` wakati wa upsert ya backend kupitia server configuration. Kwa local phone/PIN auth, tumia environment secret `JWT_SECRET` yenye thamani ya production na badilisha PIN baada ya account ya kwanza kutengenezwa.

Admin actions zinahifadhi admin, target, action, reason, legacy details, timestamp na sehemu za IP/user agent pale zinapopatikana. Financial records hazipaswi kuhaririwa bila operation mpya yenye authorization na audit trail.

## Netlify

Kwa repository layout hii, Netlify settings zinapaswa kuwa:

- Base directory: `kituo-digitali`
- Build command: `pnpm build`
- Publish directory: `dist/public`
- Node version: `22`

`netlify.toml` ya root na `kituo-digitali/client/public/_redirects` zimesanidiwa kwa client-side routes. Frontend inaweza kuhudumiwa na Netlify; backend ya Express/tRPC na database vinahitaji runtime yenye server support au functions zenye API integration.

## GitHub workflow

GitHub ndiyo source of truth. Fanya mabadiliko kwa commits zenye maana, hakikisha `pnpm check`, `pnpm test` na `pnpm build` zinapita, kisha push branch ya `main` au pull request. Usicommit `.env`, secrets, `node_modules` au `dist`.
