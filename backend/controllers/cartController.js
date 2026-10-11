import userModel from "../models/userModel.js"
import foodModel from "../models/foodModel.js";
import { isValidObjectId, validateQuantity } from '../utils/validation.js';

// add to user cart  
const addToCart = async (req, res) => {
   try {
      const itemId = req.body.itemId;
      if (!isValidObjectId(itemId)) {
         return res.status(400).json({ success: false, message: 'Invalid food id' });
      }

      const [userData, foodExists] = await Promise.all([
         userModel.findById(req.body.userId),
         foodModel.exists({ _id: itemId }),
      ]);
      if (!userData) {
         return res.status(404).json({ success: false, message: 'User not found' });
      }
      if (!foodExists) {
         return res.status(404).json({ success: false, message: 'Food not found' });
      }

      const cartData = { ...userData.cartData };
      const quantity = (Number(cartData[itemId]) || 0) + 1;
      if (!validateQuantity(quantity)) {
         return res.status(400).json({ success: false, message: 'Maximum quantity reached' });
      }
      cartData[itemId] = quantity;
      await userModel.findByIdAndUpdate(req.body.userId, { cartData });
      res.json({ success: true, message: "Added To Cart" });
   } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Unable to update cart' });
   }
}

// remove food from user cart
const removeFromCart = async (req, res) => {
   try {
      const itemId = req.body.itemId;
      if (!isValidObjectId(itemId)) {
         return res.status(400).json({ success: false, message: 'Invalid food id' });
      }

      const userData = await userModel.findById(req.body.userId);
      if (!userData) {
         return res.status(404).json({ success: false, message: 'User not found' });
      }

      const cartData = { ...userData.cartData };
      const quantity = Number(cartData[itemId]) || 0;
      if (quantity > 1) cartData[itemId] = quantity - 1;
      else delete cartData[itemId];
      await userModel.findByIdAndUpdate(req.body.userId, { cartData });
      res.json({ success: true, message: "Removed From Cart" });
   } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Unable to update cart' });
   }

}

// get user cart
const getCart = async (req, res) => {
   try {
      const userData = await userModel.findById(req.body.userId);
      if (!userData) {
         return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, cartData: userData.cartData || {} });
   } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Unable to get cart' });
   }
}


export { addToCart, removeFromCart, getCart }