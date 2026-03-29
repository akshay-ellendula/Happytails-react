import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import crypto from "crypto";

const vendorSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    contact_number: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: function() {
            // Password is required only if not using Google login
            return !this.googleId;
        },
    },
    store_name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    store_location: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        default: '' 
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // Google Login Fields
    googleId: {
        type: String,
        sparse: true,
        unique: true,
        index: true
    },
    isGoogleLogin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Add pre-save middleware for password hashing (was missing)
vendorSchema.pre('save', async function(next) {
    // Clean store name
    if (this.store_name) {
        this.store_name = this.store_name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
    }
    
    // Hash password if modified and password exists
    if (this.isModified('password') && this.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Add matchPassword method for vendor (was missing)
vendorSchema.methods.matchPassword = async function(enteredPassword) {
    // If user is Google login only and doesn't have password, return false
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

vendorSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;