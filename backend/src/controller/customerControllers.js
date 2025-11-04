import Customer from '../models/customerModel.js';
import cloudinary from '../config/cloudinary.js';

//@desc  Fetch all customers from the database
//@route   GET /api/customers
//@access Public
export const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({});
        res.status(200).json(customers);
    } catch (error) {
        console.log("something went wrong in getCustomers controller", error);
        res.status(500).json({ message: 'Server Error' });
    }
}
//@desc  Fetch a single customer by ID
//@route   GET /api/customers/:id
//@access Admin
export const getCustomer = async (req, res) => {
    const { id: customerId } = req.params;
    try {
        const customer = await Customer.findById(customerId).select('-password'); // Exclude password
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json(customer);
    } catch (error) {
        console.log("something went wrong in getCustomerById controller", error);
        res.status(500).json({ message: 'Server Error' });
    }
}
//@decs  modify a customer by ID
//@route PUT /api/customers/:id
//@access admin,customer
export const putCustomer = async (req, res) => {
    const { id: customerId } = req.params;
    const { userName, email, phoneNumber, houseNumber, streetNo, city, pincode } = req.body;
    
    // Security Check: Ensure logged-in customer can only edit their own profile
    if (req.user.role === 'customer' && req.user.customerId !== customerId) {
         return res.status(403).json({ message: 'Forbidden: You can only edit your own profile.' });
    }

    try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        // UPDATED: Correct validation
        if (!userName || !email) {
            return res.status(400).json({ message: 'Username and email are required fields' });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        
        // UPDATED: Check if email is taken by *another* user
        const findCustomer = await Customer.findOne({ email });
        if (findCustomer && findCustomer._id.toString() !== customerId) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // UPDATED: Handle profile picture upload
        let profilePicUrl = customer.profilePic; // Start with the existing picture
        if(req.file){
            console.log("File received:", req.file.originalname);
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            let dataUrl = 'data:' + req.file.mimetype + ';base64,' + b64; 
            const result = await cloudinary.uploader.upload(dataUrl,{folder:'customers'});
            profilePicUrl = result.secure_url; // Assign new URL
        }

        // Update fields on the customer object
        customer.userName = userName;
        customer.email = email;
        customer.phoneNumber = phoneNumber || customer.phoneNumber;
        customer.profilePic = profilePicUrl;
        
        // Ensure address object exists
        if (!customer.address) {
            customer.address = {};
        }
        
        customer.address = {
            houseNumber: houseNumber || customer.address.houseNumber,
            streetNo: streetNo || customer.address.streetNo,
            city: city || customer.address.city,
            pincode: pincode || customer.address.pincode
        };

        const updatedCustomer = await customer.save(); // Save the updated customer

        res.status(200).json({ 
            success: true, 
            message: 'Customer updated successfully',
            user: { // Send back updated user data
                customerId: updatedCustomer._id,
                email: updatedCustomer.email,
                userName: updatedCustomer.userName,
                profilePic: updatedCustomer.profilePic,
                role: 'customer'
            }
        });
    } catch (error) {
        console.log("something went wrong in updateCustomer controller", error);
        res.status(500).json({ message: 'Server Error' });
    }
}
//@desc  delete a customer by ID
//@route   DELETE /api/customers/:id
//@access Admin
export const deleteCustomer = async (req, res) => {
    const { id: customerId } = req.params;
    try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        await Customer.findByIdAndDelete(customerId);
        res.status(200).json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
        console.log("something went wrong in deleteCustomer controller", error);
        res.status(500).json({ message: 'Server Error' });
    }
}
//@desc change Active status of customer
//@route PUT /api/customers/changeStatus/:id
//@access Admin
export const changeActiveStatus = async (req, res) => {
    const { id: customerId } = req.params;
    try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        customer.isActive = !customer.isActive;
        await customer.save();
        res.status(200).json({ success: true, message: 'Customer status updated successfully' });
    } catch (error) {
        console.log("something went wrong in changeActiveStatus controller", error);
        res.status(500).json({ message: 'Server Error' });
    }
}