import express from 'express';
import {
	createPromoCode,
	deletePromoCode,
	getPromoCodes,
	getPromoSettings,
	updatePromoCode,
	updatePromoSettings,
	validatePromoCode,
} from '../controllers/promoController.js';
import adminAuth from '../middleware/adminAuth.js';

const promoRouter = express.Router();

promoRouter.get('/codes', adminAuth, getPromoCodes);
promoRouter.post('/codes', adminAuth, createPromoCode);
promoRouter.put('/codes/:id', adminAuth, updatePromoCode);
promoRouter.delete('/codes/:id', adminAuth, deletePromoCode);
promoRouter.get('/settings', getPromoSettings);
promoRouter.post('/validate', validatePromoCode);
promoRouter.post('/settings', adminAuth, updatePromoSettings);

export default promoRouter;
