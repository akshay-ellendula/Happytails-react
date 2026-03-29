/**
 * @swagger
 * tags:
 *   - name: Admin Dashboard
 *     description: Admin dashboard and platform-wide analytics
 *   - name: Admin Customers
 *     description: Admin customer management endpoints
 *   - name: Admin Vendors
 *     description: Admin vendor management endpoints
 *   - name: Admin Products
 *     description: Admin product management endpoints
 *   - name: Admin Event Managers
 *     description: Admin event manager management endpoints
 *   - name: Admin Events
 *     description: Admin event management endpoints
 *   - name: Admin Orders
 *     description: Admin order management endpoints
 */

/**
 * @swagger
 * /api/admin/logout:
 *   get:
 *     summary: Log out the current admin
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Logged out"
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get admin dashboard summary statistics
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               stats:
 *                 totalUsers: 128
 *                 totalVendors: 14
 *                 totalEventManagers: 9
 *                 totalEvents: 33
 *                 totalRevenue: 18450
 *                 monthlyRevenue: 4320
 *                 weeklyRevenue: 980
 *                 dailyRevenue: 120
 */

/**
 * @swagger
 * /api/admin/revenue-chart:
 *   get:
 *     summary: Get admin revenue chart data
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue chart data returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               chartData:
 *                 labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
 *                 orderRevenue: [320, 410, 505, 620, 580, 690, 710, 740, 810, 920, 870, 980]
 *                 eventRevenue: [180, 210, 250, 290, 300, 330, 360, 420, 390, 470, 450, 520]
 */

/**
 * @swagger
 * /api/admin/customers/top-spenders:
 *   get:
 *     summary: Get top-spending customers
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top spenders returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               topSpenders:
 *                 - id: "67f11c8ab8f4472fdd5bc001"
 *                   name: "Jane Doe"
 *                   email: "jane.doe@gmail.com"
 *                   spentOnProducts: 640
 *                   spentOnEvents: 120
 *                   totalSpent: 760
 */

/**
 * @swagger
 * /api/admin/customers/with-revenue:
 *   get:
 *     summary: Get customers enriched with revenue data
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customers with revenue returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               users:
 *                 - id: "67f11c8ab8f4472fdd5bc001"
 *                   name: "Jane Doe"
 *                   email: "jane.doe@gmail.com"
 *                   joined_date: "2026-02-15T09:00:00.000Z"
 *                   revenue: 76
 *                   spentOnProducts: 640
 *                   spentOnEvents: 120
 *                   totalSpent: 760
 */

/**
 * @swagger
 * /api/admin/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customers returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               users:
 *                 - id: "67f11c8ab8f4472fdd5bc001"
 *                   name: "Jane Doe"
 *                   email: "jane.doe@gmail.com"
 *                   joined_date: "2026-02-15T09:00:00.000Z"
 */

/**
 * @swagger
 * /api/admin/customers/stats:
 *   get:
 *     summary: Get customer statistics
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer statistics returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               stats:
 *                 total: 128
 *                 monthly: 24
 *                 weekly: 7
 *                 daily: 2
 */

/**
 * @swagger
 * /api/admin/customers/latest:
 *   get:
 *     summary: Get the latest customers
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest customers returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               users:
 *                 - id: "67f11c8ab8f4472fdd5bc001"
 *                   name: "Jane Doe"
 *                   email: "jane.doe@gmail.com"
 *                   joined_date: "2026-02-15T09:00:00.000Z"
 */

