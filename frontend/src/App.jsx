import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Fixed import
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { CartProvider, useCart } from "./context/CartContext";

// --- Pages: Public & General ---
import HomePage from "./pages/Home/HomePage";
import NotFound from "./Pages/NotFoundPage/NotFound";

// --- Pages: Auth ---
import AuthPage from "./pages/Auth/Authpage";
import ServiceProviderLogin from "./Pages/Auth/ServiceProviderLogin";

// --- Pages: Products & Accessories ---
import ProductAccessoryPageWrapper from "./pages/Accessory/ProductAccessoryPageWrapper";
import ProductDetailPage from "./pages/Accessory/ProductDetailPage";
import CartSidebar from "./pages/Accessory/components/CartSidebar";

// --- Pages: Events & Booking ---
import EventsPage from "./pages/Events/EventsPage";
import EventDetailPage from "./pages/EventDeatils/EventDetailPage";
import BookingPage from "./pages/BookingPage/BookingPage";
import PartnerRegistration from "./Pages/PartnerRegistration/PartnerRegistrationPage";

// --- Pages: Customer Private ---
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import MyOrdersPage from "./pages/MyOrdersPage/MyOrdersPage";
import PaymentPage from "./pages/PaymentPage/PaymentPage";

// --- Pages: Admin ---
import AdminLoginPage from "./pages/AdminLogin/AdminLoginPage";
import Dashboard from "./Pages/Admin/Dashboard";
import Users from "./Pages/Admin/Users";
import EventManagers from "./Pages/Admin/EventManagers";
import Events from "./Pages/Admin/Events";
import Products from "./Pages/Admin/Products";
import Orders from "./Pages/Admin/Orders";
import Vendors from "./Pages/Admin/Vendors";

// --- Pages: Service Providers ---
import EventManagerPage from "./Pages/EventManager/EventManagerPage";

// ------------------------------------------------------------------
// 1. IMPORT YOUR NEW SHOP MANAGER FILES HERE
// ------------------------------------------------------------------
import ShopManagerLayout from "./Pages/ShopManager/Layout/ShopManagerLayout";
import ShopDashboard from "./Pages/ShopManager/Dashboard/ShopDashboard";
import ProductList from "./Pages/ShopManager/Products/ProductList";
import AddProduct from "./Pages/ShopManager/Products/AddProduct";
import EditProduct from "./Pages/ShopManager/Products/EditProduct";
import OrderList from "./Pages/ShopManager/Orders/OrderList";
import OrderDetails from "./Pages/ShopManager/Orders/OrderDetails";
import CustomerList from "./Pages/ShopManager/Customers/CustomerList";
import CustomerDetails from "./Pages/ShopManager/Customers/CustomerDetails";
import ShopAnalytics from "./Pages/ShopManager/Analytics/ShopAnalytics";
import ShopProfile from "./Pages/ShopManager/Profile/ShopProfile";

// --- Components ---
import RoleBasedRoute from "./components/RoleBasedRoute";

// Helper Component: Generic Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-[#effe8b] min-h-screen flex items-center justify-center">
        <div className="text-xl font-bold">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<HomePage />} />
      <Route path="/pet_accessory" element={<ProductAccessoryPageWrapper />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/event/:id" element={<EventDetailPage />} />
      <Route path="/partnerRegistrataion" element={<PartnerRegistration />} />

      {/* --- Auth Routes --- */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/service-login" element={<ServiceProviderLogin />} />

      {/* --- Protected: Customer --- */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            {" "}
            <ProfilePage />{" "}
          </ProtectedRoute>
        }
      />
      <Route
        path="/my_orders"
        element={
          <ProtectedRoute>
            {" "}
            <MyOrdersPage />{" "}
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            {" "}
            <PaymentPage />{" "}
          </ProtectedRoute>
        }
      />

      {/* --- Protected: Booking --- */}
      <Route
        path="/booking"
        element={
          <RoleBasedRoute allowedRoles={["customer", "admin"]}>
            <BookingPage />
          </RoleBasedRoute>
        }
      />

      {/* --- Protected: Event Manager --- */}
      <Route
        path="/eventManager/*"
        element={
          <RoleBasedRoute allowedRoles={["eventManager", "admin"]}>
            <EventManagerPage />
          </RoleBasedRoute>
        }
      />

      {/* ------------------------------------------------------------------ */}
      {/* 2. THE CONNECTED SHOP MANAGER ROUTES                               */}
      {/* ------------------------------------------------------------------ */}
      <Route
        path="/shop"
        element={
          // IMPORTANT: store partners in backend use role 'storePartner' so allow that here
          <RoleBasedRoute allowedRoles={["storePartner", "admin"]}>
            <ShopManagerLayout />
          </RoleBasedRoute>
        }
      >
        {/* Nested Routes - These load INSIDE the ShopManagerLayout */}
        <Route path="dashboard" element={<ShopDashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:productId" element={<EditProduct />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:orderId" element={<OrderDetails />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/:customerId" element={<CustomerDetails />} />
        <Route path="analytics" element={<ShopAnalytics />} />
        <Route path="profile" element={<ShopProfile />} />

        {/* Default redirect to dashboard if they just type /shop */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* --- Protected: Admin --- */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route
        path="/admin/dashboard"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            {" "}
            <Dashboard />{" "}
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            {" "}
            <Users />{" "}
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/event-managers"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            {" "}
            <EventManagers />{" "}
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            {" "}
            <Events />{" "}
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            {" "}
            <Products />{" "}
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            {" "}
            <Orders />{" "}
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/vendors"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            {" "}
            <Vendors />{" "}
          </RoleBasedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <Navigate to="/admin/dashboard" replace />
          </RoleBasedRoute>
        }
      />

      {/* --- 404 --- */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

function AppContent() {
  const {
    isCartOpen,
    closeCart,
    cart,
    calculateTotals,
    updateQuantity,
    removeItem,
    handleCheckout,
  } = useCart();

  const totals = calculateTotals();

  return (
    <>
      <AppRoutes />

      <CartSidebar
        isOpen={isCartOpen}
        setIsOpen={closeCart}
        cart={cart}
        totals={totals}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        handleCheckout={handleCheckout}
      />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
      <Toaster position="top-center" />
    </AuthProvider>
  );
}

export default App;
