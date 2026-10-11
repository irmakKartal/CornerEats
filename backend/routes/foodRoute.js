import express from 'express';
import multer from 'multer';
import { addFood, listFood, removeFood, updateFood } from '../controllers/foodController.js';
import adminAuth from '../middleware/adminAuth.js';

const foodRouter = express.Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads',
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${safeName}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, and WebP images are supported'));
    }
    cb(null, true);
  },
});

foodRouter.get('/list', listFood);
foodRouter.post('/add', adminAuth, upload.single('image'), addFood);
foodRouter.post('/update', adminAuth, upload.single('image'), updateFood);
foodRouter.post('/remove', adminAuth, removeFood);

export default foodRouter;