const API_URL = 'https://open.er-api.com/v6/latest/USD';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

// Safe initial baseline rates so the server is ready immediately
const defaultRates = {
  USD: 1,
  TRY: 49.34,
  EUR: 0.89,
  GBP: 0.76,
  SAR: 3.75,
  AED: 3.67,
  EGP: 52.38,
  KWD: 0.31,
  QAR: 3.64,
  BHD: 0.38,
  OMR: 0.38,
  JOD: 0.71,
  CAD: 1.38,
  AUD: 1.52,
  JPY: 152.0,
  CNY: 7.12,
  INR: 84.0,
  RUB: 96.0,
  BRL: 5.60,
  CHF: 0.86,
};

let cachedRates = { ...defaultRates };
let lastUpdated = Date.now();
let isFetching = false;

export const refreshRates = async () => {
  if (isFetching || process.env.NODE_ENV === 'test') return cachedRates;
  isFetching = true;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(API_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data && data.rates && typeof data.rates === 'object') {
        cachedRates = {
          ...defaultRates,
          ...data.rates,
          USD: 1,
        };
        lastUpdated = Date.now();
      }
    }
  } catch (error) {
    // Keep existing cached rates on any error
    console.warn('Currency API fetch warning, keeping existing rates:', error.message);
  } finally {
    isFetching = false;
  }

  return cachedRates;
};

export const getRates = () => {
  if (Date.now() - lastUpdated > CACHE_DURATION_MS && process.env.NODE_ENV !== 'test') {
    refreshRates().catch(() => {});
  }
  return cachedRates;
};

export const getRate = (currencyCode) => {
  if (!currencyCode) return 1;
  const normalized = String(currencyCode).trim().toUpperCase();
  if (normalized === 'USD') return 1;

  const rates = getRates();
  const rate = Number(rates[normalized]);
  return Number.isFinite(rate) && rate > 0 ? rate : 1;
};

export const getLastUpdated = () => lastUpdated;

// In non-test environment, start background refresh and timer
if (process.env.NODE_ENV !== 'test') {
  refreshRates().catch(() => {});
  const timer = setInterval(() => {
    refreshRates().catch(() => {});
  }, CACHE_DURATION_MS);
  if (typeof timer.unref === 'function') {
    timer.unref();
  }
}
