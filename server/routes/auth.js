import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables.');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password.' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const user = new User({ name, email, password });
  await user.save();

  try {
    const welcomeHTML = `<h1>Welcome to NutriChef, ${user.name}!</h1><p>We're thrilled to have you on board. Start planning your meals and managing your pantry today!</p>`;
    await sendEmail({
      email: user.email,
      subject: 'Welcome to NutriChef!',
      html: welcomeHTML,
    });
  } catch (emailError) {
    console.error("Welcome email could not be sent:", emailError);
  }

  const token = generateToken(user._id);

  res.status(201).json({
    message: 'User registered successfully.',
    token,
    user,
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: 'Your account has been deactivated.' });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  res.status(200).json({
    message: 'Login successful.',
    token,
    user,
  });
}));

router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const message = `<h1>Forgot your password?</h1><p>Submit a PUT request with your new password to: ${resetURL}</p><p>If you didn't forget your password, please ignore this email.</p>`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your NutriChef Password Reset Token (valid for 10 min)',
      html: message,
    });
    res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ message: 'There was an error sending the email. Please try again later.' });
  }
}));

router.put('/reset-password/:token', asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash('sha265')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Token is invalid or has expired.' });
  }

  user.password = req.body.password;
  await user.save();

  const token = generateToken(user._id);
  res.status(200).json({ message: 'Password reset successfully.', token, user });
}));

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
}));

router.put('/profile', authenticate, asyncHandler(async (req, res) => {
  const { name, preferences } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (preferences) user.preferences = { ...user.preferences, ...preferences };
  const updatedUser = await user.save();
  res.status(200).json({
    message: 'Profile updated successfully.',
    user: updatedUser,
  });
}));

router.put('/change-password', authenticate, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required.' });
  }
  const user = await User.findById(req.user._id).select('+password');
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'The current password you entered is incorrect.' });
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({ message: 'Password changed successfully.' });
}));

export default router;
