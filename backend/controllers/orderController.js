import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import Stripe from "stripe";
import { calculateOrderTotals } from '../utils/orderPricing.js';
import { isValidPaymentSession } from '../utils/paymentValidation.js';
import { isValidObjectId, sanitizeText, validatePrice, validateQuantity } from '../utils/validation.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedStatuses = new Set(['Pending', 'Food Processing', 'Out for delivery', 'Delivered']);

// Placing User Order for Frontend
const placeOrder = async (req, res) => {
    let createdOrderId;

    try {
        const items = Array.isArray(req.body.items) ? req.body.items : [];
        const amount = Number(req.body.amount);
        const currency = req.body.currency ? String(req.body.currency).trim().toUpperCase() : 'USD';
        const address = req.body.address;
        const discountPercent = Number(req.body.discountPercent || 0);

        if (!items.length || !address || !validatePrice(amount) || items.some((item) => !item?._id || !validateQuantity(item?.quantity))) {
            return res.status(400).json({ success: false, message: 'Invalid order data' });
        }

        const productIds = [...new Set(items.map((item) => item._id))];
        const products = await foodModel.find({ _id: { $in: productIds } }).lean();
        const productMap = new Map(products.map((product) => [String(product._id), product]));

        const orderItems = items.map((item) => {
            const product = productMap.get(String(item._id));
            if (!product || !validatePrice(product.price)) {
                throw new Error('Product not available');
            }
            return {
                ...product,
                quantity: Number(item.quantity),
                price: product.price,
            };
        });

        const totals = calculateOrderTotals(orderItems, currency, amount, discountPercent);
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: orderItems,
            amount: totals.total,
            currency,
            amountInMinorUnits: Math.round(totals.total * 100),
            discountPercent,
            date: new Date(),
            address: {
                firstName: sanitizeText(address.firstName),
                lastName: sanitizeText(address.lastName),
                email: sanitizeText(address.email).toLowerCase(),
                street: sanitizeText(address.street),
                city: sanitizeText(address.city),
                state: sanitizeText(address.state),
                zipcode: sanitizeText(address.zipcode),
                country: sanitizeText(address.country),
                phone: sanitizeText(address.phone),
            },
        });

        await newOrder.save();
        createdOrderId = newOrder._id;
        await userModel.findByIdAndUpdate(req.body.userId, { deliveryAddress: newOrder.address });

        const lineItems = totals.lineItems.map((item) => ({
            price_data: {
                currency: currency.toLowerCase(),
                product_data: { name: String(item.name).slice(0, 250) },
                unit_amount: item.unit_amount,
            },
            quantity: item.quantity,
        }));

        let discounts;
        if (totals.discountAmount > 0) {
            const coupon = await stripe.coupons.create({
                amount_off: Math.round(totals.discountAmount * 100),
                currency: currency.toLowerCase(),
                duration: 'once',
                name: `Order discount ${discountPercent}%`,
            });
            discounts = [{ coupon: coupon.id }];
        }

        lineItems.push({
            price_data: {
                currency: currency.toLowerCase(),
                product_data: { name: 'Delivery Charge' },
                unit_amount: Math.round(totals.deliveryFee * 100),
            },
            quantity: 1,
        });

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            client_reference_id: String(newOrder._id),
            success_url: `${frontendUrl}/verify?orderId=${newOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/verify?orderId=${newOrder._id}&cancel=true`,
            line_items: lineItems,
            ...(discounts ? { discounts } : {}),
            metadata: { orderId: String(newOrder._id), userId: String(req.body.userId) },
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.error(error);
        if (createdOrderId) {
            await orderModel.findByIdAndDelete(createdOrderId).catch((cleanupError) => {
                console.error('Unable to remove failed payment order:', cleanupError);
            });
        }
        res.status(500).json({ success: false, message: 'Unable to create payment session' });
    }
}

// Listing Order for Admin panel
const listOrders = async (_req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ date: -1, _id: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Unable to list orders' });
    }
}

// User Orders for Frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId, payment: true }).sort({ date: -1, _id: -1 });
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const updateStatus = async (req, res) => {
    const orderId = req.body.orderId;
    const status = sanitizeText(req.body.status);

    if (!isValidObjectId(orderId) || !allowedStatuses.has(status)) {
        return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    try {
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (!order.payment) {
            return res.status(400).json({ success: false, message: 'Cannot update status for unpaid order' });
        }
        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: 'Status Updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Unable to update status' });
    }
}

const verifyOrder = async (req, res) => {
    const orderId = req.body.orderId;
    const sessionId = req.body.sessionId;

    if (!isValidObjectId(orderId) || !sessionId) {
        return res.status(400).json({ success: false, message: 'Invalid payment verification request' });
    }

    try {
        const order = await orderModel.findOne({ _id: orderId, userId: req.body.userId });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.payment) {
            return res.json({ success: true, message: 'Paid' });
        }

        let session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['payment_intent.payment_method'] });

        // If mobile wallet / Apple Pay payment is still finalizing, retry once after short pause
        const isPaidImmediately =
            session?.payment_status === 'paid' ||
            session?.status === 'complete' ||
            session?.payment_intent?.status === 'succeeded';

        if (!isPaidImmediately) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['payment_intent.payment_method'] });
        }

        if (!isValidPaymentSession(order, session, req.body.userId)) {
            console.error('Payment verification failed:', {
                orderId,
                userId: req.body.userId,
                session_payment_status: session?.payment_status,
                session_status: session?.status,
                payment_intent_status: session?.payment_intent?.status,
                session_currency: session?.currency,
                order_currency: order.currency,
                session_amount_total: session?.amount_total,
                order_amountInMinorUnits: order.amountInMinorUnits,
            });
            return res.status(400).json({ success: false, message: 'Payment not confirmed' });
        }

        await orderModel.findByIdAndUpdate(orderId, { payment: true, sessionId });
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} }).catch((error) => {
            console.error('Unable to clear cart after payment:', error);
        });
        res.json({ success: true, message: 'Paid' });
    } catch (error) {
        console.error('Payment verification exception:', error);
        res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
}

export { placeOrder, listOrders, userOrders, updateStatus, verifyOrder }
