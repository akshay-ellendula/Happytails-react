import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcryptjs"; 

// --- IMPORTS: Models ---
import Vendor from "../models/vendorModel.js"; 
import { Order, OrderItem } from "../models/orderModel.js";
import {
  Product,
  ProductVariant,
  ProductImage,
} from "../models/productsModel.js";
import User from "../models/customerModel.js";

// --- IMPORT CLOUDINARY HELPER ---
// Fixed: Now importing the function properly instead of the object
import uploadToCloudinary from "../utils/cloudinaryUploader.js"; 

// --- HELPER TO SEND JSON RESPONSES ---
const sendJson = (res, data) =>
  res.status(200).json({ success: true, ...data });
const sendError = (res, message, code = 500) =>
  res.status(code).json({ success: false, message });

// --- 1. LOGIN & AUTH ---
const serviceProviderLogin = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role)
    return sendError(res, "Email, password, and role are required", 400);

  try {
    if (role !== "vendor") {
      return sendError(res, "Invalid role. Expected 'vendor'", 400);
    }

    const user = await Vendor.findOne({ email });
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, "Incorrect password", 401);
    }

    const tokenPayload = { 
        role: "vendor",
        vendorId: user._id.toString()
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      role,
      vendor: {
        id: user._id,
        email: user.email,
        store_name: user.store_name,
        name: user.name,
      },
      redirectUrl: "/dashboard",
    });
  } catch (error) {
    console.error("Login error:", error);
    sendError(res, "Server error");
  }
};

