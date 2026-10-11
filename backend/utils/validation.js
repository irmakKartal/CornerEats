import mongoose from 'mongoose';

export const isValidObjectId = (value) => mongoose.isValidObjectId(value);

export const sanitizeText = (value) =>
  String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const validatePrice = (value) => {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 && price <= 100000;
};

export const validateQuantity = (value) =>
  Number.isInteger(value) && value >= 1 && value <= 99;
