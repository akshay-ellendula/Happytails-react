/**
 * @swagger
 * tags:
 *   - name: Vendors
 *     description: Vendor profile, dashboard, and analytics APIs
 *   - name: Vendor Products
 *     description: Vendor product management APIs
 *   - name: Vendor Orders
 *     description: Vendor order management APIs
 *   - name: Vendor Customers
 *     description: Vendor customer analytics APIs
 */

/**
 * @swagger
 * /api/vendors/logout:
 *   post:
 *     summary: Clear the vendor auth cookie
 *     tags: [Vendors]
 *     security: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Logged out successfully"
 */

/**
 * @swagger
 * /api/vendors/dashboard:
 *   get:
 *     summary: Get dashboard metrics for the current vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               stats:
 *                 insights:
 *                   peakHours: "6 PM to 9 PM"
 *                   bestDay: "Saturday"
 *                   customerGrowth: "+25% new customers this month"
 *                 totalRevenue: "12450.00"
 *                 productsSold:
 *                   total: 240
 *                   month: 58
 *                   week: 15
 *                   today: 4
 *                 revenueOrderCount:
 *                   total: 92
 *                   month: 21
 *                   week: 6
 *                   today: 2
 *                 totalCustomers: 67
 *                 newOrders: 5
 *                 activeOrders: 12
 *                 totalOrders: 96
 *                 monthRevenue: "3140.00"
 *                 weekRevenue: "680.00"
 *                 todayRevenue: "120.00"
 *                 todayOrderCount: 2
 *                 topProducts:
 *                   - product_id: "67f11c8ab8f4472fdd5be201"
 *                     product_name: "Premium Dog Food"
 *                     revenue: 3200
 *                     quantity: 38
 *                 revenueChange: "18.5"
 *                 productsSoldChange: "9.4"
 *                 recentOrders:
 *                   - id: "67f11c8ab8f4472fdd5be301"
 *                     customer_name: "Jane Doe"
 *                     total: 999
 *                     status: "Pending"
 */

/**
 * @swagger
 * /api/vendors/profile:
 *   get:
 *     summary: Get the current vendor profile
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendor profile returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               vendor:
 *                 store_name: "Happy Paws Store"
 *                 owner_name: "Akshay"
 *                 email: "vendor@gmail.com"
 *                 phone: "9876543210"
 *                 address: "Chennai"
 *                 description: "Accessories and pet nutrition"
 *                 createdAt: "2026-01-18T10:30:00.000Z"
 *   put:
 *     summary: Update the current vendor profile
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeName:
 *                 type: string
 *               ownerName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Profile updated"
 */

/**
 * @swagger
 * /api/vendors/change-password:
 *   put:
 *     summary: Change or set the vendor password
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Password updated successfully"
 *       401:
 *         description: Current password is incorrect
 */

/**
 * @swagger
 * /api/vendors/analytics:
 *   get:
 *     summary: Get revenue and order analytics for the current vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               analytics:
 *                 revenue:
 *                   total: "12450.00"
 *                   today: "120.00"
 *                   week: "680.00"
 *                   month: "3140.00"
 *                 orders:
 *                   total: 96
 *                   today: 2
 *                   week: 6
 *                   month: 21
 *                 avgOrderValue:
 *                   total: "129.69"
 *                   month: "149.52"
 */

/**
 * @swagger
 * /api/vendors/products/top3:
 *   get:
 *     summary: Get the top 3 best-performing vendor products
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top products returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               topProducts:
 *                 - product_id: "67f11c8ab8f4472fdd5be201"
 *                   product_name: "Premium Dog Food"
 *                   revenue: 3200
 *                   quantity: 38
 *                   image: "https://res.cloudinary.com/demo/image/upload/product-main.jpg"
 */

/**
 * @swagger
 * /api/vendors/products/all-sorted:
 *   get:
 *     summary: Get all vendor products sorted by sales volume
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional category filter. Use `all` to disable filtering.
 *     responses:
 *       200:
 *         description: Sorted products returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               products:
 *                 - id: "67f11c8ab8f4472fdd5be201"
 *                   product_name: "Premium Dog Food"
 *                   category: "Nutrition"
 *                   regular_price: 1200
 *                   sale_price: 999
 *                   price: 999
 *                   stock: 18
 *                   added_date: "2026-03-20T09:00:00.000Z"
 *                   totalSold: 38
 *                   image: "https://res.cloudinary.com/demo/image/upload/product-main.jpg"
 *               categories: ["Nutrition", "Toys"]
 */

