# HappyTails — Swagger API Reference

> **Swagger UI**: `http://localhost:5001/api-docs`
> Auto-generated from the `backend/doc/*Swagger.js` files.

---

## Roles Overview

| Role | Description |
|------|-------------|
| **Public** | No authentication required |
| **Customer** | Logged-in customer (pet owner / buyer) |
| **Vendor** | Store partner who sells products |
| **Event Manager** | Creates and manages events |
| **Admin** | Platform-wide management access |

---

## 1. Authentication (Public)

> Swagger file: [`doc/authSwagger.js`](doc/authSwagger.js)
> Route file: [`src/router/authRoutes.js`](src/router/authRoutes.js)
> Controller: [`src/controller/authControllers.js`](src/controller/authControllers.js)

| Method | Route | Summary | Used By |
|--------|-------|---------|---------|
| POST | `/api/auth/signup` | Register a customer account | Public |
| POST | `/api/auth/signin` | Sign in a customer | Public |
| POST | `/api/auth/logout` | Clear the auth cookie | Public |
| POST | `/api/auth/eventManagerSignup` | Register an event manager | Public |
| POST | `/api/auth/eventManagerSignin` | Sign in an event manager | Public |
| POST | `/api/auth/adminSignup` | Register an admin account | Public |
| POST | `/api/auth/adminSignin` | Sign in as admin | Public |
| POST | `/api/auth/storeSignup` | Register a vendor account | Public |
| POST | `/api/auth/storeSignin` | Sign in as vendor | Public |
| GET | `/api/auth/verify` | Check current auth state | Public |
| POST | `/api/auth/forgotpassword` | Send password reset link | Public |
| PUT | `/api/auth/resetpassword/{resetToken}` | Reset password with token | Public |
| GET | `/api/auth/google` | Start Google OAuth login | Public |
| GET | `/api/auth/google/callback` | Handle Google OAuth callback | Public |
| GET | `/api/auth/google/url` | Get Google OAuth URL | Public |

---

## 2. Customers

> Swagger file: [`doc/customerSwagger.js`](doc/customerSwagger.js)
> Route file: [`src/router/customerRoutes.js`](src/router/customerRoutes.js)
> Controller: [`src/controller/customerControllers.js`](src/controller/customerControllers.js)

| Method | Route | Summary | Used By |
|--------|-------|---------|---------|
| GET | `/api/public` | Get all customers | Customer |
| GET | `/api/public/{id}` | Get a customer by ID | Customer |
| PUT | `/api/public/{id}` | Update a customer | Customer |
| DELETE | `/api/public/{id}` | Delete a customer | Customer |
| PUT | `/api/public/changeStatus/{id}` | Toggle customer active status | Admin |

---

## 3. Products & Orders (Customer-facing)

> Swagger file: [`doc/productsSwagger.js`](doc/productsSwagger.js)
> Route file: [`src/router/productRoutes.js`](src/router/productRoutes.js)
> Controller: [`src/controller/productController.js`](src/controller/productController.js)

| Method | Route | Summary | Used By |
|--------|-------|---------|---------|
| GET | `/api/products/getProducts` | Get the public product catalog | Public |
| GET | `/api/products/getProduct/{id}` | Get public product details | Public |
| POST | `/api/products/checkout` | Start checkout | Customer |
| POST | `/api/products/create-payment-intent` | Create/reuse Stripe payment intent | Customer |
| POST | `/api/products/process-payment` | Complete payment for checkout session | Customer |
| GET | `/api/products/getUserOrders` | Get orders for the current customer | Customer |
| POST | `/api/products/orders/{orderId}/reorder` | Reorder a previous order | Customer |

---

## 4. Tickets

> Swagger file: [`doc/ticketsSwagger.js`](doc/ticketsSwagger.js)
> Route file: [`src/router/ticketRouter.js`](src/router/ticketRouter.js)
> Controller: [`src/controller/ticketControllers.js`](src/controller/ticketControllers.js)