/**
 * @swagger
 * /api/admin/customers/{id}:
 *   get:
 *     summary: Get a customer by id
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               Customer:
 *                 id: "67f11c8ab8f4472fdd5bc001"
 *                 name: "Jane Doe"
 *                 email: "jane.doe@gmail.com"
 *                 phone: "9876543210"
 *                 address: "22, Lake View Road, Chennai - 600001"
 *                 joined_date: "3/15/2026"
 *                 profile_pic: "https://avatar-api-theta.vercel.app/17.png"
 *               purchaseHistory:
 *                 - productId: "67f11c8ab8f4472fdd5be201"
 *                   productName: "Premium Dog Food"
 *                   purchaseDate: "3/30/2026"
 *                   price: "$999.00"
 *               eventHistory:
 *                 - eventId: "67f11c8ab8f4472fdd5bd101"
 *                   eventName: "Pet Adoption Camp"
 *                   date: "4/1/2026"
 *                   location: "City Hall"
 *                   status: "Registered"
 *       404:
 *         description: Customer not found
 *   put:
 *     summary: Update a customer
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               houseNumber:
 *                 type: string
 *               streetNo:
 *                 type: string
 *               city:
 *                 type: string
 *               pincode:
 *                 type: string
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Customer updated successfully"
 *   delete:
 *     summary: Delete a customer
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Customer deleted successfully"
 *       404:
 *         description: Customer not found
 */

/**
 * @swagger
 * /api/admin/vendors/top-vendors:
 *   get:
 *     summary: Get top-performing vendors
 *     tags: [Admin Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top vendors returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               topVendors:
 *                 - id: "67f11c8ab8f4472fdd5bb501"
 *                   name: "Akshay"
 *                   store_name: "Happy Paws Store"
 *                   email: "vendor@gmail.com"
 *                   totalSales: 15400
 */

/**
 * @swagger
 * /api/admin/vendors/with-revenue:
 *   get:
 *     summary: Get vendors enriched with revenue data
 *     tags: [Admin Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendors with revenue returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               vendors:
 *                 - id: "67f11c8ab8f4472fdd5bb501"
 *                   name: "Akshay"
 *                   email: "vendor@gmail.com"
 *                   store_name: "Happy Paws Store"
 *                   store_location: "Chennai"
 *                   joined_date: "2026-01-20T11:00:00.000Z"
 *                   revenue: 15400
 */

/**
 * @swagger
 * /api/admin/vendors:
 *   get:
 *     summary: Get all vendors
 *     tags: [Admin Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendors returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               vendors:
 *                 - id: "67f11c8ab8f4472fdd5bb501"
 *                   name: "Akshay"
 *                   email: "vendor@gmail.com"
 *                   store_name: "Happy Paws Store"
 *                   store_location: "Chennai"
 *                   joined_date: "2026-01-20T11:00:00.000Z"
 */

/**
 * @swagger
 * /api/admin/vendors/stats:
 *   get:
 *     summary: Get vendor statistics
 *     tags: [Admin Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendor statistics returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               stats:
 *                 total: 14
 *                 totalRevenue: 8210
 *                 totalOrders: 182
 *                 todaysOrders: 7
 *                 totalGrowthPercent: 14.3
 *                 revenueGrowthPercent: 8.5
 *                 ordersGrowthPercent: 14.3
 *                 todaysOrdersChange: 16.7
 */

/**
 * @swagger
 * /api/admin/vendors/latest:
 *   get:
 *     summary: Get the latest vendors
 *     tags: [Admin Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest vendors returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               vendors:
 *                 - id: "67f11c8ab8f4472fdd5bb501"
 *                   name: "Akshay"
 *                   email: "vendor@gmail.com"
 *                   joined_date: "2026-01-20T11:00:00.000Z"
 */

/**
 * @swagger
 * /api/admin/vendors/{id}:
 *   get:
 *     summary: Get a vendor by id
 *     tags: [Admin Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               vendor:
 *                 id: "67f11c8ab8f4472fdd5bb501"
 *                 name: "Akshay"
 *                 email: "vendor@gmail.com"
 *                 contact_number: "+919876543210"
 *                 store_name: "Happy Paws Store"
 *                 store_location: "Chennai"
 *                 joined_date: "1/20/2026"
 *       404:
 *         description: Vendor not found
 *   put:
 *     summary: Update a vendor
 *     tags: [Admin Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               contact_number:
 *                 type: string
 *               store_name:
 *                 type: string
 *               store_location:
 *                 type: string
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Vendor updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Vendor updated successfully"
 *   delete:
 *     summary: Delete a vendor
 *     tags: [Admin Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Vendor deleted successfully"
 *       404:
 *         description: Vendor not found
 */

