// Fund configuration — return estimates based on Morningstar Q4 2025 category averages and top performers
export const fundConfig: Record<string, { cur: number; rec: number; label: string }> = {
  defensive:    { cur: 2.6,  rec: 2.9,  label: 'Cash/Defensive' },
  conservative: { cur: 5.0,  rec: 5.8,  label: 'Moderate' },
  balanced:     { cur: 6.9,  rec: 8.2,  label: 'Balanced' },
  growth:       { cur: 8.2,  rec: 10.2, label: 'Growth' },
  aggressive:   { cur: 9.5,  rec: 10.5, label: 'High Growth' },
  unknown:      { cur: 5.0,  rec: 8.2,  label: 'Unknown' },
};

// Fund type warnings — shown when user picks a potentially mismatched fund
export const fundWarnings: Record<string, string> = {
  defensive:
    'Heads up: a Cash/Defensive fund is almost certainly the wrong choice if your KiwiSaver is locked until 65.',
  conservative:
    'Heads up: if you\'ve already bought your house, a Moderate fund could be costing you six figures over the next few decades.',
  unknown:
    'Not knowing your fund type is more common than you think. It\'s also one of the most expensive things to ignore.',
};

// 10-year Morningstar Q4 2025 rankings
// g = green (top 3), y = yellow (4-8), r = red (9+)
export type Rating = 'g' | 'y' | 'r';

// 10-year Morningstar Q4 2025 rankings by category
// g = green (top 3 among site providers), y = yellow (4-8), r = red (9+)
// Providers without 10yr data in a category are omitted (shows "insufficient data")
export const morningstarRankings: Record<string, Record<string, Rating>> = {
  defensive: {
    // Cash category 10yr: Fisher 2.9%, SuperLife 2.8%, ANZ 2.8%, Westpac 2.8%, BNZ 2.8%, ASB 2.5%, Mercer 2.5%, Booster 2.2%, AMP 2.1%
    'Fisher Funds': 'g', 'Superlife': 'g', 'ANZ': 'g',
    'Westpac': 'y', 'BNZ': 'y', 'ASB': 'y', 'Mercer': 'y',
    'Booster': 'r', 'AMP': 'r',
  },
  conservative: {
    // Moderate category 10yr: BNZ 5.8%, Generate 5.7%, ASB 5.5%, Westpac 5.5%, Mercer 5.1%, Superlife 5.0%, AMP 4.9%, ANZ 4.7%, Booster 4.6%, Fisher Funds 4.3%
    'BNZ': 'g', 'Generate': 'g', 'ASB': 'g',
    'Westpac': 'y', 'Mercer': 'y', 'Superlife': 'y', 'AMP': 'y',
    'ANZ': 'r', 'Booster': 'r', 'Fisher Funds': 'r',
  },
  balanced: {
    // Balanced category 10yr: Milford 8.2%, ASB 7.5%, BNZ 7.3%, Superlife 7.0%, Westpac 6.9%, AMP 6.7%, Booster 6.6%, Mercer 6.6%, Fisher Funds 6.5%, ANZ 5.8%
    'Milford': 'g', 'ASB': 'g', 'BNZ': 'g',
    'Superlife': 'y', 'Westpac': 'y', 'AMP': 'y', 'Booster': 'y', 'Mercer': 'y',
    'Fisher Funds': 'r', 'ANZ': 'r',
  },
  growth: {
    // Growth category 10yr: Milford 10.2%, ASB 9.0%, BNZ 9.0%, Generate 8.9%, AMP 8.4%, Booster 8.3%, Westpac 8.2%, Superlife 8.2%, Mercer 8.1%, Fisher Funds 8.1%, ANZ 8.0%
    'Milford': 'g', 'ASB': 'g', 'BNZ': 'g',
    'Generate': 'y', 'AMP': 'y', 'Booster': 'y', 'Westpac': 'y', 'Superlife': 'y',
    'Mercer': 'r', 'Fisher Funds': 'r', 'ANZ': 'r',
  },
  aggressive: {
    // Aggressive category 10yr: Booster 10.5%, Generate 9.9%, Superlife 9.3%, AMP 9.2%, Mercer 9.2%
    // Many providers lack 10yr aggressive data (ANZ, ASB, BNZ, Westpac, Milford, Simplicity, Kernel)
    'Booster': 'g', 'Generate': 'g', 'Superlife': 'g',
    'AMP': 'y', 'Mercer': 'y',
  },
  unknown: {},
};

// Provider list for step 2
export const healthCheckProviders = [
  'ANZ', 'ASB', 'BNZ', 'Westpac',
  'Fisher Funds', 'Milford', 'Simplicity', 'Generate',
  'Booster', 'Kernel', 'Superlife', 'AMP',
  'Mercer', 'InvestNow', 'Kiwi Wealth', 'Other',
];

// Fund type options for step 1
export const fundTypeOptions = [
  { key: 'defensive',    label: 'Cash / Defensive',  timeframe: '0–1 year' },
  { key: 'conservative', label: 'Moderate',           timeframe: '1–3 years' },
  { key: 'balanced',     label: 'Balanced',           timeframe: '3–5 years' },
  { key: 'growth',       label: 'Growth',             timeframe: '5–10 years' },
  { key: 'aggressive',   label: 'High Growth',        timeframe: '10+ years' },
  { key: 'unknown',      label: "I don't know",       timeframe: "That's OK — most don't" },
];

// Projection calculation
export function projectBalance(
  balance: number,
  income: number,
  employeeContrib: number,
  employerContrib: number,
  returnRate: number,
  years: number,
  selfEmployedAnnual: number = 0,
): number[] {
  const series = [Math.round(balance)];
  let b = balance;
  let inc = income;
  for (let i = 0; i < years; i++) {
    b = b * (1 + returnRate / 100) + inc * (employeeContrib + employerContrib) / 100 + selfEmployedAnnual;
    inc *= 1.02; // 2% annual salary growth
    series.push(Math.max(0, Math.round(b)));
  }
  return series;
}

// Format currency
export function formatCurrency(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-NZ');
}

// Get rating info for a provider/fund combination
export function getRatingInfo(fundKey: string, provider: string) {
  const rating = (morningstarRankings[fundKey] || {})[provider];
  const fundLabel = (fundConfig[fundKey] || fundConfig.unknown).label;

  if (rating === 'g') {
    return {
      rating: 'green' as const,
      message: `${provider} has been a strong performer in the ${fundLabel} category over the last 10 years.`,
    };
  } else if (rating === 'y') {
    return {
      rating: 'yellow' as const,
      message: `${provider} has shown average performance in the ${fundLabel} category over the last 10 years. There may be better options.`,
    };
  } else if (rating === 'r') {
    return {
      rating: 'red' as const,
      message: `${provider} has been a poor performer in the ${fundLabel} category over the last 10 years. Better options are available.`,
    };
  }
  return {
    rating: 'unknown' as const,
    message: `Insufficient 10-year data for ${provider} in this category. Book a free chat and we'll show you the full picture.`,
  };
}