| Method | Route | Summary | Used By |
|--------|-------|---------|---------|
| GET | `/api/tickets/admin/all` | Get all tickets (admin review) | Admin |
| GET | `/api/tickets/admin/{id}` | Get a single ticket by ID (admin) | Admin |
| GET | `/api/tickets/my-tickets` | Get tickets for the current customer | Customer |
| GET | `/api/tickets` | Get tickets for the current event manager | Event Manager |
| POST | `/api/tickets/create-payment-intent/{id}` | Create Stripe payment intent for ticket | Customer |
| POST | `/api/tickets/{id}` | Purchase tickets for an event | Customer |
| GET | `/api/tickets/{id}` | Get a single ticket (event manager) | Event Manager |
| DELETE | `/api/tickets/{id}` | Delete a ticket | Event Manager |

---

## 5. Events

> Swagger file: [`doc/eventsSwagger.js`](doc/eventsSwagger.js)
> Route file: [`src/router/eventRoutes.js`](src/router/eventRoutes.js)
> Controller: [`src/controller/eventController.js`](src/controller/eventController.js)

| Method | Route | Summary | Used By |
|--------|-------|---------|---------|
| GET | `/api/events/public` | Get public upcoming events | Public |
| GET | `/api/events` | Get events by current event manager | Event Manager |
| POST | `/api/events` | Create a new event | Event Manager |
| GET | `/api/events/{id}` | Get a single event | Public |
| PUT | `/api/events/{id}` | Update an event | Event Manager |
| DELETE | `/api/events/{id}` | Delete an event | Event Manager |
| GET | `/api/events/{id}/eventAnalytics` | Get analytics for a specific event | Event Manager |

---

## 6. Event Managers (Self-service)

> Swagger file: [`doc/eventManagerSwagger.js`](doc/eventManagerSwagger.js)
> Route file: [`src/router/eventManagerRoutes.js`](src/router/eventManagerRoutes.js)
> Controller: [`src/controller/eventManagerController.js`](src/controller/eventManagerController.js)

| Method | Route | Summary | Used By |
|--------|-------|---------|---------|
| GET | `/api/eventManagers/profile/me` | Get current event manager profile | Event Manager |
| PUT | `/api/eventManagers/profile/me` | Update current event manager profile | Event Manager |
| PUT | `/api/eventManagers/change-password` | Change event manager password | Event Manager |
| GET | `/api/eventManagers/events/attendees` | Get attendees across all events | Event Manager |
| GET | `/api/eventManagers/events/attendees/{id}` | Get attendees for a specific event | Event Manager |
| GET | `/api/eventManagers/events/my-events` | Get events owned by event manager | Event Manager |
| GET | `/api/eventManagers/revenue/my-revenue` | Get total revenue | Event Manager |
| PUT | `/api/eventManagers/changeStatus/{id}` | Toggle event manager active status | Admin |
| GET | `/api/eventManagers` | Get all event managers | Admin |
| GET | `/api/eventManagers/{id}` | Get an event manager by ID | Admin |
| PUT | `/api/eventManagers/{id}` | Update an event manager by ID | Admin |
| DELETE | `/api/eventManagers/{id}` | Delete an event manager | Admin |
| GET | `/api/eventManagers/events/{eventId}/details` | Get event details (manager view) | Event Manager |

---

## 7. Event Analytics (Event Manager Dashboard)

> Swagger file: [`doc/eventAnalyticsSwagger.js`](doc/eventAnalyticsSwagger.js)
> Route file: [`src/router/eventAnalyticsRoutes.js`](src/router/eventAnalyticsRoutes.js)
> Controller: [`src/controller/eventAnalyticsController.js`](src/controller/eventAnalyticsController.js)

| Method | Route | Summary | Used By |
|--------|-------|---------|---------|
| GET | `/api/eventAnalytics/dashboard` | Dashboard analytics overview | Event Manager |
| GET | `/api/eventAnalytics/revenue-trends` | Revenue trends over time | Event Manager |
| GET | `/api/eventAnalytics/event-types` | Event type distribution | Event Manager |
| GET | `/api/eventAnalytics/attendance` | Attendance analytics | Event Manager |
| GET | `/api/eventAnalytics/platform-fees` | Platform fee breakdown | Event Manager |
| GET | `/api/eventAnalytics/performance-metrics` | Performance metrics | Event Manager |

---

## 8. Vendors (Self-service)

> Swagger file: [`doc/vendorSwagger.js`](doc/vendorSwagger.js)
> Route file: [`src/router/vendorRoutes.js`](src/router/vendorRoutes.js)
> Controller: [`src/controller/vendorController.js`](src/controller/vendorController.js)

### Profile & Dashboard

