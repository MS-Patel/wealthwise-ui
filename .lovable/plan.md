
# Phase 4 — Admin deep + RM/Distributor baseline + Impersonation

User chose: Admin deep + RM/Distributor baseline; defer order wizard stubs; skip Reconciliation; full impersonation banner.

## Admin (deep)
1. **Users & Roles** — `/app/admin/users` — DataTable of all platform users (60+ mock), filter by role + KYC status + search; row actions (View, Suspend) → toasts.
2. **Commissions** — `/app/admin/commissions` — KPI cards + monthly area chart + commission ledger table by RM/Distributor.
3. **Payouts** — `/app/admin/payouts` — Table of payout runs with status (pending/processed/failed), CSV download stub.
4. **Integrations & Logs** — `/app/admin/system` — BSE / NDML / RTA health strip + recent integration log table.
5. Enrich Admin **Overview** — keep KPIs, add 30-day orders chart + integration health strip + asset class AUM split.

## RM (baseline)
6. **Client Roster** — `/app/rm/clients` — DataTable of assigned clients; click → impersonate.
7. **Onboarding** — `/app/rm/onboarding` — Pipeline of leads with KYC stage progress.
8. **Earnings** — `/app/rm/earnings` — KPIs + monthly commission chart + recent payouts.

## Distributor (baseline)
9. **AUM** — `/app/distributor/aum` — Sub-broker hierarchy table + AUM growth chart.
10. **Commissions** — `/app/distributor/commissions` — KPIs + payout history.

## Impersonation
11. **`features/impersonation/store.ts`** — Zustand store: `{ impersonating: ClientLite | null, start(client), stop() }`.
12. **`components/layout/impersonation-banner.tsx`** — Sticky top banner above topbar when active. "Viewing as X — Exit".
13. RM/Distributor "View as" → starts impersonation, navigates to `/app/investor` (which becomes read-only). All write actions (Invest CTAs, edit buttons) hidden when `impersonating` set.

## New shared
14. **`features/admin/{api.ts,fixtures.ts}`** + types — users, commissions, payouts, integration logs.
15. **`features/rm/{api.ts,fixtures.ts}`** — clients, onboarding leads, earnings.
16. **`features/distributor/{api.ts,fixtures.ts}`** — sub-brokers, AUM, payouts.

## Wiring
- Update `app.tsx` to render `ImpersonationBanner` above shell content.
- Update `app.investor.index.tsx` & related to hide write CTAs when impersonating.
- All new routes use `beforeLoad` role checks.
