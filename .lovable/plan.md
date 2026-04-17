
User chose "Investor only — deep" + "Lumpsum only, fully working". So skip admin entirely, build lumpsum end-to-end, stub the other 3 wizards.

## Phase 3 — Investor depth

### Shared primitives
1. **`src/components/data/data-table.tsx`** — generic sortable + paginated table with mobile card fallback. Props: `columns`, `data`, `getRowId`, optional `mobileCard` render prop, `pageSize`, empty state.
2. **`src/components/feedback/status-badge.tsx`** — semantic badge (`success` / `warning` / `destructive` / `info` / `muted`) with dot indicator.

### Investor pages

3. **Transactions** — `src/routes/app.investor.transactions.tsx`
   - New slice: `features/transactions/{api.ts, fixtures.ts}` + `src/types/transaction.ts`
   - 60+ mock transactions (purchase / SIP / redeem / switch / dividend), various statuses
   - Filters: date range, type, status, free-text search by scheme
   - Uses `DataTable` with `StatusBadge` for status column; mobile cards
   - Stub "Export CSV" button (toast)

4. **KYC & Profile** — `src/routes/app.investor.profile.tsx`
   - New slice: `features/kyc/{api.ts, fixtures.ts}` + `src/types/kyc.ts`
   - Tabs: **Profile** (PAN/Aadhaar masked, DOB, address), **KYC Status** (NDML timeline w/ steps + status badges), **Bank Accounts** (list + "Add" stub), **Nominees** (list + "Add" stub)
   - All edit actions mocked

5. **Scheme Explorer** — `src/routes/app.investor.explore.tsx`
   - New slice: `features/schemes/{api.ts, fixtures.ts}` + `src/types/scheme.ts`
   - 30+ mock schemes across Equity / Debt / Hybrid / Gold with category, NAV, 1Y/3Y/5Y returns, expense ratio, AUM, risk
   - Filters: asset class, category, risk; sort by 1Y/3Y/AUM; search
   - Card grid w/ "Invest" CTA → `/app/investor/orders/lumpsum?schemeId=…`

6. **Order wizards** — 4 routes
   - `app.investor.orders.lumpsum.tsx` — **fully working** 3-step RHF+Zod wizard:
     - Step 1: Scheme selection (search + recent + pre-fill from `?schemeId`)
     - Step 2: Amount + bank account + folio (new/existing) with Zod min/max validation
     - Step 3: Review + confirm → mock `useExecuteLumpsumMutation` returns order ID + success screen
     - Stepper UI, back/next buttons, persistent state via `useState`
     - New slice: `features/orders/{api.ts, schemas.ts, components/}` (stepper, scheme-picker, success-card)
   - `app.investor.orders.sip.tsx`, `app.investor.orders.redeem.tsx`, `app.investor.orders.switch.tsx` — stub shells with sketched 3-step layout + `ComingSoonCard`

### Wiring
7. **`src/config/navigation.ts`** — replace stale links:
   - Investor "Invest" section: Explore Schemes, Lumpsum, SIP (Soon), Redeem (Soon), Switch (Soon)
   - Add Transactions (already exists), KYC & Profile (replace `kyc` link)
8. **`src/routes/app.investor.index.tsx`** — wire dashboard CTAs to lumpsum + explore

### Architecture notes
- All data via TanStack Query hooks reading `fixtures.ts` with `setTimeout` latency (matches Phase 2 pattern).
- Wizard mutation uses `useMutation` with mock `Promise.resolve({ orderId })`.
- All new routes use the existing `beforeLoad` investor role check from `app.investor.index.tsx`.
- `DataTable` is generic `<T extends { id: string }>` — no `any`.
- Lumpsum uses `validateSearch` for `?schemeId` query param.

### File map (new)
- `src/components/data/data-table.tsx`
- `src/components/feedback/status-badge.tsx`
- `src/types/transaction.ts`, `src/types/kyc.ts`, `src/types/scheme.ts`, `src/types/orders.ts`
- `src/features/transactions/{api.ts, fixtures.ts}`
- `src/features/kyc/{api.ts, fixtures.ts, components/kyc-timeline.tsx}`
- `src/features/schemes/{api.ts, fixtures.ts, components/scheme-card.tsx}`
- `src/features/orders/{api.ts, schemas.ts, components/wizard-stepper.tsx, components/scheme-picker.tsx, components/order-success.tsx}`
- `src/routes/app.investor.transactions.tsx`
- `src/routes/app.investor.profile.tsx`
- `src/routes/app.investor.explore.tsx`
- `src/routes/app.investor.orders.lumpsum.tsx`
- `src/routes/app.investor.orders.sip.tsx`
- `src/routes/app.investor.orders.redeem.tsx`
- `src/routes/app.investor.orders.switch.tsx`

### File map (edits)
- `src/config/navigation.ts` — refresh investor nav
- `src/routes/app.investor.index.tsx` — wire CTAs