| Method | Route | Summary | Used By |
|--------|-------|---------|---------|
| POST | `/api/vendors/logout` | Clear vendor auth cookie | Vendor |
| GET | `/api/vendors/dashboard` | Get dashboard metrics | Vendor |
| GET | `/api/vendors/profile` | Get current vendor profile | Vendor |
| PUT | `/api/vendors/profile` | Update current vendor profile | Vendor |
| PUT | `/api/vendors/change-password` | Change/set vendor password | Vendor |
| GET | `/api/vendors/analytics` | Revenue and order analytics | Vendor |

### Vendor Products

| Method | Route | Summary | Used By |
|--------|-------|---------|---------|
| GET | `/api/vendors/products/top3` | Top 3 best-performing products | Vendor |
| GET | `/api/vendors/products/all-sorted` | All products sorted by sales | Vendor |
| GET | `/api/vendors/products` | Get vendor's products | Vendor |
| POST | `/api/vendors/products` | Create a new product | Vendor |
| GET | `/api/vendors/products/{productId}` | Get a product for editing | Vendor |
| PUT | `/api/vendors/products/{productId}` | Update a product | Vendor |
| DELETE | `/api/vendors/products/{productId}` | Delete a product | Vendor |

### Vendor Orders

| Method | Route | Summary | Used By |
|--------|-------|---------|---------|
| GET | `/api/vendors/orders` | Get orders containing vendor's products | Vendor |
| GET | `/api/vendors/orders/{orderId}` | Get order details | Vendor |
| DELETE | `/api/vendors/orders/{orderId}` | Soft-delete an order | Vendor |
| PUT | `/api/vendors/orders/{orderId}/status` | Update order status | Vendor |
| POST | `/api/vendors/orders/delete-batch` | Delete multiple orders | Vendor |

### Vendor Customers

| Method | Route | Summary | Used By |
|--------|-------|---------|---------|
| GET | `/api/vendors/customers` | Customer analytics | Vendor |
| GET | `/api/vendors/customers/all-sorted` | Customers sorted by spending | Vendor |
| GET | `/api/vendors/customers/{customerId}` | Specific customer details | Vendor |

---

## 9. Admin Panel

> Swagger file: [`doc/adminSwagger.js`](doc/adminSwagger.js)
> Route file: [`src/router/adminRoutes.js`](src/router/adminRoutes.js)
> Controller: [`src/controller/adminController.js`](src/controller/adminController.js)

### Admin Dashboard

| Method | Route | Summary | Used By |
|--------|-------|---------|---------|
| GET | `/api/admin/logout` | Log out admin | Admin |
| GET | `/api/admin/stats` | Dashboard summary statistics | Admin |
| GET | `/api/admin/revenue-chart` | Revenue chart data | Admin |

### Admin → Customers

| Method | Route | Summary | Used By |
|--------|-------|---------|---------|
| GET | `/api/admin/customers/top-spenders` | Top-spending customers | Admin |
| GET | `/api/admin/customers/with-revenue` | Customers with revenue data | Admin |
| GET | `/api/admin/customers` | Get all customers | Admin |
| GET | `/api/admin/customers/stats` | Customer statistics | Admin |
| GET | `/api/admin/customers/latest` | Latest customers | Admin |
| GET | `/api/admin/customers/{id}` | Get customer by ID | Admin |
| PUT | `/api/admin/customers/{id}` | Update a customer | Admin |
| DELETE | `/api/admin/customers/{id}` | Delete a customer | Admin |

### Admin → Vendors

| Method | Route | Summary | Used By |
|--------|-------|---------|---------|
| GET | `/api/admin/vendors/top-vendors` | Top-performing vendors | Admin |
| GET | `/api/admin/vendors/with-revenue` | Vendors with revenue data | Admin |
| GET | `/api/admin/vendors` | Get all vendors | Admin |
| GET | `/api/admin/vendors/stats` | Vendor statistics | Admin |
| GET | `/api/admin/vendors/latest` | Latest vendors | Admin |
| GET | `/api/admin/vendors/{id}` | Get vendor by ID | Admin |
| PUT | `/api/admin/vendors/{id}` | Update a vendor | Admin |
| DELETE | `/api/admin/vendors/{id}` | Delete a vendor | Admin |
| GET | `/api/admin/vendors/{id}/revenue` | Vendor revenue metrics | Admin |
| GET | `/api/admin/vendors/{id}/products` | Vendor's products | Admin |
| GET | `/api/admin/vendors/{id}/top-customers` | Top customers for a vendor | Admin |

