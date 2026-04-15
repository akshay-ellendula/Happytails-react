import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const customerSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    profilePic: {
        type: String,
    },
    password: {
        type: String,
        required: function() {
            // Password is required only if not using Google login
            return !this.googleId;
        },
    },
    addresses: [{
        name: { type: String, default: "" },
        houseNumber: { type: String },
        streetNo: { type: String },
        city: { type: String },
        pincode: { type: String },
        isDefault: { type: Boolean, default: false }
    }],
    phoneNumber: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    resetPasswordToken: {
        type: String,
        index: true
    },
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
}, {
    timestamps: true,
});

customerSchema.pre("save", async function (next) {
    // Only hash password if it's modified and password exists
    if (this.isModified("password") && this.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
})

customerSchema.methods.matchPassword = async function (enteredPassword) {
    // If user is Google login only and doesn't have password, return false
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
}

customerSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;