const COUNTRY_TO_CURRENCY = {
  TR: 'TRY',
  US: 'USD',
  SA: 'SAR',
  AE: 'AED',
  EG: 'EGP',
  KW: 'KWD',
  QA: 'QAR',
  BH: 'BHD',
  OM: 'OMR',
  JO: 'JOD',
  LB: 'LBP',
  IQ: 'IQD',
  SY: 'SYP',
  MA: 'MAD',
  DZ: 'DZD',
  TN: 'TND',
  LY: 'LYD',
  SD: 'SDG',
  YE: 'YER',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  GR: 'EUR',
  PT: 'EUR',
  FI: 'EUR',
  IE: 'EUR',
  LU: 'EUR',
  CY: 'EUR',
  MT: 'EUR',
  SK: 'EUR',
  SI: 'EUR',
  EE: 'EUR',
  LV: 'EUR',
  LT: 'EUR',
  JP: 'JPY',
  CN: 'CNY',
  IN: 'INR',
  RU: 'RUB',
  BR: 'BRL',
  MX: 'MXN',
  CH: 'CHF',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  PL: 'PLN',
};

const TIMEZONE_TO_COUNTRY = {
  'Europe/Istanbul': 'TR',
  'Asia/Istanbul': 'TR',
  'Asia/Riyadh': 'SA',
  'Asia/Dubai': 'AE',
  'Africa/Cairo': 'EG',
  'Asia/Kuwait': 'KW',
  'Asia/Qatar': 'QA',
  'Asia/Bahrain': 'BH',
  'Asia/Muscat': 'OM',
  'Asia/Amman': 'JO',
  'Asia/Beirut': 'LB',
  'Asia/Baghdad': 'IQ',
  'Asia/Damascus': 'SY',
  'Europe/London': 'GB',
  'Europe/Berlin': 'DE',
  'Europe/Paris': 'FR',
  'Europe/Rome': 'IT',
  'Europe/Madrid': 'ES',
  'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE',
  'Europe/Vienna': 'AT',
  'Europe/Athens': 'GR',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Los_Angeles': 'US',
  'America/Denver': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Asia/Tokyo': 'JP',
};

const CURRENCY_TO_LOCALE = {
  TRY: 'tr-TR',
  USD: 'en-US',
  SAR: 'ar-SA',
  AED: 'ar-AE',
  EGP: 'ar-EG',
  KWD: 'ar-KW',
  QAR: 'ar-QA',
  BHD: 'ar-BH',
  OMR: 'ar-OM',
  JOD: 'ar-JO',
  LBP: 'ar-LB',
  IQD: 'ar-IQ',
  SYP: 'ar-SY',
  MAD: 'ar-MA',
  DZD: 'ar-DZ',
  TND: 'ar-TN',
  GBP: 'en-GB',
  EUR: 'de-DE',
  CAD: 'en-CA',
  AUD: 'en-AU',
  NZD: 'en-NZ',
  JPY: 'ja-JP',
  CNY: 'zh-CN',
  INR: 'en-IN',
  RUB: 'ru-RU',
  BRL: 'pt-BR',
  MXN: 'es-MX',
  CHF: 'de-CH',
};

const DEFAULT_RATES = {
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

let currentRates = { ...DEFAULT_RATES };
let detectedCountry = null;
const listeners = new Set();

const loadCachedData = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const cachedCountry = window.localStorage.getItem('tomato_device_country');
    if (cachedCountry && typeof cachedCountry === 'string') {
      detectedCountry = cachedCountry.toUpperCase();
    }
    const cachedRatesStr = window.localStorage.getItem('tomato_currency_rates');
    if (cachedRatesStr) {
      const parsed = JSON.parse(cachedRatesStr);
      if (parsed && typeof parsed === 'object') {
        currentRates = { ...DEFAULT_RATES, ...parsed, USD: 1 };
      }
    }
  } catch {
    // Ignore storage read errors
  }
};

loadCachedData();

