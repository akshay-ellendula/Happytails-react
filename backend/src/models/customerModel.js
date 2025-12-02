import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // Import crypto

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
        required: true,
    },
    address: {
        houseNumber: { type: String },
        streetNo: { type: String },
        city: { type: String },
        pincode: { type: String }
    },
    phoneNumber: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Add these two fields
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true,
});

customerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
})

customerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// Add this method to generate the reset token
customerSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;