# Happy Tails - Application Architecture Guide

## Overview
Happy Tails is a full-stack web application for pet event management and e-commerce. It uses a **MERN stack** (MongoDB, Express, React, Node.js) with additional tools for analytics, payments, and file uploads.

---

## 🏗️ Technology Stack

### Backend
- **Express.js** - Web framework for Node.js
- **MongoDB + Mongoose** - NoSQL database and ODM
- **JWT (jsonwebtoken)** - Token-based authentication
- **Cloudinary** - Image upload and storage
- **Multer** - File upload middleware
- **Nodemailer** - Email sending service
- **Morgan** - HTTP request logging
- **Helmet** - Security headers
- **Winston** - Advanced logging with daily rotation
- **Rotating File Stream** - Log file rotation

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **TailwindCSS** - Styling
- **React Hot Toast** - Toast notifications
- **Chart.js & Recharts** - Data visualization
- **jsPDF & html2canvas** - PDF generation

---

## 🔄 How Frontend Connects to Backend

### 1. **Axios Configuration** (`frontend/src/utils/axios.js`)
```javascript
// Creates a preconfigured axios instance
const BASE_URL = development ? "http://localhost:5001/api" : "/api"
withCredentials: true  // Sends cookies with requests
```

**What this does:**
- All API calls automatically use the base URL
- Cookies (including JWT) are sent with every request
- Automatically switches between dev and production URLs

### 2. **API Calls Flow**
```
Frontend Component 
  ↓
useAuth() hook or Redux Dispatch
  ↓
axiosInstance (sends request + cookies)
  ↓
Backend Server (http://localhost:5001)
  ↓
Route Handler → Middleware → Controller → Database
  ↓
Response sent back with data/error
```

---

## 🔐 Middleware & Their Functions

### 1. **Auth Middleware** (`backend/src/middleware/authMiddleware.js`)
```javascript
protectRoute(roles = [])  // Function that checks authentication
```

**What it does:**
- Verifies JWT token from cookies
- Checks if user has required role (e.g., "admin", "vendor")
- Returns 401 if not authenticated
- Returns 403 if role not authorized

**Where it's used:**
- Protects admin routes: `protectRoute(['admin'])`
- Protects vendor routes: `protectRoute(['vendor'])`
- Any endpoint that requires authentication

**Example usage in routes:**
```javascript
app.get('/api/admin/dashboard', protectRoute(['admin']), adminController.getDashboard)
```

### 2. **Error Handler Middleware** (`backend/src/middleware/errorMiddleware.js`)
```javascript
errorHandler(err, req, res, next)
```

**What it does:**
- Catches all errors from routes and controllers
- Logs errors to Winston logger with daily rotation
- Returns error response with status code
- Hides stack trace in production for security

**Where it's used:**
- Must be last middleware in Express app
- Catches errors from all routes

---

## 🌐 Backend Request Flow

### Server Setup (`backend/src/server.js`)
```
1. Load environment variables (.env)
2. Connect to MongoDB database
3. Apply middleware in order:
   ├── Morgan (request logging)
   ├── Helmet (security headers)
   ├── Express.json() (parse JSON)
   ├── Cookie Parser (parse cookies)
   └── CORS (allow frontend origin)
4. Mount all routes
5. Apply error handler
6. Start server on port 5001
```

### Middleware Execution Order (Important!)
```
Request → Morgan → Helmet → JSON Parser → Cookie Parser → CORS → Routes → Error Handler → Response
```

### Route Structure
```
/api/auth              → Authentication (signin, signup, verify, logout)
/api/public            → Customer endpoints (profile, orders)
/api/eventManagers     → Event manager endpoints
/api/events            → Event operations
/api/tickets           → Ticket management
/api/products          → Product catalog
/api/eventAnalytics    → Analytics data
/api/admin             → Admin panel endpoints
/api/vendors           → Vendor/store partner endpoints
```

---

## 🔑 Authentication Flow

### 1. **Login Process**
```
User enters email & password
  ↓
Frontend sends POST /api/auth/adminSignin
  ↓
Backend validates credentials
  ↓
Backend creates JWT token
  ↓
Backend sends token in cookie response
  ↓
Browser stores cookie automatically
```

### 2. **Session Persistence**
```
On page refresh/reload
  ↓
Frontend calls GET /api/auth/verify
  ↓
Backend checks JWT in cookies
  ↓
If valid: Returns user data, sets isAuthenticated = true
  ↓
User stays logged in
```

### 3. **Protected Routes**
```
User tries to access /admin/dashboard
  ↓
RoleBasedRoute checks authentication
  ↓
If not authenticated: Redirect to login
  ↓
If authenticated but wrong role: Redirect to 403
  ↓
If correct role: Allow access
```

---

## 📦 Frontend State Management

### 1. **AuthContext** (Global Auth State)
```
Stores:
- isAuthenticated: boolean
- user: object with id, email, role
- loading: boolean

Provides:
- useAuth() hook
- signin() function
- signup() function
- logout() function
- getCurrentUser() function
```

