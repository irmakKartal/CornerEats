import fs from 'fs';
import path from 'node:path';
import foodModel from "../models/foodModel.js";
import { validateImageBuffer } from '../utils/imageValidation.js';
import { isValidObjectId, sanitizeText, validatePrice } from '../utils/validation.js';

const toImageFilename = (name, originalName) => {
    const base = sanitizeText(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'food';
    const extension = path.extname(originalName || '').toLowerCase();
    return `${base}-${Date.now()}${extension}`;
};

const listFood = async (_req, res) => {
    try {
        const foods = await foodModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: foods });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Unable to list food' });
    }
};

const addFood = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Image is required' });
    }

    const name = sanitizeText(req.body.name).slice(0, 100);
    const description = sanitizeText(req.body.description).slice(0, 500);
    const category = sanitizeText(req.body.category).slice(0, 50);
    const price = Number(req.body.price);

    if (!name || !description || !category || !validatePrice(price)) {
        return res.status(400).json({ success: false, message: 'Invalid food details' });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    if (!validateImageBuffer(imageBuffer, req.file.mimetype)) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({ success: false, message: 'File is not a valid JPEG, PNG, or WebP image' });
    }

    const imageFilename = toImageFilename(name, req.file.originalname);
    const imageFilePath = path.resolve('uploads', imageFilename);

    try {
        fs.renameSync(req.file.path, imageFilePath);
        const food = new foodModel({
            name,
            description,
            price,
            category,
            image: imageFilename,
        });

        await food.save();
        res.json({ success: true, message: 'Food Added' });
    } catch (error) {
        console.error(error);
        fs.unlink(req.file.path, () => {});
        res.status(500).json({ success: false, message: 'Unable to add food' });
    }
};

const updateFood = async (req, res) => {
    const { id, name, description, price, category } = req.body;

    if (!isValidObjectId(id)) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(400).json({ success: false, message: 'Invalid food id' });
    }

    const safeName = sanitizeText(name).slice(0, 100);
    const safeDescription = sanitizeText(description).slice(0, 500);
    const safeCategory = sanitizeText(category).slice(0, 50);
    const safePrice = Number(price);

    if (!safeName || !safeDescription || !safeCategory || !validatePrice(safePrice)) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(400).json({ success: false, message: 'Invalid food details' });
    }

    let uploadedImagePath;
    let oldImageFilename;

    try {
        const food = await foodModel.findById(id);

        if (!food) {
            if (req.file) fs.unlink(req.file.path, () => {});
            return res.status(404).json({ success: false, message: 'Food not found' });
        }

        let newImagePath;
        if (req.file) {
            const imageBuffer = fs.readFileSync(req.file.path);
            if (!validateImageBuffer(imageBuffer, req.file.mimetype)) {
                fs.unlink(req.file.path, () => {});
                return res.status(400).json({ success: false, message: 'File is not a valid JPEG, PNG, or WebP image' });
            }

            const imageFilename = toImageFilename(safeName, req.file.originalname);
            newImagePath = path.resolve('uploads', imageFilename);
            uploadedImagePath = newImagePath;
            oldImageFilename = food.image;
            fs.renameSync(req.file.path, newImagePath);
            food.image = imageFilename;
        }

        food.name = safeName;
        food.description = safeDescription;
        food.price = safePrice;
        food.category = safeCategory;
        await food.save();

        if (newImagePath && oldImageFilename) {
            fs.unlink(path.resolve('uploads', oldImageFilename), () => {});
        }

        res.json({ success: true, message: 'Food Updated', data: food });
    } catch (error) {
        console.error(error);
        if (req.file) fs.unlink(req.file.path, () => {});
        if (uploadedImagePath) fs.unlink(uploadedImagePath, () => {});
        res.status(500).json({ success: false, message: 'Unable to update food' });
    }
};

const removeFood = async (req, res) => {
    const foodId = req.body.id;
    if (!isValidObjectId(foodId)) {
        return res.status(400).json({ success: false, message: 'Invalid food id' });
    }

    try {
        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ success: false, message: 'Food not found' });
        }

        const filePath = path.resolve('uploads', food.image);
        fs.unlink(filePath, () => {});

        await foodModel.findByIdAndDelete(foodId);
        res.json({ success: true, message: 'Food Removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Unable to remove food' });
    }
};

export { listFood, addFood, updateFood, removeFood, toImageFilename };