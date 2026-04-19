import Customer from "../models/customerModel.js";
import jwt from "jsonwebtoken";
import EventManager from "../models/eventManagerModel.js";
import Admin from "../models/adminModel.js";
import Vendor from "../models/vendorModel.js"; //
import bcrypt from "bcryptjs";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import passport from "passport";

// @desc    Signup for customer
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res, next) => {
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
      return res
        .status(403)
        .json({ message: "Password Must have 6 characters" });
    }

    const oldCustomer = await Customer.findOne({ email });

    if (oldCustomer) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const randomGen = Math.floor(Math.random() * 100) + 1;
    const profilePic = `https://avatar-api-theta.vercel.app/${randomGen}.png`;

    const customer = await Customer.create({
      userName,
      email,
      password,
      profilePic,
    });

    const token = jwt.sign(
      { customerId: customer._id, role: "customer" },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "30min",
      },
    );

    res.cookie("jwt", token, {
      maxAge: 90 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({
      success: true,
      user: {
        customerId: customer._id,
        email: customer.email,
        userName: customer.userName,
        profilePic: customer.profilePic,
        role: "customer",
      },
    });
  } catch (error) {
    console.log("Something went wrong in signup controller", error);
    next(error); // Pass error to error handling middleware
  }
};

// @desc    Signin for customer
// @route   POST /api/auth/signin
// @access  Public
export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(404).json({ message: "All fields are required" });
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
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { customerId: customer._id, role: "customer" },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "30min",
      },
    );

    res.cookie("jwt", token, {
      maxAge: 90 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      user: {
        customerId: customer._id,
        email: customer.email,
        userName: customer.userName,
        profilePic: customer.profilePic,
        role: "customer",
      },
    });
  } catch (error) {
    console.log("Something went wrong in signin controller", error);
    next(error); // Pass error to error handling middleware
  }
};

// @desc    Logout
// @route   /api/auth/logout
// @access  Public
export const logout = (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successful" });
};

// @desc    Signup for eventManager
// @route   POST /api/auth/eventManagerSignup
// @access  Public
export const eventManagersignup = async (req, res, next) => {
  const { userName, email, password, contactnumber, companyname, location } =
    req.body;

  try {
    if (
      !userName ||
      !email ||
      !password ||
      !contactnumber ||
      !companyname ||
      !location
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must have at least 6 characters" });
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

    const token = jwt.sign(
      { eventManagerId: eventManager._id, role: "eventManager" },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "30min",
      },
    );

    res.cookie("jwt", token, {
      maxAge: 90 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.log("Something went wrong in signup controller", error);
    next(error); // Pass error to error handling middleware
  }
};

// @desc    Signin for eventManager
// @route   POST /api/auth/eventManagerSignin
// @access  Public
export const eventManagersignin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(404).json({ message: "All fields are required" });
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
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { eventManagerId: eventManager._id, role: "eventManager" },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "30min",
      },
    );
    res.cookie("jwt", token, {
      maxAge: 90 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      user: {
        eventManagerId: eventManager._id,
        email: eventManager.email,
        userName: eventManager.userName,
        profilePic: eventManager.profilePic,
        role: "eventManager",
      },
    });
  } catch (error) {
    console.log(
      "Something went wrong in eventManager signin controller",
      error,
    );
    next(error); // Pass error to error handling middleware
  }
};

// @desc    Signup for admin
// @route   POST /api/auth/adminSignup
// @access  Public
export const adminSignup = async (req, res, next) => {
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
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const admin = await Admin.create({ userName, email, password });

    const token = jwt.sign(
      { adminId: admin._id, role: "admin" },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "30min",
      },
    );

    res.cookie("jwt", token, {
      maxAge: 90 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error in adminSignup controller:", error);
    next(error); // Pass error to error handling middleware
  }
};

// @desc    Signin for admin
// @route   POST /api/auth/adminSignin
// @access  Public
// Find the adminSignin function and replace the res.cookie part:

export const adminSignin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = {
      _id: "admin_root_001",
      email: "admin@gmail.com",
      password: "admin123#",
    };

    if (email === admin.email && password === admin.password) {
      const token = jwt.sign(
        { adminId: admin._id, role: "admin" },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "7days" },
      );

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 30 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        user: {
          id: admin._id,
          email: admin.email,
          role: "admin",
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    console.error("Admin Signin Error:", error);
    next(error); // Pass error to error handling middleware
  }
};

