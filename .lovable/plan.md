# Mirror buybestfin.com — homepage + separate public routes for every nav item

## Important note about the source

The GitHub repo `https://github.com/putulkashyap/buybestfin.git` returned **404 Not Found** — it's private or the URL is wrong, so I can't copy source files directly. Instead, I'll faithfully mirror the public site at https://buybestfin.com using its visible structure, copy, and branding, plus build out a dedicated public route for each top-nav item.

If you make the repo public (or share access), I can do a closer 1:1 port later.

## Public routes to create

The live site's top nav links to: **Our Products, Live Market, Explore Funds, Unlisted Equities, SIP Calculator, Risk Analyzer**, plus the Login/Register CTA. Every one becomes its own SSR-friendly route with its own SEO metadata.

```
src/routes/
  index.tsx                  → / (homepage — Hero + Services + About + Compliance)
  products.tsx               → /products          (Our Products)
  live-market.tsx            → /live-market       (Live Market)
  explore-funds.tsx          → /explore-funds     (Explore Funds)
  unlisted-equities.tsx      → /unlisted-equities (Unlisted Equities)
  sip-calculator.tsx         → /sip-calculator    (SIP Calculator)
  risk-analyzer.tsx          → /risk-analyzer     (Risk Analyzer)
```

Login/Register continues to use the existing `/login` and `/signup` routes.

## Shared marketing layout

To avoid duplicating the public top nav and footer on every route, create a shared marketing layout:

- `src/routes/_marketing.tsx` — pathless layout route (no URL segment) that renders:
  - `<MarketingHeader />` — sticky top nav with the BrandLogo on the left and 6 nav `<Link>`s + gradient "Login / Register" CTA on the right. Uses `activeProps` so the current route is highlighted.
  - `<Outlet />` — the active route's page content.
  - `<ComplianceFooter />` — the existing footer.
  - `<FloatingActions />` — WhatsApp + chat buttons (bottom-right, fixed).
- All seven public routes (`/`, `/products`, `/live-market`, `/explore-funds`, `/unlisted-equities`, `/sip-calculator`, `/risk-analyzer`) move under this layout by being placed in the `_marketing` group via TanStack's flat naming: `_marketing.index.tsx`, `_marketing.products.tsx`, etc. (The leading underscore makes the segment pathless.)
- The existing `/login`, `/signup`, `/forgot-password`, `/reset-password`, and `/app/*` routes are NOT moved — they keep their own layouts.

Files moved into the layout group:
- `src/routes/index.tsx` → `src/routes/_marketing.index.tsx`
- New: `src/routes/_marketing.products.tsx`, `_marketing.live-market.tsx`, `_marketing.explore-funds.tsx`, `_marketing.unlisted-equities.tsx`, `_marketing.sip-calculator.tsx`, `_marketing.risk-analyzer.tsx`

## Per-route content

All routes share the same header/footer (from the layout). Each page has its own hero band + 1–3 content sections built from existing shadcn primitives (`Card`, `Badge`, `Button`, `Input`, `Tabs`, etc.) and brand tokens (`gradient-brand`, `gradient-text-brand`, `shadow-card`).

### `/` — Home
Mirrors live site:
1. **Hero**: "AMFI Registered Mutual Fund Distributor" badge → "Grow Your Wealth with **Smart Investments**" (gradient text) → subcopy → "Start Investing" + "Explore Services" CTAs → 3 stats (500+ Happy Clients, ₹50Cr+ AUM, 10+ Years). Right side: 4 product preview cards (Mutual Funds, Listed Equities, Bonds, Corporate FDs).
2. **Services** (`#services`) — eyebrow + display heading "Complete Investment Solutions" + 6 service cards (Mutual Funds, Unlisted Equities, Listed Equities, Bonds, Corporate FDs, Portfolio Management) — each with description + 3 feature chips.
3. **About** (`#about`) — "Your Trusted Financial Partner Since Day One" + 6 checkmark bullets + "Why Choose Us?" stats card (147231 ARN, 500+ Clients, 5000+ MF Schemes, 24/7 Online Access).
4. **Compliance disclaimer line** above the footer.

### `/products` — Our Products
Page header + the same 6 service cards from the home page, plus a CTA strip at the bottom ("Open an account in 3 minutes").

### `/live-market` — Live Market
Page header + a static market snapshot UI (no live data feed in scope):
- Top tile: "Indian markets — last close (illustrative)" with NIFTY 50, SENSEX, BANK NIFTY, NIFTY MIDCAP 100 mock cards (value + change + sparkline-style mini bar).
- "Top gainers / Top losers" two-column tables (5 rows each, mock data).
- Banner: "Live data integration coming soon — talk to your advisor for real-time quotes."

