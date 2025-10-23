import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
const eventManagerSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email :{
        type : String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required :true
    },
    profilePic :{
        type : String,
        required : true
    },
    companyName :{
        type :String
    },
    phoneNumber : {
        type :String
    },
    isActive : {
        type : Boolean,
        default :true
    }
}, {
    timestamps: true,
})

eventManagerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
})

eventManagerSchema.methods.matchPassword = async function (enteredPassword) {
    const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password)
    return isPasswordCorrect;
} //created a custom function in side customer model 
const EventManager = mongoose.model('EventManager',eventManagerSchema);
export default EventManager;