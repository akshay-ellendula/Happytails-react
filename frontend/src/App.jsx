import React from "react";
import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { CartProvider, useCart } from "./context/CartContext";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import { Provider } from "react-redux"; // Move Provider import
import { store } from "./store/store";

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
import MyEventsPage from "./pages/MyEventsPage/MyEventsPage";
import TrackOrderPage from "./pages/TrackOrderPage/TrackOrderPage";

// --- Pages: Admin ---
import AdminLoginPage from "./pages/AdminLogin/AdminLoginPage"; // Check capitalization here (pages vs Pages)
import Dashboard from "./Pages/Admin/Dashboard";
import Users from "./Pages/Admin/Users";
import UserDetails from "./Pages/Admin/UserDetails";
import EventManagers from "./Pages/Admin/EventManagers";
import Events from "./Pages/Admin/Events";
import Products from "./Pages/Admin/Products";
import Orders from "./Pages/Admin/Orders";
import Vendors from "./Pages/Admin/Vendors";
import VendorDetails from "./Pages/Admin/VendorDetails";
import EventManagerDetails from "./Pages/Admin/EventManagerDetails";
import EventDetails from './Pages/Admin/EventDetails';
import ProductDetails from './Pages/Admin/ProductDetails';
import OrderDetails from './Pages/Admin/OrderDetails';

// --- Pages: Service Providers ---
import EventManagerPage from "./Pages/EventManager/EventManagerPage";
import ShopManagerLayout from "./Pages/ShopManager/Layout/ShopManagerLayout";
import ShopDashboard from "./Pages/ShopManager/Dashboard/ShopDashboard";
import ProductList from "./Pages/ShopManager/Products/ProductList";
import AddProduct from "./Pages/ShopManager/Products/AddProduct";
import EditProduct from "./Pages/ShopManager/Products/EditProduct";
import OrderList from "./Pages/ShopManager/Orders/OrderList";
import ManagerOrderDetails from "./pages/ShopManager/Orders/ManagerOrderDetails";
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
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my_orders"
        element={
          <ProtectedRoute>
            <MyOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        }
      />
      <Route path="/my_events" element={<ProtectedRoute> <MyEventsPage /> </ProtectedRoute>} />
      <Route path="/track-order/:orderId" element={<ProtectedRoute> <TrackOrderPage /> </ProtectedRoute>} />
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

      {/* --- Connected Shop Manager Routes --- */}
      <Route
        path="/shop"
        element={
          <RoleBasedRoute allowedRoles={["vendor", "admin"]}>
            <ShopManagerLayout />
          </RoleBasedRoute>
        }
      >
        <Route path="dashboard" element={<ShopDashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:productId" element={<EditProduct />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:orderId" element={<ManagerOrderDetails/>} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/:customerId" element={<CustomerDetails />} />
        <Route path="analytics" element={<ShopAnalytics />} />
        <Route path="profile" element={<ShopProfile />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* --- Protected: Admin --- */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      
      <Route path="/admin/dashboard" element={
        <RoleBasedRoute allowedRoles={['admin']}> <Dashboard /> </RoleBasedRoute>
      } />
      <Route path="/admin/users" element={
        <RoleBasedRoute allowedRoles={['admin']}> <Users /> </RoleBasedRoute>
      } />
      <Route path="/admin/event-managers" element={
        <RoleBasedRoute allowedRoles={['admin']}> <EventManagers /> </RoleBasedRoute>
      } />
      <Route path="/admin/events" element={
        <RoleBasedRoute allowedRoles={['admin']}> <Events /> </RoleBasedRoute>
      } />
      <Route path="/admin/products" element={
        <RoleBasedRoute allowedRoles={['admin']}> <Products /> </RoleBasedRoute>
      } />
      <Route path="/admin/orders" element={
        <RoleBasedRoute allowedRoles={['admin']}> <Orders /> </RoleBasedRoute>
      } />
      <Route path="/admin/vendors" element={
        <RoleBasedRoute allowedRoles={['admin']}> <Vendors /> </RoleBasedRoute>
      } />
     <Route path="/admin/users/:id" element={<UserDetails />} />
     <Route path="/admin/vendors/:id" element={<VendorDetails />} />
     <Route path="/admin/event-managers/:id" element={<EventManagerDetails />} />
    <Route path="/admin/events/:id" element={<EventDetails />} />
     <Route path="/admin/products/:id" element={<ProductDetails />} />
     <Route path="/admin/orders/:id" element={<OrderDetails />} />
     <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Catch-all for Admin Root if needed */}
      <Route path="/admin/*" element={
          <RoleBasedRoute allowedRoles={['admin']}>
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
    // Moved Provider to the top level
    <Provider store={store}>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
        {/* Removed duplicate Toaster, kept one here */}
        <Toaster position="top-center" />
      </AuthProvider>
    </Provider>
  );
}

export default App;