import React, { useEffect } from "react";
import { Routes, Route, Navigate, useSearchParams, useNavigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { CartProvider, useCart } from "./context/CartContext";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import ResetPassword from "./Pages/Auth/ResetPassword";
import { Provider } from "react-redux";
import { store } from "./store/store";

// --- Pages: Public & General ---
import HomePage from "./Pages/Home/HomePage";
import NotFound from "./Pages/NotFoundPage/NotFound";
import ReviewPage from './Pages/ReviewPage/ReviewPage';

// --- Pages: Auth ---
import AuthPage from "./Pages/Auth/Authpage";
import ServiceProviderLogin from "./Pages/Auth/ServiceProviderLogin";

// --- Pages: Products & Accessories ---
import ProductAccessoryPageWrapper from "./Pages/Accessory/ProductAccessoryPageWrapper";
import ProductDetailPage from "./Pages/Accessory/ProductDetailPage";
import CartSidebar from "./Pages/Accessory/components/CartSidebar";
import CheckoutPage from "./Pages/Checkout/CheckoutPage";

// --- Pages: Events & Booking ---
import EventsPage from "./Pages/Events/EventsPage";
import EventDetailPage from "./Pages/EventDeatils/EventDetailPage";
import BookingPage from "./Pages/BookingPage/BookingPage";
import PartnerRegistration from "./Pages/PartnerRegistration/PartnerRegistrationPage";

// --- Pages: Customer Private ---
import ProfilePage from "./Pages/ProfilePage/ProfilePage";
import MyOrdersPage from "./Pages/MyOrdersPage/MyOrdersPage";
import PaymentPage from "./Pages/PaymentPage/PaymentPage";
import MyEventsPage from "./Pages/MyEventsPage/MyEventsPage";
import TrackOrderPage from "./Pages/TrackOrderPage/TrackOrderPage";

// --- Pages: Admin ---
import AdminLoginPage from "./Pages/AdminLogin/AdminLoginPage";
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
import EventDetails from "./Pages/Admin/EventDetails";
import ProductDetails from "./Pages/Admin/ProductDetails";
import OrderDetails from "./Pages/Admin/OrderDetails";

// --- Pages: Service Providers ---
import EventManagerPage from "./Pages/EventManager/EventManagerPage";
import ShopManagerLayout from "./Pages/ShopManager/Layout/ShopManagerLayout";
import ShopDashboard from "./Pages/ShopManager/Dashboard/ShopDashboard";
import ProductList from "./Pages/ShopManager/Products/ProductList";
import AddProduct from "./Pages/ShopManager/Products/AddProduct";
import EditProduct from "./Pages/ShopManager/Products/EditProduct";
import ViewAllProducts from "./Pages/ShopManager/Products/ViewAllProducts";
import OrderList from "./Pages/ShopManager/Orders/OrderList";
import ManagerOrderDetails from "./Pages/ShopManager/Orders/ManagerOrderDetails";
import CustomerList from "./Pages/ShopManager/Customers/CustomerList";
import CustomerDetails from "./Pages/ShopManager/Customers/CustomerDetails";
import ViewAllCustomers from "./Pages/ShopManager/Customers/ViewAllCustomers";
import ShopAnalytics from "./Pages/ShopManager/Analytics/ShopAnalytics";
import ShopProfile from "./Pages/ShopManager/Profile/ShopProfile";
import ShopSettings from "./Pages/ShopManager/Settings/ShopSettings";

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

// Component to handle Google login success messages
const GoogleLoginHandler = () => {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const googleSuccess = searchParams.get('google_login_success');
    const googleError = searchParams.get('error');
    const errorDetails = searchParams.get('details');

    if (googleSuccess === 'true') {
      // Show success message
      import('react-hot-toast').then(({ toast }) => {
        toast.success('Google login successful! Welcome to Happy Tails!');
      });
      
      // Wait a moment to ensure user state is updated, then redirect
      setTimeout(() => {
        if (user) {
          if (user.role === 'customer') navigate('/');
          else if (user.role === 'eventManager') navigate('/eventManager');
          else if (user.role === 'vendor') navigate('/shop');
        } else {
          navigate('/');
        }
      }, 1000);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (googleError === 'google_auth_failed') {
      console.error('Google login failed:', errorDetails);
      import('react-hot-toast').then(({ toast }) => {
        toast.error(`Google login failed: ${errorDetails || 'Please try again'}`);
      });
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check if there's any error from Google
    if (searchParams.get('error') === 'access_denied') {
      import('react-hot-toast').then(({ toast }) => {
        toast.error('You denied access. Please try again or use email login.');
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check for other error types
    if (searchParams.get('error') && searchParams.get('error') !== 'google_auth_failed') {
      console.error('OAuth error:', searchParams.get('error'));
      import('react-hot-toast').then(({ toast }) => {
        toast.error(`Authentication error: ${searchParams.get('error')}`);
      });
    }
  }, [searchParams, user, navigate]);
  
  return null;
};

function AppRoutes() {
  return (
    <>
      <GoogleLoginHandler />
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/pet_accessory" element={<ProductAccessoryPageWrapper />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/event/:id" element={<EventDetailPage />} />
        <Route path="/partnerRegistrataion" element={<PartnerRegistration />} />
        <Route path="/review/:ticketId/:token" element={<ReviewPage />} />

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
            <RoleBasedRoute allowedRoles={["customer"]}>
              <PaymentPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/my_events"
          element={
            <ProtectedRoute>
              {" "}
              <MyEventsPage />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/track-order/:orderId"
          element={
            <ProtectedRoute>
              {" "}
              <TrackOrderPage />{" "}
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

        <Route
          path="/event-manager/events/:eventId"
          element={
            <RoleBasedRoute allowedRoles={["eventManager"]}>
              <EventDetails />
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
          <Route path="products/view-all" element={<ViewAllProducts />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/:orderId" element={<ManagerOrderDetails />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/view-all" element={<ViewAllCustomers />} />
          <Route path="customers/:customerId" element={<CustomerDetails />} />
          <Route path="analytics" element={<ShopAnalytics />} />
          <Route path="profile" element={<ShopProfile />} />
          <Route path="settings" element={<ShopSettings />} />
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
        <Route path="/admin/users/:id" element={<UserDetails />} />
        <Route path="/admin/vendors/:id" element={<VendorDetails />} />
        <Route
          path="/admin/event-managers/:id"
          element={<EventManagerDetails />}
        />
        <Route path="/admin/events/:id" element={<EventDetails />} />
        <Route path="/admin/products/:id" element={<ProductDetails />} />
        <Route path="/admin/orders/:id" element={<OrderDetails />} />
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Catch-all for Admin Root if needed */}
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
        <Route
          path="/checkout"
          element={
            <RoleBasedRoute allowedRoles={["customer"]}>
              <CheckoutPage />
            </RoleBasedRoute>
          }
        />
      </Routes>
    </>
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
    <Provider store={store}>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
        <Toaster position="top-center" />
      </AuthProvider>
    </Provider>
  );
}

export default App;
