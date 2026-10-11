import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPrice,
  formatOrderPrice,
  formatDate,
  getCurrencyConfig,
  setCustomRates,
  setCustomCountry,
} from './currency.js';

test('currency utility handles numbers and orders correctly with dynamic rates', () => {
  setCustomCountry('TR');
  setCustomRates({ TRY: 50 });

  assert.equal(getCurrencyConfig('en-TR', 'UTC').code, 'TRY');
  setCustomCountry('US');
  assert.equal(getCurrencyConfig('en-US', 'America/New_York').code, 'USD');

  // Test raw numbers (like food item price in USD)
  setCustomCountry('TR');
  assert.equal(formatPrice(10, 'en-TR', 'UTC'), '₺500,00');
  setCustomCountry('US');
  assert.equal(formatPrice(10, 'en-US', 'America/New_York'), '$10.00');

  // Test order placed in TRY displayed in Turkey
  setCustomCountry('TR');
  const tryOrder = { amount: 500, currency: 'TRY' };
  assert.equal(formatPrice(tryOrder, 'en-TR', 'UTC'), '₺500,00');
  assert.equal(formatOrderPrice(tryOrder, 'en-TR', 'UTC'), '₺500,00');

  // Test order placed in TRY displayed in US
  setCustomCountry('US');
  assert.equal(formatPrice(tryOrder, 'en-US', 'America/New_York'), '$10.00');
  assert.equal(formatOrderPrice(tryOrder, 'en-US', 'America/New_York'), '$10.00');

  // Test order placed in USD displayed in Turkey
  setCustomCountry('TR');
  const usdOrder = { amount: 10, currency: 'USD' };
  assert.equal(formatPrice(usdOrder, 'en-TR', 'UTC'), '₺500,00');

  // Test order placed in USD displayed in US
  setCustomCountry('US');
  assert.equal(formatPrice(usdOrder, 'en-US', 'America/New_York'), '$10.00');

  // Test legacy order without currency field (defaults to USD)
  setCustomCountry('US');
  const legacyOrder = { amount: 15 };
  assert.equal(formatPrice(legacyOrder, 'en-US', 'America/New_York'), '$15.00');
  setCustomCountry('TR');
  assert.equal(formatPrice(legacyOrder, 'en-TR', 'UTC'), '₺750,00');

  // Test date formatting
  const fixedDate = new Date('2026-10-10T12:30:00Z');
  const formattedDate = formatDate(fixedDate, 'en-US');
  assert.ok(formattedDate.includes('2026') || formattedDate.includes('Oct'));

  // Reset
  setCustomCountry(null);
});