### Admin → Products

| Method | Route | Summary | Used By |
|--------|-------|---------|---------|
| GET | `/api/admin/products/top-ordered` | Most ordered products | Admin |
| GET | `/api/admin/products` | Get all products | Admin |
| GET | `/api/admin/products/stats` | Product statistics | Admin |
| GET | `/api/admin/products/with-revenue` | Products with revenue data | Admin |
| POST | `/api/admin/products/add` | Create a new product | Admin |
| GET | `/api/admin/products/{id}` | Get product by ID | Admin |
| PUT | `/api/admin/products/{id}` | Update a product | Admin |
| DELETE | `/api/admin/products/{id}` | Delete a product | Admin |
| GET | `/api/admin/products/{id}/data` | Product performance data | Admin |
| GET | `/api/admin/products/{id}/customers` | Customers who bought a product | Admin |

### Admin → Event Managers

| Method | Route | Summary | Used By |
|--------|-------|---------|---------|
| GET | `/api/admin/event-managers/top-managers` | Top event managers | Admin |
| GET | `/api/admin/event-managers` | Get all event managers | Admin |
| GET | `/api/admin/event-managers/stats` | Event manager statistics | Admin |
| GET | `/api/admin/event-managers/with-revenue` | Event managers with revenue | Admin |
| GET | `/api/admin/event-managers/{id}` | Get event manager by ID | Admin |
| PUT | `/api/admin/event-managers/{id}` | Update event manager | Admin |
| DELETE | `/api/admin/event-managers/{id}` | Delete event manager | Admin |
| GET | `/api/admin/event-managers/{id}/metrics` | Event manager metrics | Admin |
| GET | `/api/admin/event-managers/{id}/upcoming-events` | Upcoming events for manager | Admin |
| GET | `/api/admin/event-managers/{id}/past-events` | Past events for manager | Admin |

### Admin → Events

| Method | Route | Summary | Used By |
|--------|-------|---------|---------|
| GET | `/api/admin/events/top-events` | Top-performing events | Admin |
| GET | `/api/admin/events` | Get all events | Admin |
| GET | `/api/admin/events/total` | Total number of events | Admin |
| GET | `/api/admin/events/revenue` | Overall event revenue | Admin |
| GET | `/api/admin/events/with-revenue` | Events with revenue data | Admin |
| GET | `/api/admin/events/{id}` | Get event by ID | Admin |
| PUT | `/api/admin/events/{id}` | Update an event | Admin |
| DELETE | `/api/admin/events/{id}` | Delete an event | Admin |
| GET | `/api/admin/events/{id}/attendees` | Get event attendees | Admin |

### Admin → Orders

| Method | Route | Summary | Used By |
|--------|-------|---------|---------|
| GET | `/api/admin/orders` | Get all orders | Admin |
| GET | `/api/admin/orders/stats` | Order statistics | Admin |
| GET | `/api/admin/orders/{id}` | Get order details by ID | Admin |

---

## Source Code Quick Reference

| Swagger Doc File | Route File | Controller File |
|------------------|-----------|----------------|
| `doc/authSwagger.js` | `src/router/authRoutes.js` | `src/controller/authControllers.js` |
| `doc/customerSwagger.js` | `src/router/customerRoutes.js` | `src/controller/customerControllers.js` |
| `doc/productsSwagger.js` | `src/router/productRoutes.js` | `src/controller/productController.js` |
| `doc/ticketsSwagger.js` | `src/router/ticketRouter.js` | `src/controller/ticketControllers.js` |
| `doc/eventsSwagger.js` | `src/router/eventRoutes.js` | `src/controller/eventController.js` |
| `doc/eventManagerSwagger.js` | `src/router/eventManagerRoutes.js` | `src/controller/eventManagerController.js` |
| `doc/eventAnalyticsSwagger.js` | `src/router/eventAnalyticsRoutes.js` | `src/controller/eventAnalyticsController.js` |
| `doc/vendorSwagger.js` | `src/router/vendorRoutes.js` | `src/controller/vendorController.js` |
| `doc/adminSwagger.js` | `src/router/adminRoutes.js` | `src/controller/adminController.js` |
| `doc/schemaSwagger.js` | — | — (shared schemas only) |