/**
 * @swagger
 * /api/admin/vendors/{id}/revenue:
 *   get:
 *     summary: Get revenue metrics for a vendor
 *     tags: [Admin Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor revenue metrics returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               metrics:
 *                 today_revenue: 120
 *                 weekly_revenue: 680
 *                 monthly_revenue: 3140
 *                 total_revenue: 12450
 *                 monthly_breakdown:
 *                   - month: "2026-03"
 *                     total_sales: 3140
 *                     orders: 21
 *                     avg_order_value: 149.52
 */

/**
 * @swagger
 * /api/admin/vendors/{id}/products:
 *   get:
 *     summary: Get products owned by a vendor
 *     tags: [Admin Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor products returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               products:
 *                 - product_id: "67f11c8ab8f4472fdd5be201"
 *                   product_name: "Premium Dog Food"
 *                   category: "Nutrition"
 *                   price: 999
 *                   stock: 18
 */

/**
 * @swagger
 * /api/admin/vendors/{id}/top-customers:
 *   get:
 *     summary: Get top customers for a vendor
 *     tags: [Admin Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor top customers returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               customers:
 *                 - customer_id: "67f11c8ab8f4472fdd5bc001"
 *                   customer_name: "Jane Doe"
 *                   total_orders: 4
 *                   total_spent: 3599
 *                   last_purchase: "2026-03-30T10:30:00.000Z"
 */

/**
 * @swagger
 * /api/admin/products/top-ordered:
 *   get:
 *     summary: Get the most ordered products
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top ordered products returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               topOrderedProducts:
 *                 - _id: "67f11c8ab8f4472fdd5be201"
 *                   product_name: "Premium Dog Food"
 *                   category: "Nutrition"
 *                   totalOrdered: 38
 */

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Get all products
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Products returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               products:
 *                 - id: "67f11c8ab8f4472fdd5be201"
 *                   product_name: "Premium Dog Food"
 *                   category: "Nutrition"
 *                   price: 999
 *                   stock: 18
 *                   added_date: "2026-03-20T09:00:00.000Z"
 *                   vendor: "Happy Paws Store"
 */

/**
 * @swagger
 * /api/admin/products/stats:
 *   get:
 *     summary: Get product statistics
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product statistics returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               stats:
 *                 total: 58
 *                 totalLastMonth: 49
 *                 inStock: 47
 *                 inStockLastMonth: 40
 *                 lowStock: 6
 *                 lowStockLastWeek: 4
 *                 outOfStock: 5
 *                 outOfStockYesterday: 4
 */

/**
 * @swagger
 * /api/admin/products/with-revenue:
 *   get:
 *     summary: Get products enriched with revenue data
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Products with revenue returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               products:
 *                 - id: "67f11c8ab8f4472fdd5be201"
 *                   product_name: "Premium Dog Food"
 *                   category: "Nutrition"
 *                   price: 999
 *                   stock: 18
 *                   added_date: "2026-03-20T09:00:00.000Z"
 *                   vendor: "Happy Paws Store"
 *                   revenue: 12450
 *                   totalOrders: 21
 */

/**
 * @swagger
 * /api/admin/products/add:
 *   post:
 *     summary: Create a new product as admin
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               product_name:
 *                 type: string
 *               product_category:
 *                 type: string
 *               product_type:
 *                 type: string
 *               product_description:
 *                 type: string
 *               stock_status:
 *                 type: string
 *               variants:
 *                 type: string
 *                 description: JSON stringified variant array
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Product added successfully"
 *               redirect: "/admin-products"
 */