const logout = (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

const vendorSignup = async (req, res) => {
  const {
    name, 
    contactnumber,
    email,
    password,
    confirmpassword,
    storename,
    storelocation,
  } = req.body;

  if (!name || !contactnumber || !email || !password || !storename || !storelocation) {
    return sendError(res, "All fields are required", 400);
  }
  if (password !== confirmpassword)
    return sendError(res, "Passwords do not match", 400);

  try {
    const existingVendor = await Vendor.findOne({
      $or: [{ email }, { store_name: storename }],
    });
    if (existingVendor)
      return sendError(res, "Email or store name already registered", 400);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newVendor = await Vendor.create({
      store_name: storename,
      name: name,
      email: email,
      contact_number: contactnumber, 
      store_location: storelocation,
      password: hashedPassword, 
      description: "",
    });

    const token = jwt.sign(
      { 
          vendorId: newVendor._id.toString(), 
          role: "vendor" 
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({
      success: true,
      vendor: {
        id: newVendor._id,
        name: newVendor.name,
        email: newVendor.email,
        store_name: newVendor.store_name,
        store_location: newVendor.store_location,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    sendError(res, "Server error");
  }
};

// --- 2. DASHBOARD & ANALYTICS ---
const getVendorProfile = async (req, res) => {
  if (!req.user) return sendError(res, "Unauthorized", 401);
  const vendorId = req.user.vendorId;

  try {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return sendError(res, "Vendor not found", 404);

    const vendorData = {
      store_name: vendor.store_name,
      owner_name: vendor.name,
      email: vendor.email,
      phone: vendor.contact_number,
      address: vendor.store_location,
      description: vendor.description || "",
    };

    sendJson(res, { vendor: vendorData });
  } catch (error) {
    console.error("Profile Error:", error);
    sendError(res, "Server error");
  }
};
const getVendorAnalytics = async (req, res) => {
  if (!req.user) return sendError(res, "Unauthorized", 401);
  const vendorId = req.user.vendorId;

  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const getStats = async (startDate) => {
      // 1. Match items belonging to this vendor
      const matchStage = {
        vendor_id: new mongoose.Types.ObjectId(vendorId),
      };

      const pipeline = [
        { $match: matchStage },
        // 2. Lookup the parent Order to check status and date
        {
          $lookup: {
            from: "orders",
            localField: "order_id",
            foreignField: "_id",
            as: "order",
          },
        },
        { $unwind: "$order" },
        // 3. Filter by Order Status (Only count valid sales)
        {
          $match: {
            "order.status": { $in: ["Pending", "Confirmed", "Shipped", "Delivered"] },
          },
        },
      ];

      // 4. Apply Date Filter if provided
      if (startDate) {
        pipeline.push({
          $match: { "order.order_date": { $gte: startDate } },
        });
      }

      // 5. Group and Calculate
      pipeline.push({
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } },
          totalOrders: { $addToSet: "$order._id" }, // Count unique orders
        },
      });

      pipeline.push({
        $project: {
          totalRevenue: 1,
          totalOrders: { $size: "$totalOrders" },
        },
      });

      const stats = await OrderItem.aggregate(pipeline);
      return stats[0] || { totalRevenue: 0, totalOrders: 0 };
    };

    const [total, today, week, month] = await Promise.all([
      getStats(null),
      getStats(startOfDay),
      getStats(startOfWeek),
      getStats(startOfMonth),
    ]);

    const analyticsData = {
      revenue: {
        total: total.totalRevenue.toFixed(2),
        today: today.totalRevenue.toFixed(2),
        week: week.totalRevenue.toFixed(2),
        month: month.totalRevenue.toFixed(2),
      },
      orders: {
        total: total.totalOrders,
        today: today.totalOrders,
        week: week.totalOrders,
        month: month.totalOrders,
      },
      avgOrderValue: {
        total: (total.totalOrders
          ? total.totalRevenue / total.totalOrders
          : 0
        ).toFixed(2),
        month: (month.totalOrders
          ? month.totalRevenue / month.totalOrders
          : 0
        ).toFixed(2),
      },
    };

    sendJson(res, { analytics: analyticsData });
  } catch (error) {
    console.error("Analytics Error:", error);
    sendError(res, "Server error");
  }
};

// --- 3. PRODUCTS ---
const getVendorProducts = async (req, res) => {
    if (!req.user) return sendError(res, "Unauthorized", 401);
    const vendorId = req.user.vendorId;
    const { category, sort } = req.query;

    console.log("Fetching products for vendor:", vendorId);

    const matchStage = {
        $or: [
            { vendor_id: new mongoose.Types.ObjectId(vendorId) },
            { vendor_id: vendorId }
        ],
        is_deleted: { $ne: true },
    };
    
    if (category && category !== "All Categories")
        matchStage.product_category = category;

    const sortStage = {};
    if (sort === "oldest") sortStage.created_at = 1;
    else if (sort === "price_asc") sortStage.price_for_sort = 1;
    else if (sort === "price_desc") sortStage.price_for_sort = -1;
    else sortStage.created_at = -1;

    try {
        const products = await Product.aggregate([
        { $match: matchStage },
        {
            $lookup: {
            from: "productvariants",
            localField: "_id",
            foreignField: "product_id",
            as: "variants",
            },
        },
        {
            $lookup: {
            from: "productimages",
            localField: "_id",
            foreignField: "product_id",
            as: "images",
            },
        },
        {
            $lookup: {
            from: "orderitems",
            localField: "_id",
            foreignField: "product_id",
            as: "order_items",
            },
        },
        {
            $addFields: {
            primary_image: {
                $arrayElemAt: [
                {
                    $filter: {
                    input: "$images",
                    as: "image",
                    cond: { $eq: ["$$image.is_primary", true] },
                    },
                },
                0,
                ],
            },
            price_for_sort: {
                $ifNull: [{ $arrayElemAt: ["$variants.regular_price", 0] }, 0],
            },
            total_stock: { $sum: "$variants.stock_quantity" },
            },
        },
        { $sort: sortStage },
        {
            $project: {
            id: "$_id",
            product_name: 1,
            product_category: 1,
            regular_price: {
                $ifNull: [{ $arrayElemAt: ["$variants.regular_price", 0] }, 0],
            },
            sale_price: { $arrayElemAt: ["$variants.sale_price", 0] },
            stock_quantity: "$total_stock",
            sold: { $sum: "$order_items.quantity" },
            image_data: {
                $ifNull: ["$primary_image.image_data", "/images/default.jpg"],
            },
            },
        },
        ]);
        
        console.log(`Found ${products.length} products for vendor ${vendorId}`);
        sendJson(res, { products });
    } catch (error) {
        console.error("getVendorProducts error:", error);
        sendError(res, error.message || "Server error");
    }
};

// --- SUBMIT PRODUCT (MULTER + CLOUDINARY) ---
const submitProduct = async (req, res) => {
    if (!req.user) return sendError(res, "Unauthorized", 401);
    const vendorId = req.user.vendorId;

    // DEBUG: Log to verify what is being received
    console.log("Submit Product - Body:", req.body);
    console.log("Submit Product - Files:", req.files);

    const {
      product_name,
      product_category,
      product_type,
      product_description,
      stock_status,
      variants 
    } = req.body;

    try {
      const newProduct = await Product.create({
        vendor_id: vendorId,
        product_name,
        product_category,
        product_type,
        product_description,
        stock_status,
      });

      // --- VARIANTS ---
      let parsedVariants = [];
      if (typeof variants === 'string') {
          try { parsedVariants = JSON.parse(variants); } catch (e) { parsedVariants = []; }
      } else if (Array.isArray(variants)) {
          parsedVariants = variants;
      }

      for (const variant of parsedVariants) {
        await ProductVariant.create({
          product_id: newProduct._id,
          size: variant.size || null,
          color: variant.color || null,
          regular_price: parseFloat(variant.regular_price) || 0,
          sale_price: variant.sale_price ? parseFloat(variant.sale_price) : null,
          stock_quantity: parseInt(variant.stock_quantity) || 0,
          sku: variant.sku || null,
        });
      }

      // --- IMAGES (CLOUDINARY) ---
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          try {
            // FIX: Using the imported unified upload helper
            const secureUrl = await uploadToCloudinary(file, "pet_store_products");

            await ProductImage.create({
              product_id: newProduct._id,
              image_data: secureUrl, // Storing the URL string directly
              is_primary: i === 0,
            });
          } catch (err) {
            console.error("Cloudinary upload failed for product:", err);
            // We continue loop even if one fails, or you could throw to stop
          }
        }
      }

      sendJson(res, { message: "Product added successfully" });
    } catch (error) {
      console.error("Submit Product Error:", error);
      sendError(res, error.message);
    }
};

