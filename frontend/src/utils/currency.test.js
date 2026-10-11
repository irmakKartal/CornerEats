import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice, getCurrencyConfig, setCustomRates, setCustomCountry } from './currency.js';

test('uses Turkish lira when the device region is Turkey', () => {
  setCustomCountry('TR');
  setCustomRates({ TRY: 50 });
  const config = getCurrencyConfig('en-TR', 'UTC');

  assert.equal(config.code, 'TRY');
  assert.equal(config.rate, 50);
  assert.equal(config.country, 'TR');
  assert.equal(formatPrice(10, 'en-TR', 'UTC'), '₺500,00');
});

test('uses Turkish lira for the Istanbul device time zone', () => {
  setCustomCountry(null);
  setCustomRates({ TRY: 50 });
  const config = getCurrencyConfig('en-US', 'Europe/Istanbul');

  assert.equal(config.code, 'TRY');
  assert.equal(formatPrice(10, 'en-US', 'Europe/Istanbul'), '₺500,00');
});

test('uses the United States dollar for other regions', () => {
  setCustomCountry('US');
  const config = getCurrencyConfig('tr-US', 'America/New_York');

  assert.equal(config.code, 'USD');
  assert.equal(config.rate, 1);
  assert.equal(formatPrice(10, 'tr-US', 'America/New_York'), '$10.00');
});

test('correctly formats order prices with dynamic rates', () => {
  setCustomRates({ TRY: 50 });

  // Order in TRY displayed in TR
  setCustomCountry('TR');
  const tryOrder = { amount: 500, currency: 'TRY' };
  assert.equal(formatPrice(tryOrder), '₺500,00');

  // Order in TRY displayed in US
  setCustomCountry('US');
  assert.equal(formatPrice(tryOrder), '$10.00');

  // Order in USD displayed in TR
  setCustomCountry('TR');
  const usdOrder = { amount: 10, currency: 'USD' };
  assert.equal(formatPrice(usdOrder), '₺500,00');

  // Reset
  setCustomCountry(null);
});
