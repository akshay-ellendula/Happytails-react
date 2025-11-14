import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact_number: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    store_name: { type: String, required: true, unique: true },
    store_location: { type: String, required: true },
    description: { type: String, default: '' },
    created_at: { type: Date, default: Date.now }
});

vendorSchema.pre('save', function(next) {
    if (this.store_name) {
        this.store_name = this.store_name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
    }
    next();
});

const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;