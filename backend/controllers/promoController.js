import promoCodeModel from '../models/promoCodeModel.js';
import promoSettingsModel from '../models/promoSettingsModel.js';

const normalizePromoCode = (code) => String(code || '').trim().toUpperCase();

const validatePromoInput = (code, discountPercent, isActive) => {
  const normalizedCode = normalizePromoCode(code);
  const percent = Number(discountPercent);

  if (!normalizedCode) {
    throw new Error('Promo code is required');
  }

  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new Error('Discount percentage must be between 0 and 100');
  }

  return {
    code: normalizedCode,
    discountPercent: percent,
    isActive: Boolean(isActive),
  };
};

const validateDiscountPercent = (value) => {
  const percent = Number(value);
  return Number.isFinite(percent) && percent >= 0 && percent <= 100;
};

const getPromoCodes = async (_req, res) => {
  try {
    const legacySettings = await promoSettingsModel.findById('promo');
    const codes = await promoCodeModel.find().sort({ updatedAt: -1 });

    if (legacySettings && !codes.some((code) => code.code === legacySettings.code)) {
      const legacyPromo = {
        code: legacySettings.code,
        discountPercent: legacySettings.discountPercent,
        isActive: legacySettings.isActive,
        description: 'Migrated from legacy settings',
      };

      const migratedPromo = await promoCodeModel.findOneAndUpdate(
        { code: legacyPromo.code },
        { $setOnInsert: legacyPromo },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      codes.push(migratedPromo);
    }

    res.json({ success: true, data: codes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to load promo codes' });
  }
};

const createPromoCode = async (req, res) => {
  try {
    const promo = validatePromoInput(req.body.code, req.body.discountPercent, req.body.isActive);
    const created = await promoCodeModel.create(promo);

    res.status(201).json({ success: true, message: 'Promo code created', data: created });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'This promo code already exists' });
    }

    res.status(400).json({ success: false, message: error.message || 'Unable to create promo code' });
  }
};

const updatePromoCode = async (req, res) => {
  try {
    const promo = validatePromoInput(req.body.code, req.body.discountPercent, req.body.isActive);
    const updated = await promoCodeModel.findByIdAndUpdate(req.params.id, {
      ...promo,
      updatedAt: new Date(),
    }, { new: true, runValidators: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Promo code not found' });
    }

    res.json({ success: true, message: 'Promo code updated', data: updated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'This promo code already exists' });
    }

    res.status(400).json({ success: false, message: error.message || 'Unable to update promo code' });
  }
};

const deletePromoCode = async (req, res) => {
  try {
    const deleted = await promoCodeModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Promo code not found' });
    }

    res.json({ success: true, message: 'Promo code deleted', data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to delete promo code' });
  }
};

const getPromoSettings = async (_req, res) => {
  try {
    const settings = await promoSettingsModel.findById('promo');
    const safeSettings = settings || { _id: 'promo', code: 'SAVE10', discountPercent: 10, isActive: true };
    res.json({ success: true, data: safeSettings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to load promo settings' });
  }
};

const updatePromoSettings = async (req, res) => {
  const code = normalizePromoCode(req.body.code);
  const discountPercent = Number(req.body.discountPercent);

  if (!code || !validateDiscountPercent(discountPercent)) {
    return res.status(400).json({ success: false, message: 'Invalid promo code or discount percentage' });
  }

  try {
    const settings = await promoSettingsModel.findByIdAndUpdate(
      'promo',
      {
        code,
        discountPercent,
        isActive: Boolean(req.body.isActive),
        updatedAt: new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: 'Promo settings updated', data: settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to update promo settings' });
  }
};

const validatePromoCode = async (req, res) => {
  const submittedCode = normalizePromoCode(req.body.code);
  const settings = await promoCodeModel.findOne({ code: submittedCode, isActive: true });

  if (!settings) {
    const legacySettings = await promoSettingsModel.findById('promo');
    if (legacySettings && legacySettings.isActive && normalizePromoCode(legacySettings.code) === submittedCode) {
      return res.json({
        success: true,
        message: 'Promo code applied',
        data: {
          code: legacySettings.code,
          discountPercent: legacySettings.discountPercent,
        },
      });
    }
  }

  if (!settings) {
    return res.status(400).json({ success: false, message: 'Invalid or inactive promo code' });
  }

  res.json({
    success: true,
    message: 'Promo code applied',
    data: {
      code: settings.code,
      discountPercent: settings.discountPercent,
    },
  });
};

export {
  createPromoCode,
  deletePromoCode,
  getPromoCodes,
  getPromoSettings,
  normalizePromoCode,
  updatePromoCode,
  updatePromoSettings,
  validatePromoCode,
  validatePromoInput,
};
