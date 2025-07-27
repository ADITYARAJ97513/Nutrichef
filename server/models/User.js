import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; 

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false, 
  },
  role: {
    type: String,
    enum: ['free_user', 'pro_user', 'admin'],
    default: 'free_user',
  },
  subscription: {
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired'],
      default: 'inactive',
    },
    plan: {
      type: String,
      enum: ['monthly', 'yearly', null],
      default: null
    },
    startDate: Date,
    expiresAt: Date,
    razorpayPaymentId: String,
    razorpayOrderId: String,
  },
  preferences: {
    dietary: {
      type: [String],
      enum: ['vegetarian', 'vegan', 'keto', 'paleo', 'diabetic', 'gluten-free', 'dairy-free', ''],
      default: [],
    },
    allergies: {
      type: [String],
      default: [],
    },
    goals: {
      type: String,
      enum: ['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain'],
      default: 'maintenance',
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

}, {
  timestamps: true,
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordResetToken = undefined;
    this.passwordResetExpires = undefined;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model('User', userSchema);