# B2C Backend-Gap Fill — SIPs, Mandates, Folios, Password

The investor portal currently has wizards to **create** SIPs/lumpsum/redeem/switch orders, but no management surface for active SIPs, NACH mandates, folio drill-downs, or password changes. This plan closes those gaps using the same architectural patterns already in place (feature-sliced, Axios + custom React Query hooks, RHF + Zod, fixtures gated by `env.USE_MOCK_API`).

---

## 1. SIP Management

### 1a. Types — `src/types/sip.ts` (new)
```ts
export type SipStatus = "active" | "paused" | "cancelled" | "completed";
export interface ActiveSip {
  id: string;
  schemeCode: string;
  schemeName: string;
  amc: string;
  monthlyAmount: number;
  frequency: "monthly" | "quarterly";
  nextInstallmentDate: string;
  startDate: string;
  endDate?: string;
  installmentsDone: number;
  totalInstallments: number | null; // null = perpetual
  status: SipStatus;
  mandateRef: string;
  folioNumber: string;
  bankAccountId: string;
}
export interface UpcomingInstallment {
  sipId: string;
  schemeName: string;
  amount: number;
  dueDate: string;
  status: "scheduled" | "processing" | "failed";
}
```

### 1b. API + fixtures — `src/features/sips/{api.ts,fixtures.ts}` (new)
- `useActiveSipsQuery()`, `useUpcomingInstallmentsQuery()`, `usePauseSipMutation()`, `useResumeSipMutation()`, `useCancelSipMutation()`.
- Mock list of ~6 SIPs across statuses; mutations update an in-memory queryClient cache so UI feels real.

### 1c. Route — `src/routes/app.investor.sips.tsx` (new, "SIP Dashboard")
- `PageHeader` with "Start new SIP" CTA → `/app/investor/orders/sip`.
- **Summary strip**: Active SIPs count · Total monthly outflow · Next debit date · Failed in last 30d.
- **Tabs**: Active / Paused / Cancelled / Upcoming installments.
  - Active/Paused/Cancelled tabs render a `DataTable` (scheme, monthly amount, next date, installments x/y, status `StatusBadge`, actions).
  - Per-row actions: **Pause / Resume / Cancel** (`AlertDialog` confirm), **View folio** → `/app/investor/folios/$folioNumber`.
  - Upcoming tab: timeline-style list grouped by month with amount + status badge.

### 1d. Navigation
- Add `{ label: "SIPs", to: "/app/investor/sips", icon: Repeat }` to the **Invest** section in `src/config/navigation.ts` (between SIP wizard and Redeem) — the wizard route stays for *creating* SIPs.

---

## 2. Mandates

### 2a. Types — `src/types/mandate.ts` (new)
```ts
export type MandateStatus = "pending" | "active" | "rejected" | "expired";
export interface Mandate {
  id: string;
  bankAccountId: string;
  bankName: string;
  accountMasked: string;
  amountLimit: number;
  status: MandateStatus;
  createdAt: string;
  approvedAt?: string;
  failureReason?: string;
  umrn?: string;
}
```

### 2b. API — `src/features/mandates/{api.ts,fixtures.ts,schemas.ts}` (new)
- `useMandatesQuery()`, `useCreateMandateMutation()`, `useRetryMandateMutation()`.
- Zod `createMandateSchema`: `bankAccountId`, `amountLimit` (₹500–₹10L).

### 2c. Mandates panel inside SIP Dashboard
- Add a **"Bank mandates"** section/tab on `/app/investor/sips` (no separate route — keeps nav clean).
- Card list of mandates with status badges; "Add mandate" opens `CreateMandateDialog` (RHF + Zod, picks from KYC bank list); "Retry" button on `rejected`/`expired` rows fires `useRetryMandateMutation`.
- New components: `src/features/mandates/components/{create-mandate-dialog.tsx,mandate-card.tsx}`.

---

## 3. Folio Detail

### 3a. Types — extend `src/types/portfolio.ts`
```ts
export interface FolioDetail {
  folioNumber: string;
  amc: string;
  amcLogoSeed: string;
  registrar: "CAMS" | "KFintech";
  holdings: Holding[];           // schemes under this folio
  totalInvested: number;
  totalCurrentValue: number;
  totalUnrealizedGain: number;
  recentTransactions: Array<{ id: string; date: string; type: string; amount: number; units: number; nav: number; }>;
  linkedSips: ActiveSip[];
  linkedBankAccountId: string;
  nominees: string[];
}
```