/**
 * @swagger
 * /api/admin/products/{id}:
 *   get:
 *     summary: Get a product by id
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *                 id: "67f11c8ab8f4472fdd5be201"
 *                 product_name: "Premium Dog Food"
 *                 product_category: "Nutrition"
 *                 product_type: "Food"
 *                 product_description: "Balanced daily nutrition"
 *                 image: "https://res.cloudinary.com/demo/image/upload/product-main.jpg"
 *                 regular_price: 1200
 *                 stock_quantity: 18
 *                 sku: "DOG-FOOD-001"
 *                 vendor:
 *                   store_name: "Happy Paws Store"
 *                   email: "vendor@gmail.com"
 *                 variants:
 *                   - size: "5kg"
 *                     regular_price: 1200
 *                     sale_price: 999
 *                     stock_quantity: 18
 *       404:
 *         description: Product not found
 *   put:
 *     summary: Update a product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               product_category:
 *                 type: string
 *               product_type:
 *                 type: string
 *               product_description:
 *                 type: string
 *               stock_status:
 *                 type: string
 *               variants:
 *                 type: string
 *               deletedImages:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Product updated successfully"
 *               redirect: "/admin-products"
 *   delete:
 *     summary: Delete a product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               message: "Product deleted successfully"
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /api/admin/products/{id}/data:
 *   get:
 *     summary: Get aggregated product performance data
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product analytics returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               metrics:
 *                 totalSales: 38
 *                 revenue: 11703
 *                 uniqueCustomers: 21
 */

/**
 * @swagger
 * /api/admin/products/{id}/customers:
 *   get:
 *     summary: Get customers who purchased a product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product customers returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               customers:
 *                 - order_id: "67f11c8ab8f4472fdd5be301"
 *                   customer_name: "Jane Doe"
 *                   quantity: 1
 *                   date: "2026-03-30T10:30:00.000Z"
 */

/**
 * @swagger
 * /api/admin/event-managers/top-managers:
 *   get:
 *     summary: Get top-performing event managers
 *     tags: [Admin Event Managers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top event managers returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               topManagers:
 *                 - id: "67f11c8ab8f4472fdd5ba201"
 *                   name: "Veda"
 *                   email: "manager@gmail.com"
 *                   organization: "HappyTails Events"
 *                   totalRevenue: 8200
 */

/**
 * @swagger
 * /api/admin/event-managers:
 *   get:
 *     summary: Get all event managers
 *     tags: [Admin Event Managers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event managers returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               eventManagers:
 *                 - id: "67f11c8ab8f4472fdd5ba201"
 *                   name: "Veda"
 *                   email: "manager@gmail.com"
 *                   organization: "HappyTails Events"
 *                   phone: "9876543210"
 *                   joined_date: "2026-01-10T09:00:00.000Z"
 *                   profilePic: "https://avatar-api-theta.vercel.app/22.png"
 */

/**
 * @swagger
 * /api/admin/event-managers/stats:
 *   get:
 *     summary: Get event manager statistics
 *     tags: [Admin Event Managers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event manager statistics returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               stats:
 *                 total: 9
 *                 managerGrowthPercent: 12.5
 *                 revenue: 18400
 *                 revenueGrowthPercent: 0
 *                 totalEvents: 33
 *                 eventsGrowthPercent: 0
 *                 todayEvents: 2
 *                 todayEventsChange: 0
 */

/**
 * @swagger
 * /api/admin/event-managers/with-revenue:
 *   get:
 *     summary: Get event managers enriched with revenue data
 *     tags: [Admin Event Managers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event managers with revenue returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               eventManagers:
 *                 - id: "67f11c8ab8f4472fdd5ba201"
 *                   name: "Veda"
 *                   email: "manager@gmail.com"
 *                   organization: "HappyTails Events"
 *                   phone: "9876543210"
 *                   joined_date: "2026-01-10T09:00:00.000Z"
 *                   profilePic: "https://avatar-api-theta.vercel.app/22.png"
 *                   revenue: 8200
 */

