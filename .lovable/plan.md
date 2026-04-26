# B2C: Verification Tools + Financial Calculators

Add two new investor-portal areas that the backend supports but the frontend doesn't yet expose:

1. **Verification Tools** — user-facing forms for BSE PAN check and NDML KYC status lookup (today KYC is only a read-only timeline).
2. **Calculators** — a dedicated hub of financial calculators (SIP projection, lumpsum projection, goal/target SIP, retirement planner) separate from the existing Goals flow.

Both follow the existing patterns: feature-sliced folders, custom React Query hooks, RHF + Zod, Recharts for charts, fixtures for now (real Django endpoints can be wired later by swapping the api files).

---

## 1. Verification Tools (`/app/investor/verify`)

A single route with two cards in tabs:

- **PAN Verification** (BSE PAN check)
  - Form: PAN (regex `^[A-Z]{5}[0-9]{4}[A-Z]$`), Full name, DOB.
  - On submit, calls `useVerifyPanMutation` (mock: returns `{ status: "valid"|"invalid", nameMatch, panHolderName, category, lastChecked }`).
  - Result card shows status badge, name-match indicator, raw response, "Re-check" button.
- **NDML KYC Status**
  - Form: PAN only.
  - Calls `useNdmlKycStatusMutation` (mock: returns `{ kycStatus: "verified"|"in_review"|"rejected"|"not_found", provider, lastUpdated, holderName, kraSource }`).
  - Result card shows status badge with provider, last-updated, and a "Start KYC" CTA when `not_found` or `rejected` (links to `/app/investor/profile`).

Both cards use the existing `StatusBadge`, `Card`, `Form`, `Input`, `Button`, and `Loader2` patterns. Recent checks are kept in an in-memory store and shown as a small "Recent verifications" list under each tab.

Sidebar entry added to **Account** section: `Verification Tools` (icon: `BadgeCheck`).

## 2. Financial Calculators (`/app/investor/calculators`)

Single route with a tabbed layout containing four calculators. Each renders an RHF form on the left and a live result panel + Recharts area chart on the right.

- **SIP Calculator** — inputs: monthly amount, expected annual return %, tenure (years), step-up % (optional). Outputs: invested, future value, wealth gained; year-wise growth chart.
- **Lumpsum Calculator** — inputs: amount, return %, tenure. Outputs: invested, FV, gain; growth chart.
- **Goal SIP Calculator** — inputs: target corpus, tenure, expected return, current savings (optional). Outputs: required monthly SIP; growth chart toward target.
- **Retirement Planner** — inputs: current age, retirement age, life expectancy, current monthly expense, inflation %, pre-retirement return %, post-retirement return %. Outputs: corpus needed at retirement, required monthly SIP today, expense projection chart.

All math runs client-side in pure helpers under `src/features/calculators/math.ts`. Schemas in `src/features/calculators/schemas.ts`. Each calculator uses `<Form>` from `@/components/ui/form` with Zod `superRefine` for cross-field rules (e.g. retirement age > current age).

Sidebar entry added to **Plan** section: `Calculators` (icon: `Calculator` reused; rename current Tax Harvesting nav icon to `Receipt` to avoid collision, OR use `LineChart` for Calculators — final choice: `LineChart`).

---

## Files

**New**
- `src/types/verification.ts` — `PanVerificationResult`, `NdmlKycStatusResult`.
- `src/features/verification/api.ts` — `useVerifyPanMutation`, `useNdmlKycStatusMutation`, `useRecentVerificationsQuery` (in-memory store).
- `src/features/verification/schemas.ts` — Zod schemas for both forms.
- `src/features/verification/fixtures.ts` — sample responses for valid/invalid PANs and KYC statuses.
- `src/routes/app.investor.verify.tsx`
- `src/features/calculators/math.ts` — pure functions: `sipFutureValue`, `stepUpSipFutureValue`, `lumpsumFutureValue`, `requiredSipForGoal`, `retirementCorpus`, plus `*Series` helpers returning year-wise arrays for charts.
- `src/features/calculators/schemas.ts`
- `src/features/calculators/components/result-chart.tsx` — shared Recharts area chart wrapper.
- `src/routes/app.investor.calculators.tsx`

**Edited**
- `src/config/navigation.ts` — add the two nav entries.

After approval and implementation we'll run `bun run build:dev` to confirm a clean build.
