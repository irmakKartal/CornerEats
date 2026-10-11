import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateOrderTotals } from '../utils/orderPricing.js';

test('calculates the displayed and Stripe totals from the server price with rate', () => {
  const items = [
    { name: 'Burger', price: 10, quantity: 2 },
    { name: 'Drink', price: 5, quantity: 1 },
  ];

  const totals = calculateOrderTotals(items, 'TRY', undefined, 0, 32.5);

  assert.equal(totals.subtotal, 812.5);
  assert.equal(totals.deliveryFee, 162.5);
  assert.equal(totals.total, 975);
  assert.equal(totals.lineItems[0].unit_amount, 32500);
  assert.equal(totals.lineItems[1].unit_amount, 16250);
});

test('calculates totals dynamically using currency service for USD and other currencies', () => {
  const items = [
    { name: 'Burger', price: 10, quantity: 2 },
  ];

  const usdTotals = calculateOrderTotals(items, 'USD');
  assert.equal(usdTotals.subtotal, 20);
  assert.equal(usdTotals.deliveryFee, 5);
  assert.equal(usdTotals.total, 25);

  const dynamicTotals = calculateOrderTotals(items, 'SAR');
  assert.ok(dynamicTotals.total > 0);
  assert.equal(dynamicTotals.currency, 'SAR');
});

test('rejects a payment amount that does not match the server calculation', () => {
  const items = [
    { price: 10, quantity: 2 },
  ];

  assert.throws(
    () => calculateOrderTotals(items, 'TRY', 300, 0, 32.5),
    /Payment amount does not match the server calculation/
  );
});

test('applies a valid percentage discount to the subtotal without changing delivery fee', () => {
  const items = [{ name: 'Burger', price: 10, quantity: 2 }];

  const totals = calculateOrderTotals(items, 'USD', 23, 10);

  assert.equal(totals.subtotal, 20);
  assert.equal(totals.discountAmount, 2);
  assert.equal(totals.deliveryFee, 5);
  assert.equal(totals.total, 23);
});

test('rejects an invalid discount percentage', () => {
  assert.throws(
    () => calculateOrderTotals([{ price: 10, quantity: 1 }], 'USD', 10, 101),
    /Invalid discount percentage/
  );
});
