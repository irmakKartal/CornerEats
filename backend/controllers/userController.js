import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import { sanitizeText } from '../utils/validation.js';

const createToken = (id, role = 'user') => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '8h' });
};

const adminLogin = async (req, res) => {
    const email = sanitizeText(req.body.email).toLowerCase();
    const password = String(req.body.password ?? '');

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const configuredEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const configuredPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!configuredEmail || !configuredPasswordHash) {
        return res.status(503).json({ success: false, message: 'Admin login is not configured' });
    }

    if (email !== configuredEmail) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    try {
        const isMatch = await bcrypt.compare(password, configuredPasswordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        res.json({ success: true, token: createToken('admin', 'admin') });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Unable to validate admin credentials' });
    }
};

//login user
const loginUser = async (req,res) => {
    const email = sanitizeText(req.body.email).toLowerCase();
    const password = String(req.body.password ?? '');

    try{
        const user = await userModel.findOne({email})

        if(!user){
            return res.status(401).json({success:false,message: "Invalid credentials"})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.status(401).json({success:false,message: "Invalid credentials"})
        }

        const token = createToken(user._id)
        res.json({success:true,token})
    } catch (error) {
        console.error(error);
        res.status(500).json({success:false,message:"Unable to log in"})
    }
}

//register user
const registerUser = async (req,res) => {
    const name = sanitizeText(req.body.name).slice(0, 80);
    const email = sanitizeText(req.body.email).toLowerCase();
    const password = String(req.body.password ?? '');

    try{
        const exists = await userModel.findOne({email})
        if(exists){
            return res.status(409).json({success:false,message: "User already exists"})
        }

        if(!validator.isEmail(email) || !/[A-Za-z]/.test(name)){
            return res.status(400).json({success:false,message: "Please enter valid name and email"})
        }
        if(password.length < 8 || password.length > 128){
            return res.status(400).json({success:false,message: "Please enter a strong password"})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({name, email, password: hashedPassword})
        const user = await newUser.save()
        const token = createToken(user._id)
        res.status(201).json({success:true,token})

    } catch(error){
        console.error(error);
        res.status(500).json({success:false,message:"Unable to create account"})
    }
}

const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select('deliveryAddress');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: { deliveryAddress: user.deliveryAddress || {} } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Unable to load saved delivery information' });
    }
};

const listUsers = async (req, res) => {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const search = sanitizeText(req.query.search).slice(0, 100);
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filter = escapedSearch
        ? { $or: [
            { name: { $regex: escapedSearch, $options: 'i' } },
            { email: { $regex: escapedSearch, $options: 'i' } },
        ] }
        : {};

    try {
        const [users, total] = await Promise.all([
            userModel.find(filter)
                .select('_id name email deliveryAddress createdAt')
                .sort({ createdAt: -1, _id: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            userModel.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: users,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Unable to list accounts' });
    }
};

export { getUserProfile, listUsers, loginUser, registerUser, adminLogin }