/**
 * @swagger
 * /api/vendors/products:
 *   get:
 *     summary: Get products owned by the current vendor
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         required: false
 *         schema:
 *           type: string
 *           enum: [oldest, price_asc, price_desc]
 *     responses:
 *       200:
 *         description: Product list returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               products:
 *                 - _id: "67f11c8ab8f4472fdd5be201"
 *                   product_name: "Premium Dog Food"
 *                   product_category: "Nutrition"
 *                   variants:
 *                     - regular_price: 1200
 *                       sale_price: 999
 *                       stock_quantity: 18
 *                   images:
 *                     - image_data: "https://res.cloudinary.com/demo/image/upload/product-main.jpg"
 *   post:
 *     summary: Create a new vendor product
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [product_name, product_category, variants, product_images]
 *             properties:
 *               product_name:
 *                 type: string
 *                 description: Name of the product
 *               product_category:
 *                 type: string
 *                 description: Category of the product (e.g., "Food", "Toys", "Accessories")
 *               product_type:
 *                 type: string
 *                 description: Type of product
 *               product_description:
 *                 type: string
 *                 description: Detailed description of the product
 *               stock_status:
 *                 type: string
 *                 description: Stock status (e.g., "In Stock", "Out of Stock")
 *               variants:
 *                 type: string
 *                 description: JSON stringified array of variants. Each variant should have size, color (optional), regular_price, sale_price (optional), stock_quantity, and sku (optional)
 *                 example: '[{"size":"5kg","color":null,"regular_price":1200,"sale_price":999,"stock_quantity":18,"sku":"DOG-FOOD-001"},{"size":"10kg","color":null,"regular_price":2000,"sale_price":1699,"stock_quantity":12,"sku":"DOG-FOOD-002"}]'
 *               product_images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload up to 5 product images. First image will be set as primary/main image
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Product added successfully"
 *               productId: "67f11c8ab8f4472fdd5be201"
 *               product:
 *                 _id: "67f11c8ab8f4472fdd5be201"
 *                 product_name: "Premium Dog Food"
 *                 product_category: "Nutrition"
 *                 variants:
 *                   - _id: "67f11c8ab8f4472fdd5be202"
 *                     size: "5kg"
 *                     regular_price: 1200
 *                     sale_price: 999
 *                     stock_quantity: 18
 *                 images:
 *                   - _id: "67f11c8ab8f4472fdd5be203"
 *                     image_data: "https://res.cloudinary.com/demo/image/upload/product-001.jpg"
 *                     is_primary: true
 *                   - _id: "67f11c8ab8f4472fdd5be204"
 *                     image_data: "https://res.cloudinary.com/demo/image/upload/product-002.jpg"
 *                     is_primary: false
 */

/**
 * @swagger
 * /api/vendors/products/{productId}:
 *   get:
 *     summary: Get a vendor product for editing
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               product:
 *                 _id: "67f11c8ab8f4472fdd5be201"
 *                 product_name: "Premium Dog Food"
 *                 product_category: "Nutrition"
 *                 product_type: "Food"
 *                 product_description: "Balanced daily nutrition"
 *                 variants:
 *                   - size: "5kg"
 *                     regular_price: 1200
 *                     sale_price: 999
 *                     stock_quantity: 18
 *                 images:
 *                   - _id: "67f11c8ab8f4472fdd5be210"
 *                     image_data: "https://res.cloudinary.com/demo/image/upload/product-main.jpg"
 *                     is_primary: true
 *       404:
 *         description: Product not found
 *   put:
 *     summary: Update a vendor product
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               product_name:
 *                 type: string
 *                 description: Name of the product
 *               product_category:
 *                 type: string
 *                 description: Category of the product
 *               product_type:
 *                 type: string
 *                 description: Type of product
 *               product_description:
 *                 type: string
 *                 description: Detailed description of the product
 *               stock_status:
 *                 type: string
 *                 description: Stock status
 *               variants:
 *                 type: string
 *                 description: JSON stringified variant array
 *               deletedImages:
 *                 type: string
 *                 description: Comma-separated image IDs to delete from this product
 *               product_images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload up to 5 product images. You can add more images alongside existing ones. First new image will become primary if no primary exists
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Product updated successfully"
 *               productId: "67f11c8ab8f4472fdd5be201"
 *               product:
 *                 _id: "67f11c8ab8f4472fdd5be201"
 *                 product_name: "Premium Dog Food"
 *                 variants:
 *                   - size: "5kg"
 *                     regular_price: 1200
 *                     sale_price: 999
 *                 images:
 *                   - image_data: "https://res.cloudinary.com/demo/image/upload/product-001.jpg"
 *                     is_primary: true
 *                   - image_data: "https://res.cloudinary.com/demo/image/upload/product-002.jpg"
 *                     is_primary: false
 *       404:
 *         description: Product not found
 *   delete:
 *     summary: Delete a vendor product
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Product deleted"
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /api/vendors/orders:
 *   get:
 *     summary: Get orders containing the vendor's products
 *     tags: [Vendor Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional order status filter
 *     responses:
 *       200:
 *         description: Orders returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               orders:
 *                 - id: "67f11c8ab8f4472fdd5be301"
 *                   total: 999
 *                   order_date: "2026-03-30T10:30:00.000Z"
 *                   status: "Pending"
 *                   timeline:
 *                     - status: "Pending"
 *                       date: "2026-03-30T10:30:00.000Z"
 *                       description: "Order placed"
 *                   customer_name: "Jane Doe"
 *                   customer:
 *                     name: "Jane Doe"
 *                     email: "jane.doe@gmail.com"
 *                     phone: "9876543210"
 */

