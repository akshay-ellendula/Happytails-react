import Customer from "../models/customerModel.js";

export const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find({}).select("-password");
    res.status(200).json(customers);
  } catch (error) {
    console.error("getCustomers error:", error);
    next(error);
  }
};

export const getCustomer = async (req, res, next) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findById(id).select("-password");
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (error) {
    console.error("getCustomer error:", error);
    next(error);
  }
};

export const putCustomer = async (req, res, next) => {
  const { id } = req.params;
  const {
    userName,
    email,
    phoneNumber,
    addresses,
  } = req.body;

  if (req.user.role === "customer" && req.user.customerId !== id) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: you can only edit your own profile.",
    });
  }

  try {
    const customer = await Customer.findById(id);
    if (!customer)
      return res.status(404).json({ success: false, message: "Customer not found" });

    if (!userName || !email) {
      return res.status(400).json({ success: false, message: "Username and email are required" });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Only @gmail.com allowed" });
    }

    const existing = await Customer.findOne({ email });
    if (existing && existing._id.toString() !== id) {
      return res.status(400).json({ success: false, message: "Email already taken" });
    }

    let profilePicUrl = customer.profilePic;

    if (req.file) {
      console.log("File received:", req.file.originalname, req.file.size, "bytes");
      const b64 = req.file.buffer.toString("base64");
      const dataUrl = `data:${req.file.mimetype};base64,${b64}`;
      profilePicUrl = dataUrl;
    }

    customer.userName = userName;
    customer.email = email;
    customer.phoneNumber = phoneNumber || customer.phoneNumber;
    customer.profilePic = profilePicUrl;

    if (addresses) {
      let parsedAddresses;
      try {
        parsedAddresses = typeof addresses === 'string' ? JSON.parse(addresses) : addresses;
      } catch (e) {
        return res.status(400).json({ success: false, message: "Invalid addresses format" });
      }
    
      // FIXED: Preserve the actual names sent from frontend
      parsedAddresses = parsedAddresses.map((addr, index) => ({
        name: addr.name || `Address ${index + 1}`, // Use sent name or default
        houseNumber: addr.houseNumber || "",
        streetNo: addr.streetNo || "",
        city: addr.city || "",
        pincode: addr.pincode || "",
        isDefault: addr.isDefault || false,
      }));
    
      const hasDefault = parsedAddresses.some(addr => addr.isDefault);
      if (!hasDefault && parsedAddresses.length > 0) {
        parsedAddresses[0].isDefault = true;
      }
      customer.addresses = parsedAddresses;
    }

    const saved = await customer.save();

    // FIXED: Ensure response addresses have proper names
    const responseAddresses = saved.addresses.map((addr, index) => ({
      name: addr.name || `Address ${index + 1}`,
      houseNumber: addr.houseNumber || "",
      streetNo: addr.streetNo || "",
      city: addr.city || "",
      pincode: addr.pincode || "",
      isDefault: addr.isDefault || false,
    }));

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      user: {
        customerId: saved._id.toString(),
        userName: saved.userName,
        email: saved.email,
        profilePic: saved.profilePic,
        phoneNumber: saved.phoneNumber,
        addresses: responseAddresses,
        role: "customer",
      },
    });
  } catch (error) {
    console.error("putCustomer error:", error.message, error.stack);
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findById(id);
    if (!customer)
      return res.status(404).json({ success: false, message: "Customer not found" });
    await Customer.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error("deleteCustomer error:", error);
    next(error);
  }
};

export const changeActiveStatus = async (req, res, next) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findById(id);
    if (!customer)
      return res.status(404).json({ success: false, message: "Customer not found" });
    customer.isActive = !customer.isActive;
    await customer.save();
    res.status(200).json({ success: true, message: "Customer status updated" });
  } catch (error) {
    console.error("changeActiveStatus error:", error);
    next(error);
  }
};