### 3b. API — extend `src/features/portfolio/api.ts`
- Add `useFolioDetailQuery(folioNumber)` resolving from a new `FOLIOS_FIXTURE` (group existing holdings by synthetic folio number, e.g., `"123456789"`, `"987654321"`).

### 3c. Route — `src/routes/app.investor.folios.$folioNumber.tsx` (new)
- Hero: AMC name + folio number + registrar pill + total invested/current/gain stats.
- Sections: **Schemes in this folio** (table → links to existing holding detail), **Recent transactions** (last 10), **Linked SIPs** (cards), **Bank & nominee** info.
- Actions: "Invest more" (lumpsum wizard with prefilled scheme), "Start SIP" (sip wizard), "Switch", "Redeem".

### 3d. Wire-up
- On `app.investor.portfolio.$holdingId.tsx`, add a "View folio" button next to existing actions linking to `/app/investor/folios/$folioNumber`.
- On the SIP Dashboard, the "View folio" row action also targets this route.

---

## 4. Password Management

### 4a. Types & schemas
- Extend `src/features/auth/schemas.ts`:
  - `passwordChangeSchema` (currentPassword, newPassword min 8, confirmPassword match).
  - `passwordResetSchema` (token from URL search, newPassword, confirmPassword).
- Extend `src/types/auth.ts` with `PasswordChangePayload`, `PasswordResetPayload`.

### 4b. API — extend `src/features/auth/api.ts`
- Add to `authApi`: `changePassword(payload)`, `resetPassword(payload)` — both mock-aware (mock rejects if `currentPassword !== "password123"`).
- Hooks: `useChangePasswordMutation()`, `useResetPasswordMutation()`.

### 4c. Routes
- **Change password** — add as a new tab/section inside existing `src/routes/app.settings.tsx` ("Security" tab with form). Avoids new sidebar entry.
- **Reset password** — new route `src/routes/reset-password.tsx` (public). Reads token via `validateSearch` (`z.object({ token: z.string() })`), shows new-password form, calls `useResetPasswordMutation`, redirects to `/login` with toast.
- **Forgot password** — already exists at `src/routes/forgot-password.tsx`; update it so the success message references the new `/reset-password?token=...` link wording.

---

## 5. Verification

- `/app/investor/sips` → tabs render mock SIPs; pause/resume/cancel optimistically update; "Upcoming" tab lists installments grouped by month.
- "Bank mandates" section shows fixture mandates; create dialog validates and prepends a new pending mandate; retry flips a rejected mandate to pending.
- `/app/investor/folios/123456789` renders folio detail with schemes table, transactions, linked SIPs, and quick-action buttons.
- `app.settings.tsx` "Security" tab has a working change-password form (mock validates current password).
- `/reset-password?token=abc` renders a new-password form and routes to `/login` on success.
- All existing flows (4 order wizards, KYC dialogs, goals wizard, scheme detail, holding detail) continue to work.

---

## Files

**Created**
- `src/types/sip.ts`, `src/types/mandate.ts`
- `src/features/sips/{api.ts,fixtures.ts}`
- `src/features/mandates/{api.ts,fixtures.ts,schemas.ts,components/create-mandate-dialog.tsx,components/mandate-card.tsx}`
- `src/routes/app.investor.sips.tsx`
- `src/routes/app.investor.folios.$folioNumber.tsx`
- `src/routes/reset-password.tsx`

**Edited**
- `src/config/navigation.ts` — add SIPs entry
- `src/types/portfolio.ts` — add `FolioDetail`
- `src/features/portfolio/{api.ts,fixtures.ts}` — add folio query + fixture
- `src/types/auth.ts` — add password payload types
- `src/features/auth/{api.ts,schemas.ts}` — add change/reset password
- `src/routes/app.settings.tsx` — add "Security" tab with change-password form
- `src/routes/app.investor.portfolio.$holdingId.tsx` — add "View folio" link
- `src/routes/forgot-password.tsx` — minor copy update for reset-link wording
