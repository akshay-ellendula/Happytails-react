# 🐾 HappyTails

HappyTails is a comprehensive web platform designed for pet owners and service providers. It connects pet lovers with high-quality pet accessories and exciting pet events, while providing robust management tools for store vendors and event organizers.

## 🚀 Features

### 👤 Customer (Pet Owners)

* **Shop Accessories:** Browse and purchase pet products with advanced filtering and search.
* **Event Booking:** Discover and book tickets for pet-related events.
* **Cart & Checkout:** Seamless shopping experience with a dedicated cart and payment integration.
* **User Profile:** Manage personal details, view order history, and track booked events.
* **Order Tracking:** Real-time status updates for product orders.

### 🏢 Vendor (Shop Manager)

* **Shop Dashboard:** specific dashboard to manage store operations.
* **Product Management:** Add, edit, and list pet accessories/products.
* **Order Management:** View and process customer orders.
* **Analytics:** Visualize sales data and customer trends.

### 📅 Event Manager

* **Event Dashboard:** Dedicated tools for organizing events.
* **Event Creation:** Create and manage event listings and ticket types.
* **Analytics:** Track ticket sales and event engagement.

### 🛡️ Admin

* **Master Dashboard:** Overview of the entire platform's activity.
* **User Management:** Manage all users, vendors, and event managers.
* **Approvals:** Oversee and approve new vendors or events.
* **Global Analytics:** System-wide charts and statistics.

---

## 🛠️ Tech Stack

### Frontend

* **Framework:** React 19 (Vite)
* **Styling:** Tailwind CSS 4
* **State Management:** Redux Toolkit
* **Routing:** React Router v7
* **HTTP Client:** Axios
* **Visualization:** Chart.js, Recharts
* **Utilities:** React Hot Toast (Notifications), Lucide React (Icons), jsPDF (Report generation)

### Backend

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose ODM)
* **Authentication:** JWT (JSON Web Tokens) & Cookies
* **Image Storage:** Cloudinary
* **Logging:** Winston & Morgan
* **Security:** Bcrypt.js (Password hashing), CORS

---

## 📂 Project Structure

```bash
HappyTails/
├── backend/                # Express.js Server
│   ├── logs/               # Access and Error logs
│   ├── src/
│   │   ├── config/         # DB and Cloudinary config
│   │   ├── controller/     # Logic for Auth, Products, Events, etc.
│   │   ├── middleware/     # Auth, Error handling, Uploads
│   │   ├── models/         # Mongoose Schemas (User, Product, Order, etc.)
│   │   ├── router/         # API Routes
│   │   └── server.js       # Entry point
│   └── package.json
│
├── frontend/               # React Client
│   ├── src/
│   │   ├── Pages/          # Views for Admin, Auth, Home, Shop, etc.
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth and Cart context
│   │   ├── store/          # Redux Slices
│   │   └── App.jsx         # Main Application Component
│   └── package.json
```
---

## ⚙️ Installation & Setup

### Prerequisites

* Node.js (v18+ recommended)
* MongoDB (Local or Atlas URL)
* Cloudinary Account (for image uploads)

### 1. Clone the Repository

```bash
git clone https://github.com/akshay-ellendula/Happytails-react.git
cd happytails-react

```

### 2. Backend Setup

Navigate to the backend folder and install dependencies:

```bash
cd backend
npm install

```

**Environment Variables:**
Create a `.env` file in the `backend/` root directory and add the following:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email_for_nodemailer
EMAIL_PASS=your_email_app_password
CLIENT_URL=http://localhost:5173

```

Start the server:

```bash
# Development mode (with Nodemon)
npm run dev

# Production start
npm start

```

*The backend runs on http://localhost:5001 by default.*

### 3. Frontend Setup

Navigate to the frontend folder and install dependencies:

```bash
cd ../frontend
npm install

```

Start the Vite development server:

```bash
npm run dev

```

*The frontend runs on http://localhost:5173 by default.*

---

## 🔌 API Endpoints (Overview)

The backend exposes RESTful APIs at `/api/`. Key routes include:

* **Auth:** `/api/auth` (Login, Register, Reset Password)
* **Public:** `/api/public` (Publicly accessible data)
* **Events:** `/api/events` & `/api/eventManagers`
* **Shop:** `/api/products`, `/api/orders`, `/api/vendors`
* **Admin:** `/api/admin` (Restricted management routes)
* **Tickets:** `/api/tickets`

---

## 🤝 Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