/**
 * @swagger
 * /api/admin/event-managers/{id}:
 *   get:
 *     summary: Get an event manager by id
 *     tags: [Admin Event Managers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event manager returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               manager:
 *                 id: "67f11c8ab8f4472fdd5ba201"
 *                 name: "Veda"
 *                 email: "manager@gmail.com"
 *                 organization: "HappyTails Events"
 *                 phone: "9876543210"
 *                 joined_date: "2026-01-10T09:00:00.000Z"
 *                 profilePic: "https://avatar-api-theta.vercel.app/22.png"
 *       404:
 *         description: Event manager not found
 *   put:
 *     summary: Update an event manager
 *     tags: [Admin Event Managers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               organization:
 *                 type: string
 *               phone:
 *                 type: string
 *               profilePicFile:
 *                 type: string
 *                 format: binary
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Event manager updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               manager:
 *                 id: "67f11c8ab8f4472fdd5ba201"
 *                 name: "Veda"
 *                 email: "manager@gmail.com"
 *                 organization: "HappyTails Events"
 *                 phone: "9876543210"
 *                 profilePic: "https://avatar-api-theta.vercel.app/22.png"
 *   delete:
 *     summary: Delete an event manager
 *     tags: [Admin Event Managers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event manager deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Event manager, events, and tickets deleted successfully"
 *       404:
 *         description: Event manager not found
 */

/**
 * @swagger
 * /api/admin/event-managers/{id}/metrics:
 *   get:
 *     summary: Get revenue and performance metrics for an event manager
 *     tags: [Admin Event Managers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event manager metrics returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               metrics:
 *                 upcoming: 3
 *                 weekly: 1
 *                 monthly: 2
 *                 totalRevenue: 8200
 *                 monthly_breakdown:
 *                   - month: "2026-03"
 *                     total_events: 2
 *                     attendees: 0
 *                     avg_attendance: 0
 */

/**
 * @swagger
 * /api/admin/event-managers/{id}/upcoming-events:
 *   get:
 *     summary: Get upcoming events for an event manager
 *     tags: [Admin Event Managers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upcoming events returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               events:
 *                 - event_id: "67f11c8ab8f4472fdd5bd101"
 *                   event_name: "Pet Adoption Camp"
 *                   date: "2026-04-01T18:00:00.000Z"
 *                   location: "Chennai"
 *                   total_tickets: 100
 *                   tickets_sold: 20
 *                   status: "Available"
 */

/**
 * @swagger
 * /api/admin/event-managers/{id}/past-events:
 *   get:
 *     summary: Get past events for an event manager
 *     tags: [Admin Event Managers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Past events returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               events:
 *                 - event_id: "67f11c8ab8f4472fdd5bd001"
 *                   event_name: "Pet Wellness Meetup"
 *                   date: "2026-02-20T15:00:00.000Z"
 *                   attendees: 45
 */

/**
 * @swagger
 * /api/admin/events/top-events:
 *   get:
 *     summary: Get top-performing events
 *     tags: [Admin Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top events returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               topEvents:
 *                 - _id: "67f11c8ab8f4472fdd5bd101"
 *                   title: "Pet Adoption Camp"
 *                   venue: "City Hall"
 *                   totalRevenue: 8200
 */

/**
 * @swagger
 * /api/admin/events:
 *   get:
 *     summary: Get all events
 *     tags: [Admin Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Events returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 stats:
 *                   totalEvents: 33
 *                   upcomingEvents: 12
 *                   completedEvents: 21
 *                   ticketsSold: 184
 *                 events:
 *                   - id: "67f11c8ab8f4472fdd5bd101"
 *                     title: "Pet Adoption Camp"
 *                     date_time: "2026-04-01T18:00:00.000Z"
 *                     venue: "City Hall"
 *                     total_tickets: 100
 *                     tickets_sold: 20
 *                     managerName: "Veda"
 *                     event_manager_id:
 *                       _id: "67f11c8ab8f4472fdd5ba201"
 *                       userName: "Veda"
 *                       email: "manager@gmail.com"
 */

/**
 * @swagger
 * /api/admin/events/total:
 *   get:
 *     summary: Get the total number of events
 *     tags: [Admin Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event totals returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               total: 33
 */

/**
 * @swagger
 * /api/admin/events/revenue:
 *   get:
 *     summary: Get overall event revenue
 *     tags: [Admin Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event revenue returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               revenue: "1845.00"
 *               change: "+12%"
 */