**Usage:**
```javascript
const { user, isAuthenticated, signin } = useAuth();
```

### 2. **Redux Store** (Feature Data)
```
Slices:
├── users          → User list/data
├── vendors        → Vendor information
├── eventManagers  → Event manager data
├── events         → Event listings
├── products       → Product catalog
└── orders         → Order history
```

**Usage:**
```javascript
const dispatch = useDispatch();
const users = useSelector(state => state.users.list);
```

---

## 🔒 Security Implementation

### 1. **JWT Authentication**
- Stored in HTTP-only cookies (secure)
- Verified on each request
- 15 min expiration (typical)

### 2. **Helmet Middleware**
- Sets security headers
- Prevents XSS attacks
- Prevents clickjacking
- Disables browser cache for sensitive data

### 3. **CORS Configuration**
```javascript
origin: "http://localhost:5173"  // Only frontend can access
credentials: true                 // Allow cookies
```

### 4. **Password Security**
- bcryptjs hashes passwords (10 salt rounds)
- Never stored in plain text

---

## 📡 How Specific Features Work

### User Registration (Example Flow)
```
1. User fills form → Frontend
2. Frontend validates inputs
3. Frontend POST /api/auth/signup with email, password
4. Backend validates format
5. Backend hashes password with bcryptjs
6. Backend creates user in MongoDB
7. Backend creates JWT token
8. Backend returns token + user data
9. Frontend stores in AuthContext
10. Frontend redirects to dashboard
```

### File Upload (Images)
```
1. User selects file
2. Frontend uses Multer middleware: uploadMiddleware
3. File goes to Cloudinary cloud storage
4. Cloudinary returns image URL
5. Backend stores URL in database
6. Frontend displays image from URL
```

### Data Fetching Example (Products)
```
1. Component mounts
2. useEffect() dispatches fetchProducts() Redux action
3. Redux thunk makes API call via axios
4. Backend checks authentication (middleware)
5. Backend queries MongoDB
6. Returns products array
7. Redux updates store
8. Component re-renders with new data
```

---

## 🚀 Common Operations

### Calling Backend API from Frontend
```javascript
// Direct axios call
import { axiosInstance } from '../utils/axios';

const response = await axiosInstance.post('/products/create', {
  name: 'Dog Toy',
  price: 100
});

// Through Redux
dispatch(createProduct({ name: 'Dog Toy', price: 100 }));
```

### Adding New Route with Middleware
```javascript
// In backend router file
import { protectRoute } from '../middleware/authMiddleware.js';
import controller from '../controller/...js';

router.post('/create', protectRoute(['admin']), controller.create);
```

### Handling Errors in Frontend
```javascript
try {
  const response = await axiosInstance.get('/admin/data');
  // Success
} catch (error) {
  toast.error(error.response.data.message || 'Error');
}
```

---

## 🐛 Debugging Tips

### Check Backend Logs
```bash
# Real-time logs
backend/logs/access.log          # HTTP requests
backend/logs/app-*.log          # Errors and info

# Daily rotated logs
# Files rotate daily at midnight
```

### Check Frontend Network Requests
```
DevTools → Network tab
- See all API calls
- Check request/response headers
- Verify cookies are being sent
```

### Verify Authentication
```javascript
// In browser console
document.cookie  // See JWT token

// Frontend
useAuth() hook shows current auth state
```

---

## 📂 File Organization

```
Backend:
├── server.js              → Main server setup
├── config/               → Database & Cloudinary config
├── middleware/           → Auth, error, upload middleware
├── models/               → MongoDB schemas
├── controller/           → Business logic
├── router/               → API routes
└── utils/                → Logging, email, file upload

Frontend:
├── App.jsx              → Main component
├── context/             → AuthContext, CartContext
├── store/               → Redux slices
├── utils/               → axios configuration
├── Pages/               → Page components
├── components/          → Reusable components
└── hooks/               → Custom hooks (useAuth)
```

---

## ✅ Key Points to Remember

1. **JWT token** is stored in cookies (not localStorage)
2. **CORS** only allows frontend origin for security
3. **Middleware order** matters - error handler must be last
4. **Protected routes** check role using auth middleware
5. **MongoDB** stores all user, product, event data
6. **Cloudinary** stores images in cloud
7. **Redux** manages feature data (products, events, etc.)
8. **AuthContext** manages user authentication state
9. **Axios** automatically sends cookies with requests
10. **Winston** logs all errors to rotating files

---

## 🔗 Related Files Quick Reference

| Feature | Files |
|---------|-------|
| **Authentication** | AuthContext.jsx, authMiddleware.js, authControllers.js |
| **Products** | productsSlice.js, productController.js, productRoutes.js |
| **Events** | eventsSlice.js, eventController.js, eventRoutes.js |
| **Admin** | adminController.js, adminRoutes.js, adminModel.js |
| **Logging** | logger.js, errorMiddleware.js, access.log |
| **API** | axios.js (frontend), server.js (backend) |
| **Uploads** | uploadMiddleware.js, cloudinaryUploader.js |

