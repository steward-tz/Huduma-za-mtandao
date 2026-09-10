# HUDUMA ZA MTANDAONI

HUDUMA ZA MTANDAONI ni full-stack web application ya Kiswahili inayokusanya huduma za kidigitali, mfumo wa tokeni, mafunzo, historia ya matumizi na paneli ya admin katika portal moja ya mobile-first.

## Kilichojengwa

- Muonekano wa mobile-first unaofanya kazi kwenye Android, iPhone, tablet na desktop.
- Banner nyekundu ya tangazo, search ya huduma, white cards, vitufe vya kijani, VIP cards za njano na matangazo mekundu.
- Huduma kuu: TIN, NIDA, LIPA, mpiga kura, leseni, BRELA na nyingine.
- Huduma za bure ambazo hazikati tokeni.
- Huduma zilizofungwa zenye ujumbe wa wazi bila kukata tokeni.
- Huduma maalum za WhatsApp, VIP na matangazo ya biashara.
- Video za mafunzo zilizoandaliwa kwa URL halisi inayoweza kuongezwa na admin; hakuna video URL bandia.
- Mfumo wa tokeni wa backend: akaunti mpya huanza na tokeni 0, huduma zinazolipiwa hukata tokeni 2, na huduma za bure hukata 0.
- Ulinzi wa verification status, token balance, transaction history, service usage, notifications na audit actions.
- Admin dashboard yenye route za `/admin`, `/admin/users`, `/admin/tokens`, `/admin/services`, `/admin/videos`, `/admin/transactions`, `/admin/announcements` na `/admin/settings`.
- OAuth ya Manus ndiyo authentication provider ya msingi; kuingia mara ya kwanza hufanya kazi kama usajili wa akaunti. Admin ndiye huidhinisha akaunti kabla ya huduma za kulipia kutumika.

## Stack

- React 19 + Vite + Tailwind 4
- Express + tRPC 11
- Drizzle ORM + MySQL/TiDB
- Manus OAuth na protected/admin procedures
- Vitest kwa backend contract tests

## Kuendesha locally

```bash
pnpm install
pnpm dev
pnpm check
pnpm test
pnpm build
```

Usiweke `.env` au API keys kwenye GitHub. Environment variables hutolewa na runtime ya Manus/WebDev au setup yako binafsi ya deployment.

## Backend flow

`drizzle/schema.ts` ina tables za users, services, service runs, token transactions, service usage, tutorial videos, notifications, announcements na admin actions. `server/db.ts` ndiyo layer ya database. `server/routers.ts` ndiyo contract ya tRPC. Deduction ya tokeni hufanyika server-side ndani ya transaction na ina audit reference.

## Kupanua mfumo

Ongeza huduma mpya kwenye `shared/catalog.ts`, kisha ongeza action URL halisi au procedure inayohitajika kwenye backend. Kwa video, tumia URL halisi inayodhibitiwa na admin. Kwa malipo, tumia provider halisi na usionyeshe mafanikio ya malipo kabla provider hajathibitisha transaction.

## Footer

Programu hii ilitengenezwa na Bw. Zoom Cotex Limited.
