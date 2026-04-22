

# Investor Portal — Final Polish Plan

The B2C investor portal spec is **~95% built**. All major routes exist: Auth (login/forgot), Dashboard, Portfolio (+holding detail), Explore, Transactions, Profile/KYC, Order wizards (Lumpsum/SIP/Redeem/Switch), Goals, Tax Harvesting, AI Insights, Notifications, Settings. Architecture (feature-sliced, Axios+TanStack Query hooks, Zustand stores, Zod schemas) already matches every constraint in section 3.

This plan closes the remaining gaps and delivers a true "production-ready B2C" feel.

## Gaps vs. spec

1. **Signup is missing.** Spec calls for "Login (Email/Password & OTP), Forgot Password, **Signup**." Login page only has sign-in.
2. **Scheme detail page is missing.** Explore links to `SchemeCard` but there's no `/app/investor/explore/$schemeId` deep-dive (fund factsheet, NAV history, allocations, invest CTA).
3. **Add-Bank & Add-Nominee flows are toast stubs** in `app.investor.profile.tsx` — should be working dialogs with React Hook Form + Zod validation against mock state.
4. **Goals "New goal" wizard** is a toast stub — spec lists Goal-Based Investing under Future Prospects, and a working wizard rounds it out.
5. **Compliance footer is missing** — required for a real MF distributor (ARN 147231, AMFI risk disclaimer, Navinchandra Securities legal info).
6. **Landing route `/`** redirects straight to `/login`. For a B2C product, a public marketing landing (hero + features + CTAs to login/signup) is expected.

## Build plan (in order)

### 1. Public marketing landing — `src/routes/index.tsx`
Replace the redirect with a real landing page: hero with brand gradient + Playfair headline, 3-feature strip (Smart investing / Goal planning / Tax optimisation), trust bar (ARN, AMFI registered, BSE Star MF), CTAs to `/login` and `/signup`. Authenticated users still auto-redirect to their `ROLE_HOME`.

### 2. Signup flow — `src/routes/signup.tsx` + auth additions
- New route mirroring login's split layout (`BrandPanel` + form panel).
- Zod schema in `src/features/auth/schemas.ts`: `signupSchema` (fullName, email, mobile, password, confirmPassword, agreeTerms).
- `signup()` mock in `src/features/auth/api.ts` returning `AuthResult`, plus `useSignupMutation()`.
- Link from login footer ("New to BuyBestFin? Create account").

### 3. Scheme detail page — `src/routes/app.investor.explore.$schemeId.tsx`
Deep-dive page with: hero (scheme name, AMC, NAV, 1Y return badge, rating, risk pill), Recharts NAV trend (mock 1Y series generated from scheme data), key facts grid (AUM, expense ratio, exit load, min lumpsum/SIP, benchmark, fund manager), allocation donut (mock asset/sector mix), and sticky "Invest now" + "Start SIP" CTAs that route to wizards with `?schemeId=`. Wire `SchemeCard` rows to link here.

### 4. Profile dialogs — bank + nominee
In `app.investor.profile.tsx`, replace the two toast stubs with `Dialog` components:
- **AddBankDialog**: form (bankName, accountNumber, ifsc, accountType) → optimistic update via local `useState` overlay on the query data, success toast.
- **AddNomineeDialog**: form (name, relation, dob, sharePct) → same pattern; validation enforces total share ≤ 100%.
- Both schemas live in `src/features/kyc/schemas.ts` (new file).

### 5. Goal creation wizard — `GoalWizardDialog`
Multi-step `Dialog` (3 steps via `wizard-stepper`): Pick category → Target & date → Monthly contribution & link funds. Append created goal to local store overlay; replace the toast in `app.investor.goals.tsx`. Schema in `src/features/goals/schemas.ts`.

### 6. Global compliance footer — `src/components/layout/compliance-footer.tsx`
Render inside `AppShell` below `<main>`: Navinchandra Securities · ARN 147231 · "Mutual fund investments are subject to market risks. Read all scheme-related documents carefully." · BSE Star MF logo placeholder · links to terms/privacy/grievance. Also render on the new public landing.

### 7. Wire-up & nav updates
- Add `Explore Schemes` row click to navigate to scheme detail.
- `app.investor.portfolio.$holdingId.tsx` — add a "View scheme page" link to scheme detail.
- No new sidebar items (scheme detail is reached from Explore, dialogs are inline).

## Files

**Created**
- `src/routes/signup.tsx`
- `src/routes/app.investor.explore.$schemeId.tsx`
- `src/features/kyc/schemas.ts`
- `src/features/kyc/components/add-bank-dialog.tsx`
- `src/features/kyc/components/add-nominee-dialog.tsx`
- `src/features/goals/schemas.ts`
- `src/features/goals/components/goal-wizard-dialog.tsx`
- `src/components/layout/compliance-footer.tsx`

**Edited**
- `src/routes/index.tsx` — replace redirect with marketing landing (auth users still redirect)
- `src/routes/login.tsx` — add "Create account" link
- `src/features/auth/schemas.ts` — add `signupSchema`
- `src/features/auth/api.ts` — add `signup()` + `useSignupMutation()`
- `src/routes/app.investor.profile.tsx` — wire AddBank/AddNominee dialogs
- `src/routes/app.investor.goals.tsx` — wire GoalWizardDialog
- `src/features/schemes/components/scheme-card.tsx` — link to scheme detail
- `src/components/layout/app-shell.tsx` — mount compliance footer
- `src/routes/app.investor.portfolio.$holdingId.tsx` — link to scheme detail

## Verification
- `/` shows landing (logged-out) or redirects (logged-in)
- `/signup` round-trips and lands on investor dashboard
- Explore card → `/app/investor/explore/<id>` renders factsheet + chart
- Bank/Nominee dialogs validate, persist locally, and close cleanly
- Goal wizard creates a goal that appears in the list
- Compliance footer visible on every authenticated page and on landing
- All 4 order wizards still work end-to-end

