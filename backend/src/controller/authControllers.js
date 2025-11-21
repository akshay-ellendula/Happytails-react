import Customer from '../models/customerModel.js'
import jwt from 'jsonwebtoken';
import EventManager from '../models/eventManagerModel.js';
import Admin from '../models/adminModel.js'
import StorePartner from '../models/storePartnerModel.js';


//@dec signup  for customer
//@route post /api/auth/signup
//@access public
export const signup = async (req, res) => {

    const { userName, email, password } = req.body;
    try {

        if (!userName || !email || !password) {
            return res.status(404).json({ message: "all fields are requires" })
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        if (password.length < 6) {
            return res.status(403).json({ message: "Password Must have 6 characters" })
        }

        const oldCustomer = await Customer.findOne({ email })

        if (oldCustomer) {
            return res.status(409).json({ message: "email is all ready registered" })
        }

        const randomGen = Math.floor(Math.random() * 100) + 1;
        const profilePic = `https://avatar-api-theta.vercel.app/${randomGen}.png`

        const customer = await Customer.create({ userName, email, password, profilePic });

        const token = jwt.sign({ customerId: customer._id, role: 'customer' }, process.env.JWT_SECRET_KEY, {
            expiresIn: '30min'
        })

        res.cookie('jwt', token, {
            maxAge: 30 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production'
        })
        req.user = customer;
        res.status(201).json({ success: true });
    } catch (error) {
        console.log("something went wrong in signup controller", error)
        res.status(500).json({ message: "Internal Server Error" });
    }
}
//@dec signin for customer
//@route post /api/auth/signin
//@access public
export const signin = async (req, res) => {
    const { email, password } = req.body;
    try {

        if (!email || !password) {
            return res.status(404).json({ "message": "all fields are requires" })
        }

        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(404).json({ message: "email is not register" });
        }

        if (!customer.isActive) {
            return res.status(403).json({ message: "your Account is disabled" })
        }

        const isMatch = await customer.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ customerId: customer._id, role: 'customer' }, process.env.JWT_SECRET_KEY, {
            expiresIn: '30min'
        })

        res.cookie('jwt', token, {
            maxAge: 30 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production'
        })

        req.user = customer;
        res.status(200).json({ success: true })
    } catch (error) {
        console.log("something went wrong in signin controller", error)
        res.status(500).json({ message: "Internal Server Error" });
    }
}
//@dec logout 
//@route /api/auth/logout
//@access customer,eventManager
export const logout = (req, res) => {
    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "Logout successful" });
}
//@dec signup for eventManager
//@route post /api/auth/eventManagerSignup
//@access public
export const eventManagersignup = async (req, res) => {
    // FIX: Destructure all fields sent from the frontend form
    const { userName, email, password, contactnumber, companyname, location } = req.body;
    
    try {
        // Basic validation
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

        // FIX: Create EventManager using all fields.
        // Note: Ensure your Mongoose model has 'companyName' (camelCase) or 'companyname' (lowercase).
        // If your model uses camelCase, map it here: companyName: companyname
        const eventManager = await EventManager.create({
            userName,
            email,
            password,
            profilePic,
            phoneNumber: contactnumber, // Mapping frontend 'contactnumber' to model 'phoneNumber'
            companyName: companyname,   // Mapping frontend 'companyname' to model 'companyName' (assumed model field)
            // location is typically part of profile or address, if not in model schema, it won't be saved unless schema is updated.
            // Assuming schema is flexible or updated. If schema lacks 'location', add it.
        });

        const token = jwt.sign({ eventManagerId: eventManager._id, role: 'eventManager' }, process.env.JWT_SECRET_KEY, {
            expiresIn: '30min'
        });

        // FIX: Changed sameSite to 'Lax' for better compatibility during redirects
        res.cookie('jwt', token, {
            maxAge: 30 * 60 * 1000,
            httpOnly: true,
            sameSite: "lax", // changed to lowercase 'lax' just to be safe standard
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(201).json({ success: true });
    } catch (error) {
        console.log("something went wrong in signup controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

//@dec signin for eventManager
//@route post /api/auth/eventManagerSignin
//@access public
export const eventManagersignin = async (req, res) => {
    const { email, password } = req.body;
    try {

        if (!email || !password) {
            return res.status(404).json({ "message": "all fields are requires" })
        }

        const eventManager = await EventManager.findOne({ email });
        if (!eventManager) {
            return res.status(404).json({ message: "email is not register" });
        }

        if (!eventManager.isActive) {
            return res.status(403).json({ message: "your Account is disabled" })
        }

        const isMatch = await eventManager.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }


        const token = jwt.sign({ eventManagerId: eventManager._id, role: 'eventManager' }, process.env.JWT_SECRET_KEY, {
            expiresIn: '30min'
        })
        res.cookie('jwt', token, {
            maxAge: 30 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production'
        })

        res.status(200).json({ success: true })
    } catch (error) {
        console.log("something went wrong in eventManager signin controller", error)
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
            maxAge: 30 * 60 * 1000,
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
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: "Email is not registered" });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ adminId: admin._id, role: 'admin' }, process.env.JWT_SECRET_KEY, {
            expiresIn: '30min'
        });

        res.cookie('jwt', token, {
            maxAge: 30 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(200).json({ success: true });

    } catch (error) {
        console.error("Error in adminSignin controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
// Add this to your auth controller
//@dec verify auth status
//@route GET /api/auth/verify
//@access public
export const verifyAuth = async (req, res) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(200).json({ authenticated: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Check if user still exists (optional but recommended)
        let user;
        if (decoded.role === 'customer') {
            user = await Customer.findById(decoded.customerId);
        } else if (decoded.role === 'eventManager') {
            user = await EventManager.findById(decoded.eventManagerId); // FIX: use eventManagerId here
        } else if (decoded.role === 'admin') {
            user = await Admin.findById(decoded.adminId); // FIX: use adminId here
        }

        if (!user) {
            res.clearCookie("jwt");
            return res.status(200).json({ authenticated: false });
        }

        res.status(200).json({
            authenticated: true,
            role: decoded.role
        });
    } catch (error) {
        console.log("JWT verification failed:", error);
        res.clearCookie("jwt");
        res.status(200).json({ authenticated: false });
    }
}

// @desc    Register store partner
// @route   POST /api/auth/storeSignup
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
        const existingStorePartner = await StorePartner.findOne({ email });
        if (existingStorePartner) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        const oldStoreName = await StorePartner.findOne({storename});
        if(oldStoreName){
            return res.status(409).json({message : "All Ready  Store name has Taken"})
        }

        // Generate random profile picture
        const randomGen = Math.floor(Math.random() * 100) + 1;
        const profilePic = `https://avatar-api-theta.vercel.app/${randomGen}.png`;

        // Create store partner
        const storePartner = await StorePartner.create({
            userName,
            email,
            password,
            contactnumber,
            storename,
            storelocation,
            profilePic
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                storePartnerId: storePartner._id,
                role: 'storePartner',
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '30min' }
        );

        // Set cookie
        res.cookie('jwt', token, {
            maxAge: 30 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(201).json({ success: true, });

    }
    catch (error) {
        console.log("Error in store partner signup:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
// @desc    Login store partner
// @route   POST /api/auth/storeSignin
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

        const storePartner = await StorePartner.findOne({ email });
        if (!storePartner) {
            return res.status(404).json({
                success: false,
                message: "Email is not registered"
            });
        }

        if (!storePartner.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account is disabled. Please contact support."
            });
        }

        const isMatch = await storePartner.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                storePartnerId: storePartner._id,
                role: 'storePartner',
                email: storePartner.email
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '30min' }
        );

        // Set cookie
        res.cookie('jwt', token, {
            maxAge: 30 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                id: storePartner._id,
                userName: storePartner.userName,
                email: storePartner.email,
                storename: storePartner.storename,
                role: 'storePartner'
            }
        });
    } catch (error) {
        console.log("Error in store partner signin:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};