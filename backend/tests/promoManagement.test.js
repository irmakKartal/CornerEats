import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizePromoCode, validatePromoInput } from '../controllers/promoController.js';

test('normalizes promo codes to uppercase without surrounding spaces', () => {
  assert.equal(normalizePromoCode(' save20 '), 'SAVE20');
  assert.equal(normalizePromoCode(''), '');
});

test('accepts valid promo values and rejects invalid percentages', () => {
  assert.deepEqual(validatePromoInput('SAVE20', 20, true), {
    code: 'SAVE20',
    discountPercent: 20,
    isActive: true,
  });
  assert.throws(() => validatePromoInput('SAVE20', 101, true), /discount percentage/i);
  assert.throws(() => validatePromoInput('', 20, true), /promo code/i);
});
