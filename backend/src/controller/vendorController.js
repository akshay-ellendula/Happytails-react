import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";

// --- IMPORTS: Models ---
// We import these from the specific files you have created
import Vendor from "../models/vendorModel.js";
import { Order, OrderItem } from "../models/orderModel.js";
import {
  Product,
  ProductVariant,
  ProductImage,
} from "../models/productsModel.js";
import User from "../models/customerModel.js"; // Assuming 'Customer' is your User model
import uploadToCloudinary from "../utils/cloudinaryUploader.js";
import EventManager from "../models/eventManagerModel.js"; // UNCOMMENT THIS when you create the EventManager model file

// Configure Multer for memory storage (for image uploads)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- HELPER TO SEND JSON RESPONSES ---
const sendJson = (res, data) =>
  res.status(200).json({ success: true, ...data });
const sendError = (res, message, code = 500) =>
  res.status(code).json({ success: false, message });

// --- 1. LOGIN & AUTH ---
const serviceProviderLogin = async (req, res) => {
  const { email, password, role } = req.body;

  console.log("serviceProviderLogin payload:", { email, role });

  if (!email || !password || !role)
    return sendError(res, "Email, password, and role are required", 400);

  try {
    let Model;

    if (role === "store-manager") {
      Model = Vendor;
    } else if (role === "event-manager") {
      Model = EventManager; // Enable this when you have the EventManager model
      sessionKey = "eventManager";
      return sendError(
        res,
        "Event Manager login not yet implemented (Model missing)",
        501
      );
    } else {
      return sendError(res, "Invalid role", 400);
    }

    const user = await Model.findOne({ email });
    if (!user) {
      console.warn("Login attempt: user not found for role", role, email);
      return sendError(res, "User not found", 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn("Login attempt: invalid password for", email);
      return sendError(res, "Incorrect password", 401);
    }

    // Issue JWT token instead of session
    const token = jwt.sign(
      { vendorId: user._id.toString(), role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "30m" }
    );
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 90 * 60 * 1000,
      sameSite: "strict",
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
  // For JWT based auth, clear the cookie
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

const storeSignup = async (req, res) => {
  const {
    name,
    contactnumber,
    email,
    password,
    confirmpassword,
    storename,
    storelocation,
  } = req.body;

  if (
    !name ||
    !contactnumber ||
    !email ||
    !password ||
    !storename ||
    !storelocation
  ) {
    return sendError(res, "All fields are required", 400);
  }
  if (password !== confirmpassword)
    return sendError(res, "Passwords do not match", 400);

  try {
    console.log("vendor signup request body:", {
      name,
      contactnumber,
      email,
      storename,
      storelocation,
    });
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
      role: "store-manager", // Explicitly set role
    });

    // Create a JWT for the newly created vendor and set it as cookie
    const token = jwt.sign(
      { vendorId: newVendor._id.toString(), role: "store-manager" },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "30m" }
    );
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 90 * 60 * 1000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    console.log(
      "vendor created, _id:",
      newVendor._id,
      "connected db:",
      mongoose.connection.name
    );
    // Return the newly created vendor details so the frontend can confirm and set state
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
  // req.user is set by the auth middleware
  if (!req.user) return sendError(res, "Unauthorized", 401);
  const vendorId = req.user.vendorId || req.user.eventManagerId;

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
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Helper to get stats for a date range
    const getStats = async (startDate) => {
      const matchStage = {
        "order_items.vendor_id": new mongoose.Types.ObjectId(vendorId),
        status: { $in: ["Confirmed", "Shipped", "Delivered"] },
      };
      if (startDate) {
        matchStage.order_date = { $gte: startDate };
      }

      const stats = await Order.aggregate([
        {
          $lookup: {
            from: "orderitems",
            localField: "_id",
            foreignField: "order_id",
            as: "order_items",
          },
        },
        { $match: matchStage },
        {
          $project: {
            order_total: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: "$order_items",
                      as: "item",
                      cond: {
                        $eq: [
                          "$$item.vendor_id",
                          new mongoose.Types.ObjectId(vendorId),
                        ],
                      },
                    },
                  },
                  as: "item",
                  in: { $multiply: ["$$item.price", "$$item.quantity"] },
                },
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$order_total" },
            totalOrders: { $sum: 1 },
          },
        },
      ]);
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

  const matchStage = {
    vendor_id: new mongoose.Types.ObjectId(vendorId),
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
    sendJson(res, { products });
  } catch (error) {
    sendError(res, "Server error");
  }
};

