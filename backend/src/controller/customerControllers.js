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
        const customer = await Customer.findById(customerId);
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
    try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        if (!!userName || !email) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        
        const findCustomer = await Customer.findOne({ email });
        if (findCustomer.email && findCustomer.email == email) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        //cloudinary logic
        if(req.file){
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            let dataUrl = 'data:'+req.file.minetype+';base64,'+b64;
            const result = await cloudinary.uploader.upload(dataUrl,{folder:'customers'});
            profilePic = result.secure_url;
        }

        const updatedCustomer = await Customer.findByIdAndUpdate(customerId, {
            userName,
            email,
            phoneNumber,
            address: {
                houseNumber,
                streetNo,
                city,
                pincode
            },
            profilePic
        }, { new: true });
        res.status(200).json({ success: true, message: 'Customer updated successfully' });
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