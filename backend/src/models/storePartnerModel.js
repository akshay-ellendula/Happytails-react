// models/storePartnerModel.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const storePartnerSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  contactnumber: {
    type: String,
    required: true
  },
  storename: {
    type: String,
    required: true
  },
  storelocation: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  storeDescription: {
    type: String,
  },
}, {
  timestamps: true
});

// Hash password before saving
storePartnerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

storePartnerSchema.methods.matchPassword = async function (enteredPassword) {
    const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password)
    return isPasswordCorrect;
}
const StorePartner = mongoose.model('StorePartner', storePartnerSchema);
export default StorePartner;