import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidPaymentSession } from '../utils/paymentValidation.js';

const order = {
  _id: 'order-1',
  userId: 'user-1',
  currency: 'TRY',
  amountInMinorUnits: 32500,
};

const session = {
  payment_status: 'paid',
  client_reference_id: 'order-1',
  currency: 'try',
  amount_total: 32500,
  metadata: { orderId: 'order-1', userId: 'user-1' },
};

test('accepts a paid Stripe session matching order, user, amount, and currency', () => {
  assert.equal(isValidPaymentSession(order, session, 'user-1'), true);
});

test('rejects a paid Stripe session with a different amount', () => {
  assert.equal(isValidPaymentSession(order, { ...session, amount_total: 1 }, 'user-1'), false);
});

test('rejects a Stripe session with a different currency or user', () => {
  assert.equal(isValidPaymentSession(order, { ...session, currency: 'usd' }, 'user-1'), false);
  assert.equal(isValidPaymentSession(order, session, 'user-2'), false);
});
