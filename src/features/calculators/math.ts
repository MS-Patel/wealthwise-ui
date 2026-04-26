// Pure financial math helpers for the investor calculators.
// All rates are in percent (e.g. 12 = 12% per annum). Tenure is in years.

export interface YearPoint {
  year: number;
  invested: number;
  value: number;
}

const monthsIn = (years: number) => Math.round(years * 12);

/** Future value of a regular monthly SIP. */
export function sipFutureValue(monthly: number, annualRatePct: number, years: number): number {
  const n = monthsIn(years);
  const r = annualRatePct / 100 / 12;
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

/** Future value of a SIP with an annual step-up (% applied each year). */
export function stepUpSipFutureValue(
  monthly: number,
  annualRatePct: number,
  years: number,
  stepUpPct: number,
): number {
  const r = annualRatePct / 100 / 12;
  let total = 0;
  let current = monthly;
  for (let y = 0; y < years; y++) {
    const fvOfYear = r === 0 ? current * 12 : current * ((Math.pow(1 + r, 12) - 1) / r) * (1 + r);
    const remainingYears = years - y - 1;
    total += fvOfYear * Math.pow(1 + annualRatePct / 100, remainingYears);
    current = current * (1 + stepUpPct / 100);
  }
  return total;
}

/** Year-by-year series for SIP (with optional step-up). */
export function sipSeries(
  monthly: number,
  annualRatePct: number,
  years: number,
  stepUpPct = 0,
): YearPoint[] {
  const r = annualRatePct / 100 / 12;
  const points: YearPoint[] = [];
  let invested = 0;
  let value = 0;
  let current = monthly;
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      value = (value + current) * (1 + r);
      invested += current;
    }
    points.push({ year: y, invested: Math.round(invested), value: Math.round(value) });
    current = current * (1 + stepUpPct / 100);
  }
  return points;
}

/** Future value of a single lumpsum. */
export function lumpsumFutureValue(amount: number, annualRatePct: number, years: number): number {
  return amount * Math.pow(1 + annualRatePct / 100, years);
}

export function lumpsumSeries(
  amount: number,
  annualRatePct: number,
  years: number,
): YearPoint[] {
  const points: YearPoint[] = [];
  for (let y = 1; y <= years; y++) {
    points.push({
      year: y,
      invested: Math.round(amount),
      value: Math.round(lumpsumFutureValue(amount, annualRatePct, y)),
    });
  }
  return points;
}

/** Required monthly SIP to reach a target corpus given current savings. */
export function requiredSipForGoal(
  target: number,
  annualRatePct: number,
  years: number,
  currentSavings = 0,
): number {
  const fvOfCurrent = lumpsumFutureValue(currentSavings, annualRatePct, years);
  const remaining = Math.max(target - fvOfCurrent, 0);
  if (remaining === 0) return 0;
  const n = monthsIn(years);
  const r = annualRatePct / 100 / 12;
  if (r === 0) return remaining / n;
  // Solve monthly = remaining / [((1+r)^n - 1)/r * (1+r)]
  const factor = ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  return remaining / factor;
}

export function goalSipSeries(
  monthly: number,
  annualRatePct: number,
  years: number,
  currentSavings = 0,
): YearPoint[] {
  const r = annualRatePct / 100 / 12;
  const points: YearPoint[] = [];
  let invested = currentSavings;
  let value = currentSavings;
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      value = (value + monthly) * (1 + r);
      invested += monthly;
    }
    points.push({ year: y, invested: Math.round(invested), value: Math.round(value) });
  }
  return points;
}

export interface RetirementResult {
  yearsToRetire: number;
  retirementYears: number;
  monthlyExpenseAtRetirement: number;
  corpusNeeded: number;
  requiredMonthlySip: number;
  expenseSeries: YearPoint[];
}

/** Retirement planner using inflation-adjusted expenses and a real post-retirement return. */
export function retirementPlan(input: {
  currentAge: number;
  retireAge: number;
  lifeExpectancy: number;
  monthlyExpenseToday: number;
  inflationPct: number;
  preReturnPct: number;
  postReturnPct: number;
}): RetirementResult {
  const yearsToRetire = Math.max(input.retireAge - input.currentAge, 0);
  const retirementYears = Math.max(input.lifeExpectancy - input.retireAge, 0);

  const monthlyExpenseAtRetirement =
    input.monthlyExpenseToday * Math.pow(1 + input.inflationPct / 100, yearsToRetire);
  const annualExpenseAtRetirement = monthlyExpenseAtRetirement * 12;

  // Real (inflation-adjusted) return during retirement
  const real =
    (1 + input.postReturnPct / 100) / (1 + input.inflationPct / 100) - 1;

  let corpusNeeded: number;
  if (retirementYears === 0) {
    corpusNeeded = 0;
  } else if (Math.abs(real) < 1e-6) {
    corpusNeeded = annualExpenseAtRetirement * retirementYears;
  } else {
    corpusNeeded =
      annualExpenseAtRetirement * ((1 - Math.pow(1 + real, -retirementYears)) / real);
  }

  const requiredMonthlySip =
    yearsToRetire === 0 ? 0 : requiredSipForGoal(corpusNeeded, input.preReturnPct, yearsToRetire, 0);

  // Expense projection — pre-retirement growing with inflation, post-retirement constant in nominal-of-retirement terms
  const expenseSeries: YearPoint[] = [];
  for (let y = 1; y <= yearsToRetire + retirementYears; y++) {
    const age = input.currentAge + y;
    const monthly =
      age <= input.retireAge
        ? input.monthlyExpenseToday * Math.pow(1 + input.inflationPct / 100, y)
        : monthlyExpenseAtRetirement *
          Math.pow(1 + input.inflationPct / 100, age - input.retireAge);
    expenseSeries.push({
      year: age,
      invested: Math.round(monthly * 12),
      value: Math.round(monthly * 12),
    });
  }

  return {
    yearsToRetire,
    retirementYears,
    monthlyExpenseAtRetirement,
    corpusNeeded,
    requiredMonthlySip,
    expenseSeries,
  };
}
