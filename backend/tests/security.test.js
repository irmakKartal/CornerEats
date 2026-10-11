import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidObjectId, sanitizeText, validatePrice, validateQuantity } from '../utils/validation.js';

test('rejects invalid MongoDB IDs', () => {
  assert.equal(isValidObjectId('not-an-id'), false);
  assert.equal(isValidObjectId('507f1f77bcf86cd799439011'), true);
});

test('removes control characters from text inputs', () => {
  assert.equal(sanitizeText('  Bad\nValue\t'), 'Bad Value');
  assert.equal(sanitizeText('normal'), 'normal');
});

test('rejects invalid prices', () => {
  assert.equal(validatePrice('0'), false);
  assert.equal(validatePrice(25), true);
  assert.equal(validatePrice('25.50'), true);
});

test('accepts bounded integer quantities and rejects invalid or excessive quantities', () => {
  assert.equal(validateQuantity(1), true);
  assert.equal(validateQuantity(99), true);
  assert.equal(validateQuantity(0), false);
  assert.equal(validateQuantity(100), false);
  assert.equal(validateQuantity(1.5), false);
  assert.equal(validateQuantity('2'), false);
});
