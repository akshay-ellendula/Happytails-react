import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import crypto from "crypto";

const eventManagerSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function() {
            // Password is required only if not using Google login
            return !this.googleId;
        },
    },
    profilePic: {
        type: String,
        required: true
    },
    companyName: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
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
}, {
    timestamps: true,
})

eventManagerSchema.pre("save", async function (next) {
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

eventManagerSchema.methods.matchPassword = async function (enteredPassword) {
    // If user is Google login only and doesn't have password, return false
    if (!this.password) return false;
    const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password);
    return isPasswordCorrect;
}

eventManagerSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

const EventManager = mongoose.model('EventManager', eventManagerSchema);
export default EventManager;