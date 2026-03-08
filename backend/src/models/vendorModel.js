import mongoose from "mongoose";
import crypto from "crypto";

const vendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact_number: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    store_name: { type: String, required: true, unique: true },
    store_location: { type: String, required: true },
    description: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
},{ timestamps: true });

vendorSchema.pre('save', function(next) {
    if (this.store_name) {
        this.store_name = this.store_name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
    }
    next();
});

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