const submitProduct = [
  upload.array("product_images", 4),
  async (req, res) => {
    if (!req.user || !req.user.vendorId)
      return sendError(res, "Unauthorized", 401);
    const vendorId = req.user.vendorId;
    const {
      product_name,
      product_category,
      product_type,
      product_description,
      stock_status,
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
      // --- VARIANTS: parse and save if present ---
      let parsedVariants = [];
      if (req.body.variants) {
        try {
          parsedVariants = JSON.parse(req.body.variants);
        } catch (err) {
          parsedVariants = [];
        }
      }
      for (const variant of parsedVariants) {
        await ProductVariant.create({
          product_id: newProduct._id,
          size: variant.size || null,
          color: variant.color || null,
          regular_price: parseFloat(variant.regular_price) || 0,
          sale_price: variant.sale_price
            ? parseFloat(variant.sale_price)
            : null,
          stock_quantity: parseInt(variant.stock_quantity) || 0,
          sku: variant.sku || null,
        });
      }

      // --- IMAGES: Upload to Cloudinary and save image docs ---
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          try {
            const imageUrl = await uploadToCloudinary(file, "product_images", [
              { width: 800, height: 800, crop: "limit" },
            ]);
            await ProductImage.create({
              product_id: newProduct._id,
              image_data: imageUrl,
              is_primary: i === 0,
            });
          } catch (err) {
            console.error("Image upload failed for product:", err);
          }
        }
      }

      sendJson(res, { message: "Product added successfully" });
    } catch (error) {
      sendError(res, error.message);
    }
  },
];

const updateProduct = [
  upload.array("product_images", 4),
  async (req, res) => {
    if (!req.user || !req.user.vendorId)
      return sendError(res, "Unauthorized", 401);
    const vendorId = req.user.vendorId;
    const productId = req.params.productId;
    const {
      product_name,
      product_category,
      product_type,
      product_description,
      stock_status,
      deletedImages, // Array of image IDs to delete
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

      // 2. Handle Variants (Delete all and recreate)
      // This is simpler than matching. Old orders preserve data in OrderItem.
      if (req.body.variants) {
        let parsedVariants = [];
        try {
          parsedVariants = JSON.parse(req.body.variants);
        } catch (err) {
          parsedVariants = [];
        }

        if (parsedVariants.length > 0) {
          await ProductVariant.deleteMany({ product_id: productId });
          for (const variant of parsedVariants) {
            await ProductVariant.create({
              product_id: productId,
              size: variant.size || null,
              color: variant.color || null,
              regular_price: parseFloat(variant.regular_price) || 0,
              sale_price: variant.sale_price
                ? parseFloat(variant.sale_price)
                : null,
              stock_quantity: parseInt(variant.stock_quantity) || 0,
              sku: variant.sku || null,
            });
          }
        }
      }

      // 3. Handle Images
      // A. Delete removed images
      if (deletedImages) {
        const idsToDelete = Array.isArray(deletedImages)
          ? deletedImages
          : [deletedImages];
        await ProductImage.deleteMany({
          _id: { $in: idsToDelete },
          product_id: productId,
        });
        // Optional: Delete from Cloudinary if you stored public_id
      }

      // B. Add new images
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          try {
            const imageUrl = await uploadToCloudinary(file, "product_images", [
              { width: 800, height: 800, crop: "limit" },
            ]);
            await ProductImage.create({
              product_id: productId,
              image_data: imageUrl,
              is_primary: false, // You might want logic to set primary if no images exist
            });
          } catch (err) {
            console.error("Image upload failed:", err);
          }
        }
      }

      sendJson(res, { message: "Product updated successfully" });
    } catch (error) {
      console.error("Update product error:", error);
      sendError(res, "Server error");
    }
  },
];

