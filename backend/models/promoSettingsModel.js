import mongoose from 'mongoose';

const promoSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: 'promo' },
  code: { type: String, required: true, trim: true, uppercase: true, default: 'SAVE10' },
  discountPercent: { type: Number, required: true, min: 0, max: 100, default: 10 },
  isActive: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
});

const promoSettingsModel = mongoose.models.promoSettings || mongoose.model('promoSettings', promoSettingsSchema);

export default promoSettingsModel;
