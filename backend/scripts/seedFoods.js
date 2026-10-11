import 'dotenv/config';
import mongoose from 'mongoose';
import foodModel from '../models/foodModel.js';

const foodData = [
  ['Greek salad', 12, 'Salad'],
  ['Veg salad', 18, 'Salad'],
  ['Clover Salad', 16, 'Salad'],
  ['Chicken Salad', 24, 'Salad'],
  ['Lasagna Rolls', 14, 'Rolls'],
  ['Peri Peri Rolls', 12, 'Rolls'],
  ['Chicken Rolls', 20, 'Rolls'],
  ['Veg Rolls', 15, 'Rolls'],
  ['Ripple Ice Cream', 14, 'Deserts'],
  ['Fruit Ice Cream', 22, 'Deserts'],
  ['Jar Ice Cream', 10, 'Deserts'],
  ['Vanilla Ice Cream', 12, 'Deserts'],
  ['Chicken Sandwich', 12, 'Sandwich'],
  ['Vegan Sandwich', 18, 'Sandwich'],
  ['Grilled Sandwich', 16, 'Sandwich'],
  ['Bread Sandwich', 24, 'Sandwich'],
  ['Cup Cake', 14, 'Cake'],
  ['Vegan Cake', 12, 'Cake'],
  ['Butterscotch Cake', 20, 'Cake'],
  ['Sliced Cake', 15, 'Cake'],
  ['Garlic Mushroom', 14, 'Pure Veg'],
  ['Fried Cauliflower', 22, 'Pure Veg'],
  ['Mix Veg Pulao', 10, 'Pure Veg'],
  ['Rice Zucchini', 12, 'Pure Veg'],
  ['Cheese Pasta', 12, 'Pasta'],
  ['Tomato Pasta', 18, 'Pasta'],
  ['Creamy Pasta', 16, 'Pasta'],
  ['Chicken Pasta', 24, 'Pasta'],
  ['Butter Noodles', 14, 'Noodles'],
  ['Veg Noodles', 12, 'Noodles'],
  ['Somen Noodles', 20, 'Noodles'],
  ['Cooked Noodles', 15, 'Noodles'],
];

const seedFoods = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const existingCount = await foodModel.countDocuments();
  if (existingCount > 0) {
    console.log(`Seed skipped: ${existingCount} food items already exist`);
    return;
  }

  const foods = foodData.map(([name, price, category], index) => ({
    name,
    description: `${name} prepared fresh with quality ingredients.`,
    price,
    category,
    image: `food_${index + 1}.png`,
  }));

  await foodModel.insertMany(foods);
  console.log(`Seeded ${foods.length} food items`);
};

try {
  await seedFoods();
} catch (error) {
  console.error('Food seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
