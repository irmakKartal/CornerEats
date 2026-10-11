import express from 'express';
import { getUserProfile, listUsers, loginUser, registerUser, adminLogin } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin-login', adminLogin);
userRouter.get('/profile', authMiddleware, getUserProfile);
userRouter.get('/admin/list', adminAuth, listUsers);

export default userRouter;