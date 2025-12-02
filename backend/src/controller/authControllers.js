import Customer from '../models/customerModel.js';
import jwt from 'jsonwebtoken';
import EventManager from '../models/eventManagerModel.js';
import Admin from '../models/adminModel.js';
import Vendor from '../models/vendorModel.js'; //
import bcrypt from 'bcryptjs'; // Added for password hashing

// @desc    Signup for customer
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
    const { userName, email, password } = req.body;
    try {
        if (!userName || !email || !password) {
            return res.status(404).json({ message: "All fields are required" });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        if (password.length < 6) {
            return res.status(403).json({ message: "Password Must have 6 characters" });
        }

        const oldCustomer = await Customer.findOne({ email });

        if (oldCustomer) {
            return res.status(409).json({ message: "Email is already registered" });
        }

        const randomGen = Math.floor(Math.random() * 100) + 1;
        const profilePic = `https://avatar-api-theta.vercel.app/${randomGen}.png`;

        const customer = await Customer.create({ userName, email, password, profilePic });

        const token = jwt.sign({ customerId: customer._id, role: 'customer' }, process.env.JWT_SECRET_KEY, {
            expiresIn: '30min'
        });

        res.cookie('jwt', token, {
            maxAge: 90 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production'
        });
        
        res.status(201).json({ 
            success: true,
            user: {
                customerId: customer._id,
                email: customer.email,
                userName: customer.userName,
                profilePic: customer.profilePic,
                role: 'customer'
            }
        });
    } catch (error) {
        console.log("Something went wrong in signup controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// @desc    Signin for customer
// @route   POST /api/auth/signin
// @access  Public
export const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(404).json({ "message": "All fields are required" });
        }

        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(404).json({ message: "Email is not registered" });
        }

        if (!customer.isActive) {
            return res.status(403).json({ message: "Your Account is disabled" });
        }

        const isMatch = await customer.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ customerId: customer._id, role: 'customer' }, process.env.JWT_SECRET_KEY, {
            expiresIn: '30min'
        });

        res.cookie('jwt', token, {
            maxAge: 90 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(200).json({ 
            success: true,
            user: {
                customerId: customer._id,
                email: customer.email,
                userName: customer.userName,
                profilePic: customer.profilePic,
                role: 'customer'
            }
        });
    } catch (error) {
        console.log("Something went wrong in signin controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// @desc    Logout 
// @route   /api/auth/logout
// @access  Public
export const logout = (req, res) => {
    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "Logout successful" });
}

// @desc    Signup for eventManager
// @route   POST /api/auth/eventManagerSignup
// @access  Public
export const eventManagersignup = async (req, res) => {
    const { userName, email, password, contactnumber, companyname, location } = req.body;
    
    try {
        if (!userName || !email || !password || !contactnumber || !companyname || !location) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must have at least 6 characters" });
        }

        const oldEventManager = await EventManager.findOne({ email });
        if (oldEventManager) {
            return res.status(409).json({ message: "Email is already registered" });
        }

        const randomGen = Math.floor(Math.random() * 100) + 1;
        const profilePic = `https://avatar-api-theta.vercel.app/${randomGen}.png`;

        const eventManager = await EventManager.create({
            userName,
            email,
            password,
            profilePic,
            phoneNumber: contactnumber,
            companyName: companyname,
        });

        const token = jwt.sign({ eventManagerId: eventManager._id, role: 'eventManager' }, process.env.JWT_SECRET_KEY, {
            expiresIn: '30min'
        });

        res.cookie('jwt', token, {
            maxAge: 90 * 60 * 1000,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(201).json({ success: true });
    } catch (error) {
        console.log("Something went wrong in signup controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// @desc    Signin for eventManager
// @route   POST /api/auth/eventManagerSignin
// @access  Public
export const eventManagersignin = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(404).json({ "message": "All fields are required" });
        }

        const eventManager = await EventManager.findOne({ email });
        if (!eventManager) {
            return res.status(404).json({ message: "Email is not registered" });
        }

        if (!eventManager.isActive) {
            return res.status(403).json({ message: "Your Account is disabled" });
        }

        const isMatch = await eventManager.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ eventManagerId: eventManager._id, role: 'eventManager' }, process.env.JWT_SECRET_KEY, {
            expiresIn: '30min'
        });
        res.cookie('jwt', token, {
            maxAge: 90 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(200).json({ 
            success: true,
            user: {
                eventManagerId: eventManager._id,
                email: eventManager.email,
                userName: eventManager.userName,
                profilePic: eventManager.profilePic,
                role: 'eventManager'
            }
        });
    } catch (error) {
        console.log("Something went wrong in eventManager signin controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// @desc    Signup for admin
// @route   POST /api/auth/adminSignup
// @access  Public
export const adminSignup = async (req, res) => {
    const { userName, email, password } = req.body;

    try {
        if (!userName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(409).json({ message: "Email is already registered" });
        }

        const admin = await Admin.create({ userName, email, password });

        const token = jwt.sign({ adminId: admin._id, role: 'admin' }, process.env.JWT_SECRET_KEY, {
            expiresIn: '30min'
        });

        res.cookie('jwt', token, {
            maxAge: 90 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(201).json({ success: true });

    } catch (error) {
        console.error("Error in adminSignup controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// @desc    Signin for admin
// @route   POST /api/auth/adminSignin
// @access  Public
export const adminSignin = async (req, res) => {
     const { admin_email, admin_password } = req.body;
    const admin = { email: "admin@gmail.com", password: "admin123#" };

    if (admin_email === admin.email && admin_password === admin.password) {
        const token = generateToken({
            email: admin_email,
            role: 'admin',
            id: 'admin'
        });

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "none",
            secure: true,

            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({ success: true, token });
    } else {
        res.json({ success: false, error: "Invalid email or password" });
    }
};

// @desc    Verify auth status
// @route   GET /api/auth/verify
// @access  Public
export const verifyAuth = async (req, res) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(200).json({ authenticated: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        let user;
        let userData = { role: decoded.role };

        if (decoded.role === 'customer') {
            user = await Customer.findById(decoded.customerId).select('-password');
            if (user) {
                userData.customerId = user._id;
                userData.email = user.email;
                userData.userName = user.userName;
                userData.profilePic = user.profilePic;
                userData.phoneNumber = user.phoneNumber; 
                userData.address = user.address;       
            }
        } else if (decoded.role === 'eventManager') {
            user = await EventManager.findById(decoded.eventManagerId);
        } else if (decoded.role === 'admin') {
            user = await Admin.findById(decoded.adminId);
        } else if (decoded.role === 'vendor') { // UPDATED: Check for vendor
            user = await Vendor.findById(decoded.vendorId);
            if (user) {
                userData.vendorId = user._id;
                userData.email = user.email;
                userData.userName = user.name; // Map 'name' to 'userName' for consistency if needed
                userData.storename = user.store_name;
            }
        }

        if (!user) {
            res.clearCookie("jwt");
            return res.status(200).json({ authenticated: false });
        }

        res.status(200).json({
            authenticated: true,
            user: userData
        });
    } catch (error) {
        console.log("JWT verification failed:", error);
        res.clearCookie("jwt");
        res.status(200).json({ authenticated: false });
    }
}

// @desc    Register vendor (formerly store partner)
// @route   POST /api/auth/vendorSignup
// @access  Public
export const storePartnerSignup = async (req, res) => {
    const { userName, email, password, contactnumber, storename, storelocation } = req.body;
    try {
        // Validation
        if (!userName || !email || !password || !contactnumber || !storename || !storelocation) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if email already exists
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        // Check if store name already exists
        const existingStore = await Vendor.findOne({ store_name: storename });
        if (existingStore) {
            return res.status(409).json({ message: "Store name is already taken" });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create vendor
        const vendor = await Vendor.create({
            name: userName, // Map userName to name
            email,
            password: hashedPassword,
            contact_number: contactnumber, // Map contactnumber to contact_number
            store_name: storename, // Map storename to store_name
            store_location: storelocation, // Map storelocation to store_location
            description: ""
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                vendorId: vendor._id,
                role: 'vendor', // Changed role to 'vendor'
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '30min' }
        );

        // Set cookie
        res.cookie('jwt', token, {
            maxAge: 90 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(201).json({ 
            success: true,
            user: {
                vendorId: vendor._id,
                email: vendor.email,
                userName: vendor.name,
                storename: vendor.store_name,
                role: 'vendor'
            }
        });

    }
    catch (error) {
        console.log("Error in vendor signup:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// @desc    Login vendor (formerly store partner)
// @route   POST /api/auth/vendorSignin
// @access  Public
export const storePartnerSignin = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const vendor = await Vendor.findOne({ email });
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Email is not registered"
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, vendor.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                vendorId: vendor._id,
                role: 'vendor',
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '30min' }
        );

        // Set cookie
        res.cookie('jwt', token, {
            maxAge: 90 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                vendorId: vendor._id,
                userName: vendor.name,
                email: vendor.email,
                storename: vendor.store_name,
                role: 'vendor'
            }
        });
    } catch (error) {
        console.log("Error in vendor signin:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
// ... existing imports
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

// ... existing signup/signin code ...

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await Customer.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Email could not be sent" });
        }

        // Get Reset Token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create Reset URL
        // NOTE: Ensure this matches your Frontend Route
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        const message = `
            <h1>You have requested a password reset</h1>
            <p>Please go to this link to reset your password:</p>
            <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: "Password Reset Request",
                message,
            });

            res.status(200).json({ success: true, data: "Email sent" });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            console.log(error)
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: "Email could not be sent" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resetToken
// @access  Public
export const resetPassword = async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.resetToken)
        .digest("hex");

    try {
        const user = await Customer.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid Token" });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(201).json({
            success: true,
            data: "Password Reset Success",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};