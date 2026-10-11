import express from 'express';
import authMiddleware from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { listOrders, placeOrder, updateStatus, userOrders, verifyOrder } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.get('/list', adminAuth, listOrders);
orderRouter.post('/userorders', authMiddleware, userOrders);
orderRouter.post('/place', authMiddleware, placeOrder);
orderRouter.post('/status', adminAuth, updateStatus);
orderRouter.post('/verify', authMiddleware, verifyOrder);

export default orderRouter;