export const notifyCurrencyChange = () => {
  listeners.forEach((listener) => {
    try {
      listener(getCurrencyConfig());
    } catch {
      // Ignore listener errors
    }
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tomato-currency-change', { detail: getCurrencyConfig() }));
  }
};

export const onCurrencyChange = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setCustomRates = (newRates) => {
  currentRates = { ...currentRates, ...newRates, USD: 1 };
  notifyCurrencyChange();
};

export const setCustomCountry = (countryCode) => {
  detectedCountry = countryCode ? countryCode.toUpperCase() : null;
  if (typeof window !== 'undefined' && window.localStorage && countryCode) {
    window.localStorage.setItem('tomato_device_country', detectedCountry);
  }
  notifyCurrencyChange();
};

export const getExchangeRate = (currencyCode) => {
  if (!currencyCode) return 1;
  const code = String(currencyCode).trim().toUpperCase();
  if (code === 'USD') return 1;
  const rate = Number(currentRates[code]);
  return Number.isFinite(rate) && rate > 0 ? rate : 1;
};

export const getAllRates = () => ({ ...currentRates });

export const getDeviceRegion = (locale) => {
  if (detectedCountry) return detectedCountry;
  const resolvedLocale = locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US');
  try {
    const region = new Intl.Locale(resolvedLocale).region;
    return region || resolvedLocale.split('-').at(-1)?.toUpperCase() || 'US';
  } catch {
    return resolvedLocale.split('-').at(-1)?.toUpperCase() || 'US';
  }
};

export const getCurrencyConfig = (
  locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US',
  timeZone = typeof Intl !== 'undefined' && Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
) => {
  let country = detectedCountry;

  if (!country) {
    if (timeZone && TIMEZONE_TO_COUNTRY[timeZone]) {
      country = TIMEZONE_TO_COUNTRY[timeZone];
    } else if (timeZone && (timeZone.includes('Istanbul') || timeZone.includes('Turkey'))) {
      country = 'TR';
    } else {
      country = getDeviceRegion(locale);
    }
  }

  const currencyCode = (country && COUNTRY_TO_CURRENCY[country]) || 'USD';
  const rate = getExchangeRate(currencyCode);
  const currencyLocale = CURRENCY_TO_LOCALE[currencyCode] || locale || 'en-US';

  return {
    code: currencyCode,
    rate,
    locale: currencyLocale,
    country: country || 'US',
  };
};

export const formatOrderPrice = (
  order,
  locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US',
  timeZone = typeof Intl !== 'undefined' && Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
) => {
  if (!order) return '';
  const rawAmount = typeof order === 'number' ? order : Number(order.amount || 0);
  const orderCurrency = (typeof order === 'object' && order.currency ? String(order.currency) : 'USD').toUpperCase();
  const { code, rate: targetRate, locale: currencyLocale } = getCurrencyConfig(locale, timeZone);

  let finalAmount = rawAmount;
  if (orderCurrency === code) {
    finalAmount = rawAmount;
  } else {
    const orderRate = getExchangeRate(orderCurrency);
    finalAmount = (rawAmount / orderRate) * targetRate;
  }

  return new Intl.NumberFormat(currencyLocale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(finalAmount);
};

export const formatPrice = (
  amountOrOrder,
  locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US',
  timeZone = typeof Intl !== 'undefined' && Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
) => {
  if (typeof amountOrOrder === 'object' && amountOrOrder !== null) {
    return formatOrderPrice(amountOrOrder, locale, timeZone);
  }

  const { code, rate, locale: currencyLocale } = getCurrencyConfig(locale, timeZone);
  const numericAmount = Number(amountOrOrder || 0);

  return new Intl.NumberFormat(currencyLocale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount * rate);
};

export const formatDate = (
  dateValue,
  locale = typeof navigator !== 'undefined' ? navigator.language : undefined
) => {
  if (!dateValue) return 'N/A';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'N/A';

  try {
    return new Intl.DateTimeFormat(locale || undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
};

// Async initialization: Fetch real device country via IP and live FX rates from backend/API
const defaultApiUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'https://cornereats-backend.onrender.com';
export const initCurrency = async (apiUrl = defaultApiUrl) => {
  if (typeof window === 'undefined') return;

  // 1. Detect device country from IP
  const detectCountryPromise = (async () => {
    try {
      const res = await fetch('https://api.country.is');
      if (res.ok) {
        const data = await res.json();
        if (data && data.country) {
          detectedCountry = String(data.country).toUpperCase();
          window.localStorage.setItem('tomato_device_country', detectedCountry);
        }
      }
    } catch {
      // Fallback relies on timezone / locale
    }
  })();

  // 2. Fetch live exchange rates
  const fetchRatesPromise = (async () => {
    try {
      let res = await fetch(`${apiUrl}/api/currency/rates`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch('https://open.er-api.com/v6/latest/USD').catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        const incomingRates = data.rates || data;
        if (incomingRates && typeof incomingRates === 'object') {
          currentRates = { ...DEFAULT_RATES, ...incomingRates, USD: 1 };
          window.localStorage.setItem('tomato_currency_rates', JSON.stringify(currentRates));
        }
      }
    } catch {
      // Fallback relies on cached/default rates
    }
  })();

  await Promise.allSettled([detectCountryPromise, fetchRatesPromise]);
  notifyCurrencyChange();
};

// Run auto-init in browser environments
if (typeof window !== 'undefined') {
  initCurrency(defaultApiUrl);
}