### `/explore-funds` — Explore Funds
Page header + filter row (Category select, AMC select, Search input — visual only) + a 3×3 grid of fund cards (mock: Parag Parikh Flexi Cap, Mirae Midcap, HDFC Corporate Bond, Quant Small Cap, Axis Bluechip, ICICI Prudential Balanced Advantage, SBI Magnum Gilt, Nippon Liquid, Kotak Equity Opportunities). Each card: scheme name, category badge, 3Y return %, AUM, "Invest now" → `/login`.

### `/unlisted-equities` — Unlisted Equities
Page header + intro copy + 6 pre-IPO company cards (mock: NSE, OYO, Reliance Retail, Tata Capital, Swiggy alumni placeholder, etc.) — each with sector, last traded price, lot size, "Enquire" CTA → WhatsApp link. Risk callout block.

### `/sip-calculator` — SIP Calculator
Page header + a working calculator (left form, right result):
- Inputs (RHF + Zod): Monthly investment ₹, Expected return % p.a., Time period (years).
- Outputs: Invested amount, Estimated returns, Total value (formatted INR).
- Reuse the SIP math already in `src/features/calculators/math.ts`.
- Donut/bar visualization using **Recharts** (`Invested` vs `Returns`).

### `/risk-analyzer` — Risk Analyzer
Page header + a 6-question risk-profile quiz (RHF + Zod), each question is a `RadioGroup` with 4 options scored 1–4. On submit:
- Compute total → bucket into Conservative / Moderate / Aggressive.
- Show a result card with the bucket, a one-paragraph description, and a suggested allocation (Equity / Debt / Gold) shown as 3 stat tiles.
- "Start your portfolio" CTA → `/signup`.

## Per-route SEO metadata

Every route gets its own unique `head()` with title, description, og:title, og:description. Examples:

- `/products`: "Our Products — BuyBestFin" / "Mutual funds, equities, bonds, corporate FDs and more."
- `/sip-calculator`: "SIP Calculator — Plan your monthly investment" / "Estimate the future value of your SIP with BuyBestFin's SIP calculator."
- `/risk-analyzer`: "Risk Analyzer — Discover your investor profile" / "Take a 2-minute quiz to find the right asset allocation for you."

(Concrete copy for each will be set in the route files.)

## New components

- `src/components/marketing/marketing-header.tsx` — sticky top nav with logo, 6 `<Link>`s with `activeProps`, mobile hamburger using existing `Sheet`, and the gradient Login/Register CTA. Mobile: collapses links into the sheet.
- `src/components/marketing/floating-actions.tsx` — fixed bottom-right WhatsApp button → `https://wa.me/917265098822?text=Hi` (new tab) and a chat-bubble button that scrolls to the page footer for now.
- `src/components/marketing/marketing-page-header.tsx` — small reusable `<PageHeader title subtitle eyebrow>` band used at the top of all sub-routes for visual consistency.

## Bug fix bundled in

Build is currently failing with:
```
Cannot find module '@/features/calculators/components/result-chart'
```
The folder `src/features/calculators/components/` doesn't exist. I'll recreate `result-chart.tsx` (the Recharts AreaChart from the previous turn) so the build passes. Same component will also be reused inside `/sip-calculator`.

## What's explicitly OUT of scope

- No live market data feed (mock snapshot only on `/live-market`).
- No real product catalog or fund-house API on `/explore-funds` (mock cards).
- No authentication, forms, or backend on the public pages — all CTAs route to existing `/login` or `/signup`.
- The authenticated `/app/*` portal is untouched.

## File summary

**Edit / move**
- `src/routes/index.tsx` → moved to `src/routes/_marketing.index.tsx` (homepage, rewritten to mirror live site).

**Create — routes**
- `src/routes/_marketing.tsx` (pathless layout)
- `src/routes/_marketing.products.tsx`
- `src/routes/_marketing.live-market.tsx`
- `src/routes/_marketing.explore-funds.tsx`
- `src/routes/_marketing.unlisted-equities.tsx`
- `src/routes/_marketing.sip-calculator.tsx`
- `src/routes/_marketing.risk-analyzer.tsx`

**Create — components**
- `src/components/marketing/marketing-header.tsx`
- `src/components/marketing/marketing-page-header.tsx`
- `src/components/marketing/floating-actions.tsx`
- `src/features/calculators/components/result-chart.tsx` (restores missing file → fixes current build error)

## Verification

After implementation: run `bun run build:dev` to confirm the build passes, then visit each new route to confirm the header is sticky, the active link is highlighted, the calculator computes correctly, and the risk analyzer scores correctly.