// @desc    Verify auth status
// @route   GET /api/auth/verify
// @access  Public
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

    if (decoded.role === "customer") {
      user = await Customer.findById(decoded.customerId).select("-password");
      if (user) {
        userData.customerId = user._id;
        userData.email = user.email;
        userData.userName = user.userName;
        userData.profilePic = user.profilePic;
        userData.phoneNumber = user.phoneNumber;
        userData.address = user.address;
      }
    } else if (decoded.role === "eventManager") {
      user = await EventManager.findById(decoded.eventManagerId);
      if (user) {
        userData.eventManagerId = user._id;
        // Add other fields if needed
      }
    } else if (decoded.role === "admin") {
      // FIX: Check for hardcoded admin ID first to avoid invalid ObjectId error
      if (decoded.adminId === "admin_root_001") {
        user = {
          _id: "admin_root_001",
          email: "admin@gmail.com",
          userName: "Admin", // Fallback name
          role: "admin",
        };
      } else {
        // Only query DB if it's NOT the hardcoded admin
        user = await Admin.findById(decoded.adminId);
      }
    } else if (decoded.role === "vendor") {
      user = await Vendor.findById(decoded.vendorId);
      if (user) {
        userData.vendorId = user._id;
        userData.email = user.email;
        userData.userName = user.name;
        userData.storename = user.store_name;
      }
    }

    if (!user) {
      res.clearCookie("jwt");
      return res.status(200).json({ authenticated: false });
    }

    // If it was the hardcoded admin, manually attach data since 'user' isn't a Mongoose doc
    if (decoded.role === "admin" && decoded.adminId === "admin_root_001") {
      userData.adminId = user._id;
      userData.email = user.email;
    }

    res.status(200).json({
      authenticated: true,
      user: userData,
    });
  } catch (error) {
    console.log("JWT verification failed:", error);
    res.clearCookie("jwt");
    res.status(200).json({ authenticated: false });
  }
};