// --- UPDATE PRODUCT (MULTER + CLOUDINARY) ---
const updateProduct = async (req, res) => {
    if (!req.user) return sendError(res, "Unauthorized", 401);
    const vendorId = req.user.vendorId;
    const productId = req.params.productId;
    
    // DEBUG: Log for update
    console.log("Update Product - Files:", req.files);

    const {
      product_name,
      product_category,
      product_type,
      product_description,
      stock_status,
      deletedImages,
      variants
    } = req.body;

    try {
      const product = await Product.findOne({
        _id: productId,
        vendor_id: vendorId,
      });
      if (!product) return sendError(res, "Product not found", 404);

      // 1. Update Product Details
      await Product.findByIdAndUpdate(productId, {
        product_name,
        product_category,
        product_type,
        product_description,
        stock_status,
      });

      // 2. Handle Variants
      if (variants) {
        let parsedVariants = [];
        if (typeof variants === 'string') {
            try { parsedVariants = JSON.parse(variants); } catch (e) { parsedVariants = []; }
        } else if (Array.isArray(variants)) {
            parsedVariants = variants;
        }

        if (parsedVariants.length > 0) {
          await ProductVariant.deleteMany({ product_id: productId });
          for (const variant of parsedVariants) {
            await ProductVariant.create({
              product_id: productId,
              size: variant.size || null,
              color: variant.color || null,
              regular_price: parseFloat(variant.regular_price) || 0,
              sale_price: variant.sale_price ? parseFloat(variant.sale_price) : null,
              stock_quantity: parseInt(variant.stock_quantity) || 0,
              sku: variant.sku || null,
            });
          }
        }
      }

      // 3. Handle Images
      // A. Delete removed images
      if (deletedImages) {
        let idsToDelete = deletedImages;
        if (typeof deletedImages === 'string') {
             if(deletedImages.includes(',')) idsToDelete = deletedImages.split(',');
             else idsToDelete = [deletedImages];
        } else if (!Array.isArray(deletedImages)) {
            idsToDelete = [deletedImages];
        }

        await ProductImage.deleteMany({
          _id: { $in: idsToDelete },
          product_id: productId,
        });
      }

      // B. Add new images (req.files)
      if (req.files && req.files.length > 0) {
        const existingImagesCount = await ProductImage.countDocuments({ product_id: productId });
        let isNextPrimary = existingImagesCount === 0;

        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          try {
            // FIX: Using the imported unified upload helper
            const secureUrl = await uploadToCloudinary(file, "pet_store_products");

            await ProductImage.create({
              product_id: productId,
              image_data: secureUrl,
              is_primary: isNextPrimary, 
            });
            isNextPrimary = false; 
          } catch (err) {
            console.error("Cloudinary upload failed:", err);
          }
        }
      }

      sendJson(res, { message: "Product updated successfully" });
    } catch (error) {
      console.error("Update product error:", error);
      sendError(res, "Server error");
    }
};

