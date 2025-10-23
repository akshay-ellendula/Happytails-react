import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
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
        houseNumber: {
            type: String,
        },
        streetNo: {
            type: String,
        },
        city: {
            type: String,
        },
        pincode: {
            type: String,
        }
    },
    phoneNumber: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    }
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
    const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password)
    return isPasswordCorrect;
} //created a custom function in side customer model 
const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
