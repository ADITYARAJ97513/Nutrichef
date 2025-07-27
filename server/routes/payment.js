import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js'; 

const router = express.Router();

let razorpay;

const initializeRazorpayClient = (req, res, next) => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("FATAL ERROR: Razorpay API keys are not defined in the .env file.");
      return res.status(500).json({ message: "Payment gateway is not configured." });
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  next();
};

router.use(initializeRazorpayClient);

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const PLANS = {
  monthly: { amount: 999, currency: 'INR' },  // In paise
  yearly: { amount: 9900, currency: 'INR' }, 
};

router.post('/create-order', authenticate, asyncHandler(async (req, res) => {
  const { plan } = req.body;

  if (!PLANS[plan]) {
    return res.status(400).json({ message: 'A valid plan (monthly/yearly) is required.' });
  }

  const options = {
    amount: PLANS[plan].amount,
    currency: PLANS[plan].currency,
    receipt: `rcpt_${crypto.randomBytes(8).toString('hex')}`,
    notes: {
      userId: req.user._id.toString(),
      plan: plan,
    }
  };

  const order = await razorpay.orders.create(options);

  res.status(200).json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}));

router.post('/verify-payment', authenticate, asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: 'Invalid payment signature. Payment verification failed.' });
  }

  const user = await User.findById(req.user._id);

  if (user.subscription.razorpayOrderId === razorpay_order_id) {
    return res.status(200).json({ status: 'success', message: 'Subscription is already active.' });
  }

  const expiresAt = new Date();
  if (plan === 'monthly') {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else if (plan === 'yearly') {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  }

  user.role = 'pro_user';
  user.subscription = {
    plan: plan,
    status: 'active',
    razorpayPaymentId: razorpay_payment_id,
    razorpayOrderId: razorpay_order_id,
    startDate: new Date(),
    expiresAt: expiresAt,
  };

  await user.save();
  try {
      const amountInRupees = (PLANS[plan].amount / 100).toFixed(2);
      const receiptHTML = `
        <h1>Thank you for your purchase, ${user.name}!</h1>
        <p>Your NutriChef Pro subscription is now active.</p>
        <h2>Receipt Details:</h2>
        <ul>
            <li><strong>Plan:</strong> ${plan.charAt(0).toUpperCase() + plan.slice(1)}</li>
            <li><strong>Amount:</strong> ₹${amountInRupees}</li>
            <li><strong>Payment ID:</strong> ${razorpay_payment_id}</li>
            <li><strong>Order ID:</strong> ${razorpay_order_id}</li>
            <li><strong>Subscription valid until:</strong> ${expiresAt.toDateString()}</li>
        </ul>
        <p>Happy cooking!</p>
      `;
      await sendEmail({
          email: user.email,
          subject: 'Your NutriChef Pro Subscription Receipt',
          html: receiptHTML
      });
  } catch (emailError) {
      console.error("Payment receipt email could not be sent:", emailError);
      // Do not block the response if email fails
  }

  res.status(200).json({
    status: 'success',
    message: 'Payment verified and subscription activated successfully.',
  });
}));

router.get('/subscription', authenticate, (req, res) => {
  const { subscription } = req.user;
  if (subscription && subscription.status === 'active' && new Date(subscription.expiresAt) > new Date()) {
    res.status(200).json({ hasSubscription: true, details: subscription });
  } else {
    res.status(200).json({ hasSubscription: false, message: 'No active subscription found.' });
  }
});

export default router;