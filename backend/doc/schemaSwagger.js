/**
 * @swagger
 * components:
 *   schemas:
 *     Vendor:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         contact_number:
 *           type: string
 *         email:
 *           type: string
 *         store_name:
 *           type: string
 *         store_location:
 *           type: string
 *         description:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "65abc12345"
 *         name: "Vendor Name"
 *         contact_number: "9876543210"
 *         email: "vendor@email.com"
 *         store_name: "Fresh Store"
 *         store_location: "Chennai"
 *         description: "Organic food vendor"
 */
/**
 * @swagger
 * components:
 *   schemas:
 *
 *     Admin:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userName:
 *           type: string
 *         email:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "6650ab123"
 *         userName: "Admin User"
 *         email: "admin@email.com"
 *
 *     StorePartner:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userName:
 *           type: string
 *         email:
 *           type: string
 *         contactnumber:
 *           type: string
 *         storename:
 *           type: string
 *         storelocation:
 *           type: string
 *         profilePic:
 *           type: string
 *         storeDescription:
 *           type: string
 *         isActive:
 *           type: boolean
 *       example:
 *         _id: "6650ab234"
 *         userName: "Store Owner"
 *         email: "store@email.com"
 *         contactnumber: "9876543210"
 *         storename: "Pet Store"
 *         storelocation: "Chennai"
 *         isActive: true
 *
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         customer_id:
 *           type: string
 *         order_date:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *         subtotal:
 *           type: number
 *         total_amount:
 *           type: number
 *         delivery_date:
 *           type: string
 *           format: date-time
 *         shipped_at:
 *           type: string
 *           format: date-time
 *         delivered_at:
 *           type: string
 *           format: date-time
 *         cancelled_at:
 *           type: string
 *           format: date-time
 *         payment_last_four:
 *           type: string
 *         is_deleted:
 *           type: boolean
 *         shippingAddress:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             houseNumber:
 *               type: string
 *             streetNo:
 *               type: string
 *             city:
 *               type: string
 *             pincode:
 *               type: string
 *         timeline:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *       example:
 *         _id: "6650ab345"
 *         customer_id: "6650ab111"
 *         status: "Pending"
 *         subtotal: 500
 *         total_amount: 550
 *
 *     OrderItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         order_id:
 *           type: string
 *         product_id:
 *           type: string
 *         variant_id:
 *           type: string
 *         vendor_id:
 *           type: string
 *         product_name:
 *           type: string
 *         quantity:
 *           type: number
 *         price:
 *           type: number
 *         size:
 *           type: string
 *         color:
 *           type: string
 *       example:
 *         _id: "6650ab456"
 *         order_id: "6650ab345"
 *         product_name: "Dog Toy"
 *         quantity: 2
 *         price: 250
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         ticketId:
 *           type: string
 *         eventId:
 *           type: string
 *         customerId:
 *           type: string
 *         contactName:
 *           type: string
 *         contactPhone:
 *           type: string
 *         contactEmail:
 *           type: string
 *         numberOfTickets:
 *           type: number
 *         price:
 *           type: number
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: boolean
 *         petName:
 *           type: string
 *         petBreed:
 *           type: string
 *         petAge:
 *           type: number
 *       example:
 *         _id: "6654bcf001"
 *         ticketId: "TKT-12345"
 *         eventId: "6654bcf002"
 *         customerId: "6654bcf003"
 *         contactName: "John Doe"
 *         contactPhone: "9876543210"
 *         contactEmail: "john@email.com"
 *         numberOfTickets: 2
 *         price: 500
 *         status: true
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         vendor_id:
 *           type: string
 *         product_name:
 *           type: string
 *         product_category:
 *           type: string
 *         product_type:
 *           type: string
 *         product_description:
 *           type: string
 *         sku:
 *           type: string
 *         stock_status:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         is_deleted:
 *           type: boolean
 *       example:
 *         _id: "6650abf1"
 *         vendor_id: "664fa234"
 *         product_name: "Dog Food Premium"
 *         product_category: "Food"
 *         product_type: "Dry Food"
 *         product_description: "Healthy dog food"
 *         sku: "DOG-FOOD-001"
 *         stock_status: "In Stock"
 *
 *     ProductVariant:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         product_id:
 *           type: string
 *         size:
 *           type: string
 *         color:
 *           type: string
 *         regular_price:
 *           type: number
 *         sale_price:
 *           type: number
 *         stock_quantity:
 *           type: number
 *
 *     ProductImage:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         product_id:
 *           type: string
 *         image_data:
 *           type: string
 *         is_primary:
 *           type: boolean
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         eventManagerId:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         language:
 *           type: string
 *         duration:
 *           type: string
 *         ageLimit:
 *           type: string
 *         ticketPrice:
 *           type: number
 *         date_time:
 *           type: string
 *           format: date-time
 *         category:
 *           type: string
 *         venue:
 *           type: string
 *         location:
 *           type: string
 *         total_tickets:
 *           type: number
 *         tickets_sold:
 *           type: number
 *         images:
 *           type: object
 *           properties:
 *             thumbnail:
 *               type: string
 *             banner:
 *               type: string
 *       example:
 *         _id: "66545abc001"
 *         eventManagerId: "66545abc002"
 *         title: "Pet Adoption Camp"
 *         description: "Adopt lovely pets"
 *         language: "English"
 *         duration: "3 Hours"
 *         ageLimit: "All"
 *         ticketPrice: 200
 *         date_time: "2026-04-01T18:00:00Z"
 *         category: "Pets"
 *         venue: "City Hall"
 *         location: "Chennai"
 *         total_tickets: 100
 *         tickets_sold: 20
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     EventManager:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userName:
 *           type: string
 *         email:
 *           type: string
 *         profilePic:
 *           type: string
 *         companyName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         isActive:
 *           type: boolean
 *       example:
 *         _id: "6650ab234"
 *         userName: "John Manager"
 *         email: "manager@email.com"
 *         profilePic: "/uploads/profile.jpg"
 *         companyName: "Pet Events Ltd"
 *         phoneNumber: "9876543210"
 *         isActive: true
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the customer
 *         userName:
 *           type: string
 *           description: The customer's username
 *         email:
 *           type: string
 *           description: The customer's email address
 *         profilePic:
 *           type: string
 *           description: URL or base64 string of the profile picture
 *         phoneNumber:
 *           type: string
 *           description: Contact number
 *         isActive:
 *           type: boolean
 *           description: Account status
 *         addresses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               houseNumber:
 *                 type: string
 *               streetNo:
 *                 type: string
 *               city:
 *                 type: string
 *               pincode:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *       example:
 *         _id: "65a12345bcdef67890"
 *         userName: "John Doe"
 *         email: "johndoe@gmail.com"
 *         phoneNumber: "1234567890"
 *         isActive: true
 */
