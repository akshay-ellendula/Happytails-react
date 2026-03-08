import StorePartner from '../models/storePartnerModel.js';
// @desc    Get store partner profile
// @route   GET /api/store-partner/profile
// @access  Private (Store Partner)
export const getStorePartnerProfile = async (req, res) => {
    try {
        const storePartner = await StorePartner.findById(req.storePartnerId)
            .select('-password')
            .populate('products', 'name price images')
            .populate('orders', 'totalAmount status createdAt');

        if (!storePartner) {
            return res.status(404).json({
                success: false,
                message: "Store partner not found"
            });
        }
        res.status(200).json({
            success: true,
            data: storePartner
        });
    } catch (error) {
        console.log("Error getting store partner profile:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// @desc    Update store partner profile
// @route   PUT /api/store-partner/profile
// @access  Private (Store Partner)
export const updateStorePartnerProfile = async (req, res) => {
    try {
        const { userName, contactnumber, storename, storelocation, storeDescription, storeCategory } = req.body;

        const storePartner = await StorePartner.findByIdAndUpdate(
            req.storePartnerId,
            {
                userName,
                contactnumber,
                storename,
                storelocation,
                storeDescription,
                storeCategory
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!storePartner) {
            return res.status(404).json({
                success: false,
                message: "Store partner not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: storePartner
        });
    } catch (error) {
        console.log("Error updating store partner profile:", error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: errors.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};