/**
 * @swagger
 * /api/vendors/orders/{orderId}:
 *   get:
 *     summary: Get details for a vendor-accessible order
 *     tags: [Vendor Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               order:
 *                 order_id: "67f11c8ab8f4472fdd5be301"
 *                 status: "Pending"
 *                 order_date: "2026-03-30T10:30:00.000Z"
 *                 payment_method: "Credit Card (**** 1234)"
 *                 payment_status: "Paid"
 *                 customer:
 *                   name: "Jane Doe"
 *                   email: "jane.doe@gmail.com"
 *                   phone: "9876543210"
 *                 items:
 *                   - product_name: "Premium Dog Food"
 *                     quantity: 1
 *                     price: 999
 *                     size: "5kg"
 *                     color: null
 *                 subtotal: "960.58"
 *                 platform_charge: "38.42"
 *                 total: 999
 *       404:
 *         description: Order not found
 *   delete:
 *     summary: Soft-delete a vendor-accessible order
 *     tags: [Vendor Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Order deleted successfully"
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /api/vendors/orders/{orderId}/status:
 *   put:
 *     summary: Update an order status
 *     tags: [Vendor Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Confirmed, Out for Delivery, Shipped, Delivered, Cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Status updated"
 *               order:
 *                 order_id: "67f11c8ab8f4472fdd5be301"
 *                 status: "Shipped"
 *                 customer_name: "Jane Doe"
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /api/vendors/orders/delete-batch:
 *   post:
 *     summary: Delete multiple vendor orders in one request
 *     tags: [Vendor Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderIds]
 *             properties:
 *               orderIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Orders deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Selected orders deleted"
 *       400:
 *         description: Invalid request body
 */

/**
 * @swagger
 * /api/vendors/customers:
 *   get:
 *     summary: Get customer analytics for the current vendor
 *     tags: [Vendor Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer list returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               customers:
 *                 - _id: "67f11c8ab8f4472fdd5bc001"
 *                   name: "Jane Doe"
 *                   email: "jane.doe@gmail.com"
 *                   total_orders: 4
 *                   total_spent: 3599
 */

/**
 * @swagger
 * /api/vendors/customers/all-sorted:
 *   get:
 *     summary: Get vendor customers sorted by total spending
 *     tags: [Vendor Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sorted customers returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               customers:
 *                 - id: "67f11c8ab8f4472fdd5bc001"
 *                   name: "Jane Doe"
 *                   email: "jane.doe@gmail.com"
 *                   joined_date: "2026-02-15T09:00:00.000Z"
 *                   totalSpent: 3599
 *                   orderCount: 4
 */

/**
 * @swagger
 * /api/vendors/customers/{customerId}:
 *   get:
 *     summary: Get details for a specific vendor customer
 *     tags: [Vendor Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer details returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               customer:
 *                 id: "67f11c8ab8f4472fdd5bc001"
 *                 name: "Jane Doe"
 *                 email: "jane.doe@gmail.com"
 *                 phone: "9876543210"
 *                 address:
 *                   city: "Chennai"
 *                   pincode: "600001"
 *                 joined: "3/15/2026"
 *               summary:
 *                 totalOrders: 4
 *                 totalRevenue: "3599.00"
 *                 avgOrderValue: "899.75"
 *                 lastPurchase: "3/30/2026"
 *                 mostPurchased: "Premium Dog Food"
 *               orders:
 *                 - order_id: "67f11c8ab8f4472fdd5be301"
 *                   date: "3/30/2026"
 *                   status: "Pending"
 *                   items: "Premium Dog Food (x1)"
 *                   total: "999.00"
 *       404:
 *         description: Customer not found
 */