// @desc    Register vendor (formerly store partner)
// @route   POST /api/auth/vendorSignup
// @access  Public
export const storePartnerSignup = async (req, res) => {
  const { userName, email, password, contactnumber, storename, storelocation } =
    req.body;
  try {
    // Validation
    if (
      !userName ||
      !email ||
      !password ||
      !contactnumber ||
      !storename ||
      !storelocation
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if email already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
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
      description: "",
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        vendorId: vendor._id,
        role: "vendor", // Changed role to 'vendor'
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "30min" },
    );

    // Set cookie
    res.cookie("jwt", token, {
      maxAge: 90 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({
      success: true,
      user: {
        vendorId: vendor._id,
        email: vendor.email,
        userName: vendor.name,
        storename: vendor.store_name,
        role: "vendor",
      },
    });
  } catch (error) {
    console.log("Error in vendor signup:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
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
        message: "Email and password are required",
      });
    }

    const vendor = await Vendor.findOne({
      email: { $regex: new RegExp(`^${email.trim()}$`, "i") },
    });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Email is not registered",
      });
    }

    if (!vendor.password) {
      return res.status(401).json({
        success: false,
        message:
          "This account uses Google login. Please set a password using Forgot Password first.",
      });
    }

    // Verify password. Support legacy raw passwords created before hashing was fixed.
    const vendorPassword = vendor.password || "";
    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(vendorPassword);
    let isMatch = false;

    if (isBcryptHash) {
      isMatch = await bcrypt.compare(password, vendorPassword);
    } else {
      isMatch = password === vendorPassword;
      if (isMatch) {
        const salt = await bcrypt.genSalt(10);
        vendor.password = await bcrypt.hash(password, salt);
        await vendor.save({ validateBeforeSave: false });
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        vendorId: vendor._id,
        role: "vendor",
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "30min" },
    );

    // Set cookie
    res.cookie("jwt", token, {
      maxAge: 90 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        vendorId: vendor._id,
        userName: vendor.name,
        email: vendor.email,
        storename: vendor.store_name,
        role: "vendor",
      },
    });
  } catch (error) {
    console.log("Error in vendor signin:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email, role } = req.body; // Retrieve role from frontend
  const normalizedRole = role === "storePartner" ? "vendor" : role;

  try {
    let user;
    // Select Model based on role
    if (normalizedRole === "eventManager") {
      user = await EventManager.findOne({ email });
    } else if (normalizedRole === "vendor") {
      user = await Vendor.findOne({ email });
    } else {
      // Default to Customer
      user = await Customer.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Get Reset Token
    const resetToken = user.getResetPasswordToken();

    // Save only the token fields (skipping standard validation if needed)
    await user.save({ validateBeforeSave: false });

    // Create Reset URL with role as a query parameter
    // Ensure this matches your Frontend Route: http://localhost:5173/reset-password/:resetToken
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}?role=${normalizedRole || "customer"}`;

    const message = `
            <h1>Password Reset Request</h1>
            <p>You have requested a password reset for your <strong>${normalizedRole || "customer"}</strong> account.</p>
            <p>Please go to this link to reset your password:</p>
            <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
            <p>This link expires in 10 minutes.</p>
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
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resetToken
// @access  Public
export const resetPassword = async (req, res) => {
  // Get role from query parameters (e.g., ?role=eventManager)
  const { role } = req.query;
  const normalizedRole = role === "storePartner" ? "vendor" : role;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    let Model;
    if (normalizedRole === "eventManager") {
      Model = EventManager;
    } else if (normalizedRole === "vendor") {
      Model = Vendor;
    } else {
      Model = Customer;
    }

    const user = await Model.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired Token" });
    }

    // Update password and let model pre-save hook handle hashing.
    user.password = req.body.password;

    // Clear token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      data: "Password Reset Success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google Login - Initiate
// @route   GET /api/auth/google
// @access  Public
export const googleAuth = (req, res, next) => {
  const { role } = req.query;
  console.log("Google auth initiated for role:", role);

  // Pass role as state parameter to retrieve in callback
  const authenticator = passport.authenticate("google", {
    scope: ["profile", "email"],
    state: role || "customer", // This is important - passes role through the OAuth flow
  });

  authenticator(req, res, next);
};

// @desc    Google Login Callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleAuthCallback = (req, res, next) => {
  console.log("=== Google Callback Received ===");
  console.log("[GOOGLE_PIPELINE] 5. Hits /api/auth/google/callback endpoint");
  console.log(
    `[GOOGLE_PIPELINE] Full URL Requested: ${req.protocol}://${req.get("host")}${req.originalUrl}`,
  );
  console.log("Query params:", req.query);
  console.log("State param:", req.query.state); // The role should be in the state parameter

  // The role is passed in the state parameter from the initial request
  // We need to add it to the query so it's available in the passport strategy
  if (req.query.state) {
    req.query.role = req.query.state;
    console.log("Role extracted from state:", req.query.role);
  }

  passport.authenticate(
    "google",
    { session: false },
    async (err, data, info) => {
      console.log("[GOOGLE_PIPELINE] 6. Returned from passport.authenticate()");
      console.log("Passport authentication result:");
      console.log("- Error:", err?.message || err);
      console.log("- Has data:", !!data);
      console.log(`[GOOGLE_PIPELINE] info object/details:`, info);

      if (err || !data) {
        console.error(
          "[GOOGLE_PIPELINE] 7. ERROR: Google auth failed. Details:",
          { err, info },
        );
        console.error("Google auth error details:", { err, info });
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const errorMessage = err?.message || "Unknown error";
        const redirectErrorUrl = `${frontendUrl}/service-login?error=google_auth_failed&details=${encodeURIComponent(errorMessage)}`;
        console.log(
          `[GOOGLE_PIPELINE] 7. Redirecting to FRONTEND with error: ${redirectErrorUrl}`,
        );
        return res.redirect(redirectErrorUrl);
      }

      try {
        const { user, token, role } = data;
        console.log("Google auth successful!");
        console.log("- Role:", role);
        console.log("- User email:", user.email);
        console.log("- User ID:", user._id);

        // Set JWT cookie
        res.cookie("jwt", token, {
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          secure: process.env.NODE_ENV === "production",
        });

        // Redirect based on role
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        let redirectUrl = frontendUrl;

        if (role === "customer") {
          redirectUrl = `${frontendUrl}/`;
        } else if (role === "eventManager") {
          redirectUrl = `${frontendUrl}/eventManager`;
        } else if (role === "vendor") {
          redirectUrl = `${frontendUrl}/shop`;
        } else {
          redirectUrl = `${frontendUrl}/`;
        }

        redirectUrl += `?google_login_success=true`;
        console.log(
          `[GOOGLE_PIPELINE] 7. SUCCESS: Redirecting to frontend: ${redirectUrl}`,
        );

        return res.redirect(redirectUrl);
      } catch (error) {
        console.error(
          "[GOOGLE_PIPELINE] ERROR processing Google callback:",
          error,
        );
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(
          `${frontendUrl}/service-login?error=processing_failed&details=${encodeURIComponent(error.message)}`,
        );
      }
    },
  )(req, res, next);
};

// @desc    Get Google Auth URL (for frontend)
// @route   GET /api/auth/google/url
// @access  Public
export const getGoogleAuthUrl = (req, res) => {
  const { role } = req.query;
  const baseUrl = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google`;
  const url = `${baseUrl}?role=${role || "customer"}`;

  res.json({ url });
};