const getProductForEdit = async (req, res) => {
  if (!req.user || !req.user.vendorId)
    return sendError(res, "Unauthorized", 401);
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      vendor_id: req.user.vendorId,
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
    if (!req.user || !req.user.vendorId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const vendorId = req.user.vendorId;
    const statusFilter = req.query.status;

    // 1. Find all order IDs associated with this vendor
    const matchStage = { vendor_id: new mongoose.Types.ObjectId(vendorId) };

    // Note: We can't filter by order status here yet because status is on the Order, not OrderItem
    // So we first get the order IDs, then filter in the Order lookup

    const orders = await OrderItem.aggregate([
      { $match: matchStage },
      { $group: { _id: "$order_id" } }, // Unique orders
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      // Filter by status if provided
      // Filter by status if provided
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
      {
        $lookup: {
          from: "customers",
          localField: "order.customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: { $toString: "$order._id" },
          total: "$order.total_amount",
          order_date: "$order.order_date",
          timeline: "$order.timeline", // Added timeline
          status: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$order.status", "confirmed"] },
                  then: "Confirmed",
                },
                {
                  case: { $eq: ["$order.status", "pending"] },
                  then: "Pending",
                },
              ],
              default: "$order.status",
            },
          },
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
    // 1. Get Customer Details
    const customer = await User.findById(customerId).select("-password");
    if (!customer) return sendError(res, "Customer not found", 404);

    // 2. Get Orders for this Customer & Vendor
    const orders = await OrderItem.aggregate([
      {
        $match: {
          vendor_id: new mongoose.Types.ObjectId(vendorId),
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

    // 3. Calculate Summary
    const totalOrders = new Set(orders.map((o) => o.order_id.toString())).size;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    // Calculate Most Purchased
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

    // Group items by Order ID for display
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
        avgOrderValue: (totalOrders ? totalRevenue / totalOrders : 0).toFixed(
          2
        ),
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
  if (!req.user || !req.user.vendorId)
    return sendError(res, "Unauthorized", 401);
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "customer_id"
    );
    if (!order) return sendError(res, "Order not found", 404);

    const items = await OrderItem.find({ order_id: req.params.orderId });

    const platformCharge = order.total_amount - order.subtotal;

    const orderData = {
      order_id: order._id,
      status: order.status === "Confirmed" ? "Confirmed" : order.status,
      order_date: order.order_date,
      shipped_at: order.shipped_at,
      delivered_at: order.delivered_at,
      cancelled_at: order.cancelled_at,
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

    if (!req.user || !req.user.vendorId) {
      return sendError(res, "Unauthorized", 401);
    }
    const vendorId = req.user.vendorId;

    // REMOVED "Pending" completely
    const validStatuses = ["Confirmed", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return sendError(res, "Invalid status", 400);
    }

    const updateFields = { status };

    // Save timestamps
    if (status === "Confirmed") updateFields.Confirmed_at = new Date();
    if (status === "Shipped") updateFields.shipped_at = new Date();
    if (status === "Delivered") updateFields.delivered_at = new Date();
    if (status === "Cancelled") updateFields.cancelled_at = new Date();

    // Add to timeline
    updateFields.$push = {
      timeline: {
        status,
        date: new Date(),
        description:
          status === "Shipped"
            ? "Your order has been shipped."
            : status === "Delivered"
            ? "Your order has been delivered."
            : status === "Cancelled"
            ? "Your order has been cancelled."
            : "Order Confirmed by seller.",
      },
    };

    // 1. Verify that the vendor has items in this order
    const hasItem = await OrderItem.findOne({
      order_id: orderId,
      vendor_id: vendorId,
    });

    if (!hasItem) {
      return sendError(res, "Unauthorized: You do not own this order", 403);
    }

    // 2. Update the Order (Order model does not have vendor_id)
    const order = await Order.findByIdAndUpdate(orderId, updateFields, {
      new: true,
    }).populate("customer_id", "name email phone");

    if (!order) {
      return sendError(res, "Order not found", 404);
    }

    // Format response to match frontend expectations
    const formattedOrder = {
      id: order._id.toString(),
      order_id: order._id.toString(), // Fallback
      customer: {
        name: order.customer_id?.name || "Guest",
        email: order.customer_id?.email,
        phone: order.customer_id?.phone,
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
        $match: { vendor_id: new mongoose.Types.ObjectId(vendorId) },
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
  if (!req.user || !req.user.vendorId)
    return sendError(res, "Unauthorized", 401);
  const { storeName, ownerName, email, phone, address, description } = req.body;
  try {
    await Vendor.findByIdAndUpdate(req.user.vendorId, {
      store_name: storeName,
      name: ownerName,
      email,
      contact_number: phone,
      store_location: address,
      description,
    });
    // Update token if you want to return updated store_name in token; for now just return the response
    sendJson(res, { message: "Profile updated" });
  } catch (error) {
    sendError(res, "Update failed");
  }
};

const deleteProduct = async (req, res) => {
  if (!req.user || !req.user.vendorId)
    return sendError(res, "Unauthorized", 401);

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

    const productMatch = await Order.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(orderId) } },
      {
        $lookup: {
          from: "orderitems",
          localField: "_id",
          foreignField: "order_id",
          as: "order_items",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "order_items.product_id",
          foreignField: "_id",
          as: "products",
        },
      },
      {
        $match: { "products.vendor_id": new mongoose.Types.ObjectId(vendorId) },
      },
    ]);
    if (!productMatch.length) return sendError(res, "Unauthorized", 403);

    await Order.deleteOne({ _id: orderId });
    await OrderItem.deleteMany({ order_id: orderId });
    res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    sendError(res, "Server error");
  }
};

const deleteSelectedOrders = async (req, res) => {
  if (!req.user || !req.user.vendorId)
    return sendError(res, "Unauthorized", 401);
  const vendorId = req.user.vendorId;
  const { orderIds } = req.body;

  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    return sendError(res, "No orders selected", 400);
  }
  try {
    await Order.deleteMany({ _id: { $in: orderIds } });
    await OrderItem.deleteMany({ order_id: { $in: orderIds } });
    res.status(200).json({ success: true, message: "Selected orders deleted" });
  } catch (error) {
    sendError(res, "Server error");
  }
};

// --- UPDATED: DASHBOARD FOR REACT (RETURNS JSON) ---
const getVendorDashboard = async (req, res) => {
  if (!req.user) return sendError(res, "Unauthorized", 401);
  const vendorId = req.user.vendorId || req.user.eventManagerId;

  try {
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return sendError(res, "Invalid Vendor ID", 400);
    }
    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

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
          "order.status": { $in: ["Confirmed", "Shipped", "Delivered"] },
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

    // 2. New Orders (Pending)
    const newOrdersStats = await OrderItem.aggregate([
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
      { $match: { "order.status": "Confirmed" } },
      { $group: { _id: "$order._id" } },
      { $count: "count" },
    ]);

    // 3. Recent Orders
    const recentOrders = await OrderItem.aggregate([
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

    // 4. Monthly Stats for Percentage Change
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
            "order.status": { $in: ["Confirmed", "Shipped", "Delivered"] },
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
      recentOrders: recentOrders.map((o) => ({
        ...o,
        id: o.id.toString(),
      })),
    };

    sendJson(res, { stats });
  } catch (error) {
    console.error("Dashboard Error:", error);
    sendError(res, "Server error");
  }
};
const vendorController = {
  serviceProviderLogin,
  logout,
  storeSignup,
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

export default vendorController;
