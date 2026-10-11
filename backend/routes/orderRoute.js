import express from 'express';
import authMiddleware from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import {
  archiveOrder,
  deleteOrder,
  listOrders,
  permanentDeleteOrder,
  placeOrder,
  restoreOrder,
  stripeWebhook,
  unarchiveOrder,
  updateStatus,
  userOrders,
  verifyOrder,
} from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post('/webhook', stripeWebhook);
orderRouter.get('/list', adminAuth, listOrders);
orderRouter.post('/userorders', authMiddleware, userOrders);
orderRouter.post('/place', authMiddleware, placeOrder);
orderRouter.post('/status', adminAuth, updateStatus);
orderRouter.post('/verify', authMiddleware, verifyOrder);
orderRouter.post('/archive/:id', adminAuth, archiveOrder);
orderRouter.post('/unarchive/:id', adminAuth, unarchiveOrder);
orderRouter.post('/restore/:id', adminAuth, restoreOrder);
orderRouter.delete('/permanent/:id', adminAuth, permanentDeleteOrder);
orderRouter.delete('/:id', adminAuth, deleteOrder);

export default orderRouter;