import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { validateImageBuffer } from '../utils/imageValidation.js';
import { toImageFilename } from '../controllers/foodController.js';

const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
const webp = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
const fake = Buffer.from('not-an-image');

test('accepts supported image signatures', () => {
  assert.equal(validateImageBuffer(png, 'image/png'), true);
  assert.equal(validateImageBuffer(jpeg, 'image/jpeg'), true);
  assert.equal(validateImageBuffer(webp, 'image/webp'), true);
});

test('rejects mismatched or invalid content', () => {
  assert.equal(validateImageBuffer(fake, 'image/png'), false);
  assert.equal(validateImageBuffer(png, 'image/jpeg'), false);
});

test('creates a product-based filename with the original extension', () => {
  const filename = toImageFilename('Burger Deluxe', 'burger.png');
  assert.match(filename, /^burger-deluxe-\d+\.png$/);
  assert.equal(path.extname(filename), '.png');
});