const getProductForEdit = async (req, res) => {
  if (!req.user) return sendError(res, "Unauthorized", 401);
  const vendorId = req.user.vendorId;

  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      vendor_id: vendorId,
    });
    if (!product) return sendError(res, "Product not found", 404);

    const variants = await ProductVariant.find({ product_id: product._id });
    const images = await ProductImage.find({ product_id: product._id });

    sendJson(res, { product: { ...product.toObject(), variants, images } });
  } catch (error) {
    sendError(res, "Server error");
  }
};

// --- 4. ORDERS ---
const getVendorOrders = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    const vendorId = req.user.vendorId;
    const statusFilter = req.query.status;

    // 1. Find all items belonging to this vendor (exclude deleted)
    const matchStage = { 
      vendor_id: new mongoose.Types.ObjectId(vendorId),
      is_deleted: { $ne: true }
    };

    const orders = await OrderItem.aggregate([
      { $match: matchStage },
      // 2. Group by Order ID to distinct them (A vendor might have 2 items in 1 order)
      { $group: { _id: "$order_id" } },
      // 3. Lookup the actual Order details
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      // Exclude deleted orders
      { $match: { "order.is_deleted": { $ne: true } } },
      // 4. Apply Status Filter (case-insensitive)
      ...(statusFilter && statusFilter !== "all"
        ? [
            {
              $match: {
                "order.status": {
                  $regex: new RegExp(`^${statusFilter}$`, "i"),
                },
              },
            },
          ]
        : []),
      // 5. Lookup Customer Details
      {
        $lookup: {
          from: "customers",
          localField: "order.customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      // 6. Format the Output
      {
        $project: {
          id: { $toString: "$order._id" },
          // Note: Showing the full order total might be confusing in a multi-vendor app. 
          // Ideally, you should sum only this vendor's items, but for now we keep order total.
          total: "$order.total_amount", 
          order_date: "$order.order_date",
          timeline: "$order.timeline",
          status: "$order.status", // Keep it simple, use the string directly
          customer_name: {
            $ifNull: [
              "$customer.userName",
              "$customer.email",
              "Guest Customer",
            ],
          },
          customer: {
            name: { $ifNull: ["$customer.userName", "Guest"] },
            email: "$customer.email",
            phone: "$customer.phoneNumber",
          },
        },
      },
      { $sort: { order_date: -1 } },
    ]);

    res.json({ success: true, orders });
  } catch (error) {
    console.error("getVendorOrders error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getVendorCustomerDetails = async (req, res) => {
  if (!req.user) return sendError(res, "Unauthorized", 401);
  const vendorId = req.user.vendorId;
  const customerId = req.params.customerId;

  try {
    const customer = await User.findById(customerId).select("-password");
    if (!customer) return sendError(res, "Customer not found", 404);

    const orders = await OrderItem.aggregate([
      {
        $match: {
          vendor_id: new mongoose.Types.ObjectId(vendorId),
          is_deleted: { $ne: true },
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $match: {
          "order.customer_id": new mongoose.Types.ObjectId(customerId),
          "order.is_deleted": { $ne: true },
        },
      },
      {
        $project: {
          order_id: "$order._id",
          order_date: "$order.order_date",
          status: "$order.status",
          product_name: 1,
          quantity: 1,
          price: 1,
          total: { $multiply: ["$price", "$quantity"] },
        },
      },
      { $sort: { order_date: -1 } },
    ]);

    const totalOrders = new Set(orders.map((o) => o.order_id.toString())).size;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    const productCounts = {};
    orders.forEach((o) => {
      productCounts[o.product_name] =
        (productCounts[o.product_name] || 0) + o.quantity;
    });
    let mostPurchased = "N/A";
    let maxCount = 0;
    for (const [name, count] of Object.entries(productCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostPurchased = name;
      }
    }

    const orderHistory = Object.values(
      orders.reduce((acc, item) => {
        if (!acc[item.order_id]) {
          acc[item.order_id] = {
            order_id: item.order_id,
            date: new Date(item.order_date).toLocaleDateString(),
            status: item.status,
            items: [],
            total: 0,
          };
        }
        acc[item.order_id].items.push(
          `${item.product_name} (x${item.quantity})`
        );
        acc[item.order_id].total += item.total;
        return acc;
      }, {})
    );

    sendJson(res, {
      customer: {
        id: customer._id,
        name: customer.userName,
        email: customer.email,
        phone: customer.phoneNumber,
        address: customer.address,
        joined: new Date(customer.createdAt).toLocaleDateString(),
      },
      summary: {
        totalOrders,
        totalRevenue: totalRevenue.toFixed(2),
        avgOrderValue: (totalOrders ? totalRevenue / totalOrders : 0).toFixed(2),
        lastPurchase: orders[0]
          ? new Date(orders[0].order_date).toLocaleDateString()
          : "N/A",
        mostPurchased,
      },
      orders: orderHistory.map((o) => ({
        ...o,
        items: o.items.join(", "),
        total: o.total.toFixed(2),
      })),
    });
  } catch (error) {
    console.error("Error fetching customer details:", error);
    sendError(res, "Server error");
  }
};

const getOrderDetails = async (req, res) => {
  if (!req.user) return sendError(res, "Unauthorized", 401);
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "customer_id"
    );
    if (!order || order.is_deleted) return sendError(res, "Order not found", 404);

    const items = await OrderItem.find({ order_id: req.params.orderId });

    const platformCharge = order.total_amount - order.subtotal;

    const orderData = {
      order_id: order._id,
      status: order.status === "Confirmed" ? "Confirmed" : order.status,
      order_date: order.order_date,
      shipped_at: order.shipped_at,
      delivered_at: order.delivered_at,
      cancelled_at: order.cancelled_at,
      timeline: order.timeline || [],
      customer: {
        name: order.customer_id?.userName || "Unknown",
        email: order.customer_id?.email || "N/A",
        phone: order.customer_id?.phoneNumber || "N/A",
      },
      shipping: {
        address: order.customer_id?.address || "N/A",
        method: "Standard Delivery",
      },
      payment_method: order.payment_last_four
        ? `Credit Card (**** ${order.payment_last_four})`
        : "Online Payment",
      payment_status: "Paid",
      items: items.map((i) => ({
        product_name: i.product_name,
        quantity: i.quantity,
        price: i.price,
        size: i.size,
        color: i.color,
      })),
      subtotal: (order.subtotal || 0).toFixed(2),
      platform_charge: (platformCharge || 0).toFixed(2),
      total: order.total_amount || 0,
    };
    sendJson(res, { order: orderData });
  } catch (error) {
    console.error("Get Order Details Error:", error);
    sendError(res, "Server error");
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!req.user) return sendError(res, "Unauthorized", 401);
    const vendorId = req.user.vendorId;

    const validStatuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return sendError(res, "Invalid status", 400);
    }

    const updateFields = { status };

    if (status === "Pending") updateFields.pending_at = new Date();
    if (status === "Confirmed") updateFields.confirmed_at = new Date();
    if (status === "Shipped") updateFields.shipped_at = new Date();
    if (status === "Delivered") updateFields.delivered_at = new Date();
    if (status === "Cancelled") updateFields.cancelled_at = new Date();

    updateFields.$push = {
      timeline: {
        status,
        date: new Date(),
        description:
          status === "Pending"
            ? "Order is pending."
            : status === "Confirmed"
            ? "Order confirmed by seller."
            : status === "Shipped"
            ? "Your order has been shipped."
            : status === "Delivered"
            ? "Your order has been delivered."
            : "Your order has been cancelled.",
      },
    };

    const hasItem = await OrderItem.findOne({
      order_id: orderId,
      vendor_id: vendorId,
    });

    if (!hasItem) {
      return sendError(res, "Unauthorized: You do not own this order", 403);
    }

    const order = await Order.findByIdAndUpdate(orderId, updateFields, {
      new: true,
    }).populate("customer_id", "name email phone");

    if (!order) {
      return sendError(res, "Order not found", 404);
    }

    const formattedOrder = {
      id: order._id.toString(),
      order_id: order._id.toString(),
      customer: {
        name: order.customer_id?.userName || "Guest",
        email: order.customer_id?.email,
        phone: order.customer_id?.phoneNumber,
      },
      total: order.total_amount,
      order_date: order.order_date,
      status: order.status,
      timeline: order.timeline,
    };

    sendJson(res, { message: "Status updated", order: formattedOrder });
  } catch (error) {
    console.error("Update Status Error:", error);
    sendError(res, "Server error");
  }
};