/**
 * @swagger
 * /api/admin/events/with-revenue:
 *   get:
 *     summary: Get events enriched with revenue data
 *     tags: [Admin Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Events with revenue returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               events:
 *                 - id: "67f11c8ab8f4472fdd5bd101"
 *                   title: "Pet Adoption Camp"
 *                   date_time: "2026-04-01T18:00:00.000Z"
 *                   venue: "City Hall"
 *                   total_tickets: 100
 *                   tickets_sold: 20
 *                   managerName: "Veda"
 *                   revenue: 8200
 */

/**
 * @swagger
 * /api/admin/events/{id}:
 *   get:
 *     summary: Get an event by id
 *     tags: [Admin Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               event:
 *                 id: "67f11c8ab8f4472fdd5bd101"
 *                 title: "Pet Adoption Camp"
 *                 description: "Adopt lovely pets"
 *                 date_time: "2026-04-01T18:00:00.000Z"
 *                 venue: "City Hall"
 *                 total_tickets: 100
 *                 tickets_sold: 20
 *                 eventManagerId:
 *                   _id: "67f11c8ab8f4472fdd5ba201"
 *                   userName: "Veda"
 *                   email: "manager@gmail.com"
 *       404:
 *         description: Event not found
 *   put:
 *     summary: Update an event
 *     tags: [Admin Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               language:
 *                 type: string
 *               duration:
 *                 type: string
 *               ageLimit:
 *                 type: string
 *               ticketPrice:
 *                 type: number
 *               date_time:
 *                 type: string
 *                 format: date-time
 *               category:
 *                 type: string
 *               venue:
 *                 type: string
 *               location:
 *                 type: string
 *               total_tickets:
 *                 type: number
 *               phoneNumber:
 *                 type: string
 *               existing_thumbnail:
 *                 type: string
 *               existing_banner:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               banner:
 *                 type: string
 *                 format: binary
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Event updated successfully"
 *   delete:
 *     summary: Delete an event
 *     tags: [Admin Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Event and all associated tickets deleted successfully."
 *       404:
 *         description: Event not found
 */

/**
 * @swagger
 * /api/admin/events/{id}/attendees:
 *   get:
 *     summary: Get attendees for an event
 *     tags: [Admin Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event attendees returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               attendees:
 *                 - id: "67f11c8ab8f4472fdd5bf101"
 *                   ticketId: "TKT-12345"
 *                   name: "Jane Doe"
 *                   phone: "9876543210"
 *                   email: "jane.doe@gmail.com"
 *                   address: "22, Chennai"
 *                   seats: 2
 *                   with_pet: "Yes"
 *                   pet_name: "Bruno"
 *                   pet_breed: "Beagle"
 *                   pet_age: 18
 *                   registration_date: "3/30/2026"
 */

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               orders:
 *                 - orderId: "67f11c8ab8f4472fdd5be301"
 *                   customerName: "Jane Doe"
 *                   orderDate: "2026-03-30T10:30:00.000Z"
 *                   totalAmount: 999
 *                   status: "Pending"
 */

/**
 * @swagger
 * /api/admin/orders/stats:
 *   get:
 *     summary: Get order statistics
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statistics returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               stats:
 *                 totalOrders: 182
 *                 monthlyOrders: 44
 *                 weeklyOrders: 11
 *                 dailyOrders: 3
 */

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: Get order details by id
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *                 orderId: "67f11c8ab8f4472fdd5be301"
 *                 status: "Pending"
 *                 orderDate: "2026-03-30T10:30:00.000Z"
 *                 totalAmount: 999
 *                 paymentMethod: "Credit Card"
 *                 paymentLastFour: "1234"
 *                 customer:
 *                   name: "Jane Doe"
 *                   email: "jane.doe@gmail.com"
 *                   phone: "9876543210"
 *                   address: "22, Lake View Road, Chennai - 600001"
 *                 items:
 *                   - productId: "67f11c8ab8f4472fdd5be201"
 *                     productName: "Premium Dog Food"
 *                     vendorName: "Happy Paws Store"
 *                     price: 999
 *                     quantity: 1
 *       404:
 *         description: Order not found
 */
