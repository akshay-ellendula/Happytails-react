import Customer from '../models/customerModel.js'
import jwt from 'jsonwebtoken';
import EventManager from '../models/eventManagerModel.js';
import Admin from '../models/adminModel.js'

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
    console.log(req)
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
        console.log(token)
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
    const { userName, email, password } = req.body;
    try {
        if (!userName || !email || !password) {
            return res.status(404).json({ "message": "all fields are requires" })
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        if (password.length < 6) {
            return res.status(403).json({ message: "Password Must have 6 characters" })
        }
        const oldEventManager = await EventManager.findOne({ email })
        if (oldEventManager) {
            return res.status(409).json({ message: "email is all ready registered" })
        }

        const randomGen = Math.floor(Math.random() * 100) + 1;
        const profilePic = `https://avatar-api-theta.vercel.app/${randomGen}.png`

        const eventManager = await EventManager.create({ userName, email, password, profilePic });

        const token = jwt.sign({ eventManagerId: eventManager._id, role: 'eventManager' }, process.env.JWT_SECRET_KEY, {
            expiresIn: '30min'
        })
        res.cookie('jwt', token, {
            maxAge: 30 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production'
        })

        res.status(201).json({ success: true })
    } catch (error) {
        console.log("something went wrong in signup controller", error)
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
