// controller/customerControllers.js
import Customer from "../models/customerModel.js";

// ✅ All functions work the same — only putCustomer changed to Base64 logic

// GET all customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({}).select("-password");
    res.status(200).json(customers);
  } catch (error) {
    console.error("getCustomers error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET one customer
export const getCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findById(id).select("-password");
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (error) {
    console.error("getCustomer error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ PUT – update profile + picture (Base64, no Cloudinary)
export const putCustomer = async (req, res) => {
  const { id } = req.params;
  const {
    userName,
    email,
    phoneNumber,
    houseNumber,
    streetNo,
    city,
    pincode,
  } = req.body;

  // Security check
  if (req.user.role === "customer" && req.user.customerId !== id) {
    return res
      .status(403)
      .json({
        success: false,
        message: "Forbidden: you can only edit your own profile.",
      });
  }

  try {
    const customer = await Customer.findById(id);
    if (!customer)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });

    // Validation
    if (!userName || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Username and email are required" });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Only @gmail.com allowed" });
    }

    const existing = await Customer.findOne({ email });
    if (existing && existing._id.toString() !== id) {
      return res
        .status(400)
        .json({ success: false, message: "Email already taken" });
    }

    // ✅ Convert uploaded image to Base64 and store directly
    let profilePicUrl = customer.profilePic;

    if (req.file) {
      console.log("File received:", req.file.originalname, req.file.size, "bytes");
      const b64 = req.file.buffer.toString("base64");
      const dataUrl = `data:${req.file.mimetype};base64,${b64}`;
      profilePicUrl = dataUrl;
    }

    // ✅ Update fields
    customer.userName = userName;
    customer.email = email;
    customer.phoneNumber = phoneNumber || customer.phoneNumber;
    customer.profilePic = profilePicUrl;
    customer.address = customer.address || {};
    customer.address.houseNumber = houseNumber || customer.address.houseNumber;
    customer.address.streetNo = streetNo || customer.address.streetNo;
    customer.address.city = city || customer.address.city;
    customer.address.pincode = pincode || customer.address.pincode;

    const saved = await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      user: {
        customerId: saved._id,
        userName: saved.userName,
        email: saved.email,
        profilePic: saved.profilePic,
        phoneNumber: saved.phoneNumber,
        address: saved.address,
        role: "customer",
      },
    });
  } catch (error) {
    console.error("putCustomer error:", error.message);
    console.error(error.stack);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

// DELETE customer
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findById(id);
    if (!customer)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    await Customer.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error("deleteCustomer error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error" });
  }
};

// Toggle active status
export const changeActiveStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findById(id);
    if (!customer)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    customer.isActive = !customer.isActive;
    await customer.save();
    res
      .status(200)
      .json({ success: true, message: "Customer status updated" });
  } catch (error) {
    console.error("changeActiveStatus error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error" });
  }
};