// --- 5. CUSTOMERS ---
const getVendorCustomers = async (req, res) => {
  if (!req.user) return sendError(res, "Unauthorized", 401);
  const vendorId = req.user.vendorId;

  try {
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return sendError(res, "Invalid Vendor ID", 400);
    }

    const customers = await OrderItem.aggregate([
      {
        $match: { 
          vendor_id: new mongoose.Types.ObjectId(vendorId),
          is_deleted: { $ne: true }
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      { $match: { "order.is_deleted": { $ne: true } } },
      {
        $lookup: {
          from: "customers",
          localField: "order.customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      {
        $group: {
          _id: "$customer._id",
          name: { $first: "$customer.userName" },
          email: { $first: "$customer.email" },
          order_ids: { $addToSet: "$order._id" },
          total_spent: { $sum: { $multiply: ["$price", "$quantity"] } },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          total_orders: { $size: "$order_ids" },
          total_spent: 1,
        },
      },
    ]);

    sendJson(res, { customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    sendError(res, "Server error");
  }
};

// --- 6. PROFILE UPDATE ---
const updateVendorProfile = async (req, res) => {
  if (!req.user) return sendError(res, "Unauthorized", 401);
  const vendorId = req.user.vendorId;
  
  // Mapping frontend fields to Vendor model fields
  const { storeName, ownerName, email, phone, address, description } = req.body;
  
  try {
    // Note: Vendor model provided does not have profilePic, so we don't upload it here.
    await Vendor.findByIdAndUpdate(vendorId, {
      store_name: storeName,
      name: ownerName,
      email,
      contact_number: phone,
      store_location: address,
      description,
    });
    sendJson(res, { message: "Profile updated" });
  } catch (error) {
    sendError(res, "Update failed");
  }
};

const deleteProduct = async (req, res) => {
  if (!req.user) return sendError(res, "Unauthorized", 401);
  const vendorId = req.user.vendorId;
  const productId = req.params.productId;

  try {
    const product = await Product.findOne({
      _id: productId,
      vendor_id: new mongoose.Types.ObjectId(vendorId),
    });
    if (!product) return sendError(res, "Product not found", 404);

    await Product.updateOne({ _id: productId }, { $set: { is_deleted: true } });
    await ProductVariant.deleteMany({ product_id: productId });
    await ProductImage.deleteMany({ product_id: productId });
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    sendError(res, "Server error");
  }
};

const deleteOrder = async (req, res) => {
  if (!req.user) return sendError(res, "Unauthorized", 401);
  const vendorId = req.user.vendorId;
  const orderId = req.params.orderId;
  try {
    const order = await Order.findOne({ _id: orderId });
    if (!order) return sendError(res, "Order not found", 404);

    const hasItem = await OrderItem.findOne({
      order_id: orderId,
      vendor_id: vendorId,
    });

    if (!hasItem) {
      return sendError(res, "Unauthorized: You do not own this order", 403);
    }

    // Soft delete: Mark as deleted instead of removing from database
    await Order.findByIdAndUpdate(orderId, { is_deleted: true });
    await OrderItem.updateMany({ order_id: orderId }, { is_deleted: true });
    
    res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    sendError(res, "Server error");
  }
};

const deleteSelectedOrders = async (req, res) => {
  if (!req.user) return sendError(res, "Unauthorized", 401);
  const { orderIds } = req.body;

  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    return sendError(res, "No orders selected", 400);
  }
  try {
    // Soft delete: Mark as deleted instead of removing
    await Order.updateMany({ _id: { $in: orderIds } }, { is_deleted: true });
    await OrderItem.updateMany({ order_id: { $in: orderIds } }, { is_deleted: true });
    res.status(200).json({ success: true, message: "Selected orders deleted" });
  } catch (error) {
    sendError(res, "Server error");
  }
};

// --- DASHBOARD (JSON) ---
const getVendorDashboard = async (req, res) => {
  if (!req.user) return sendError(res, "Unauthorized", 401);
  const vendorId = req.user.vendorId || req.user.eventManagerId;

  try {
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return sendError(res, "Invalid Vendor ID", 400);
    }
    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

    console.log('=== DASHBOARD DEBUG ===');
    console.log('Vendor ID:', vendorId);
    console.log('Vendor ObjectId:', vendorObjectId);
    
    // Check if OrderItems exist for this vendor
    const orderItemsCount = await OrderItem.countDocuments({ vendor_id: vendorObjectId });
    console.log('OrderItems found for vendor:', orderItemsCount);
    
    if (orderItemsCount === 0) {
      console.log('WARNING: No order items found for this vendor');
      // Check if vendor_id is stored as string instead of ObjectId
      const orderItemsAsString = await OrderItem.countDocuments({ vendor_id: vendorId });
      console.log('OrderItems with vendor_id as string:', orderItemsAsString);
    }

    // 1. Total Revenue & Products Sold (All Time)
    const totalStats = await OrderItem.aggregate([
      { $match: { vendor_id: vendorObjectId } },
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $match: {
          "order.status": { $in: ["Pending", "Confirmed", "Shipped", "Delivered"] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } },
          productsSold: { $sum: "$quantity" },
        },
      },
    ]);

    // 2. New Orders (Pending/Confirmed - exclude deleted)
    const newOrdersStats = await OrderItem.aggregate([
      { $match: { vendor_id: vendorObjectId, is_deleted: { $ne: true } } },
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      { $match: { 
        "order.status": { $in: ["Pending", "Confirmed"] },
        "order.is_deleted": { $ne: true }
      } },
      { $group: { _id: "$order._id" } },
      { $count: "count" },
    ]);

    // 3. Recent Orders (exclude deleted)
    const recentOrders = await OrderItem.aggregate([
      { $match: { vendor_id: vendorObjectId, is_deleted: { $ne: true } } },
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      { $match: { "order.is_deleted": { $ne: true } } },
      {
        $lookup: {
          from: "customers",
          localField: "order.customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      { $sort: { "order.order_date": -1 } },
      {
        $project: {
          id: "$order._id",
          order_date: "$order.order_date",
          status: "$order.status",
          total_amount: { $multiply: ["$price", "$quantity"] },
          user_name: { $ifNull: ["$customer.userName", "Unknown"] },
          product_name: "$product_name",
          _id: 0,
        },
      },
    ]);

    // 4. Monthly Stats
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = currentMonthStart;

    const getMonthStats = async (startDate, endDate) => {
      const stats = await OrderItem.aggregate([
        { $match: { vendor_id: vendorObjectId } },
        {
          $lookup: {
            from: "orders",
            localField: "order_id",
            foreignField: "_id",
            as: "order",
          },
        },
        { $unwind: "$order" },
        {
          $match: {
            "order.status": { $in: ["Pending", "Confirmed", "Shipped", "Delivered"] },
            "order.order_date": { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: { $multiply: ["$price", "$quantity"] } },
            sold: { $sum: "$quantity" },
          },
        },
      ]);
      return stats[0] || { revenue: 0, sold: 0 };
    };

    const currentMonth = await getMonthStats(currentMonthStart, now);
    const lastMonth = await getMonthStats(lastMonthStart, lastMonthEnd);

    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    console.log('Total Stats Result:', totalStats);
    console.log('New Orders Result:', newOrdersStats);
    console.log('Recent Orders Count:', recentOrders.length);

    const stats = {
      totalRevenue: (totalStats[0]?.totalRevenue || 0).toFixed(2),
      productsSold: totalStats[0]?.productsSold || 0,
      newOrders: newOrdersStats[0]?.count || 0,
      revenueChange: calculateChange(
        currentMonth.revenue,
        lastMonth.revenue
      ).toFixed(1),
      productsSoldChange: calculateChange(
        currentMonth.sold,
        lastMonth.sold
      ).toFixed(1),
      recentOrders: recentOrders.slice(0, 5).map((o) => ({
        ...o,
        id: o.id.toString(),
      })),
    };

    console.log('Final Dashboard Stats:', JSON.stringify(stats, null, 2));
    sendJson(res, { stats });
  } catch (error) {
    console.error("Dashboard Error:", error);
    sendError(res, "Server error");
  }
};

const vendorController = {
  serviceProviderLogin,
  logout,
  vendorSignup, 
  getVendorProfile,
  getVendorAnalytics,
  getVendorProducts,
  submitProduct, 
  updateProduct,
  getProductForEdit,
  getVendorOrders,
  getOrderDetails,
  updateOrderStatus,
  getVendorCustomers,
  getVendorCustomerDetails,
  updateVendorProfile,
  deleteProduct,
  deleteOrder,
  deleteSelectedOrders,
  getVendorDashboard,
};

export default vendorController