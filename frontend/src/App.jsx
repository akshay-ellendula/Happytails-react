import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext";
import ForgotPassword from "./pages/Auth/ForgotPassword"; // Check casing of 'pages' vs 'Pages'
import ResetPassword from "./pages/Auth/ResetPassword";

// --- Pages: Public & General ---
import HomePage from "./pages/Home/HomePage";
import NotFound from "./Pages/NotFoundPage/NotFound";

// --- Pages: Auth ---
import AuthPage from "./pages/Auth/Authpage"; // Customer Login/Signup
import ServiceProviderLogin from "./Pages/Auth/ServiceProviderLogin"; // Admin/Event Manager Login

// --- Pages: Products & Accessories ---
import ProductAccessoryPageWrapper from "./pages/Accessory/ProductAccessoryPageWrapper";
import ProductDetailPage from "./pages/Accessory/ProductDetailPage";
import CartSidebar from "./pages/Accessory/components/CartSidebar";

// --- Pages: Events & Booking ---
import EventsPage from "./pages/Events/EventsPage";
import EventDetailPage from "./pages/EventDeatils/EventDetailPage";
import BookingPage from "./pages/BookingPage/BookingPage";
import PartnerRegistration from "./pages/PartnerRegistration/PartnerRegistrationPage";

// --- Pages: Customer Private ---
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import MyOrdersPage from "./pages/MyOrdersPage/MyOrdersPage";
import PaymentPage from "./pages/PaymentPage/PaymentPage";
import MyEventsPage from "./pages/MyEventsPage/MyEventsPage";
import TrackOrderPage from "./pages/TrackOrderPage/TrackOrderPage";

// --- Pages: Admin ---
import AdminLoginPage from "./Pages/AdminLogin/AdminLoginPage";
import Dashboard from "./Pages/Admin/Dashboard";
import Users from "./Pages/Admin/Users";
import EventManagers from "./Pages/Admin/EventManagers";
import Events from "./Pages/Admin/Events";
import Products from "./Pages/Admin/Products";
import Orders from "./Pages/Admin/Orders";
import Vendors from "./Pages/Admin/Vendors";
import UserDetails from "./Pages/Admin/UserDetails";
import { Provider } from "react-redux";
import { store } from "./store/store";
import VendorDetails from "./Pages/Admin/VendorDetails";
import EventManagerDetails from "./Pages/Admin/EventManagerDetails";
import EventDetails from './Pages/Admin/EventDetails';
import ProductDetails from './Pages/Admin/ProductDetails';
import OrderDetails from './Pages/Admin/OrderDetails';

// --- Pages: Service Providers ---
import EventManagerPage from "./Pages/EventManager/EventManagerPage";

// --- Components ---
import RoleBasedRoute from "./components/RoleBasedRoute"; 

// Helper Component: Generic Protected Route (For basic authenticated users)
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
    <Provider store={store}>
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<HomePage />} />
      <Route path="/pet_accessory" element={<ProductAccessoryPageWrapper />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/event/:id" element={<EventDetailPage />} />
      <Route path="/partnerRegistrataion" element={<PartnerRegistration />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      
      {/* --- Auth Routes --- */}
      <Route path="/login" element={<AuthPage />} /> {/* Customer Login */}
      <Route path="/signup" element={<AuthPage />} /> {/* Customer Signup */}
      <Route path="/service-login" element={<ServiceProviderLogin />} /> {/* Event Manager / Store Login */}

      {/* --- Protected: Customer (Generic Auth) --- */}
      <Route path="/profile" element={<ProtectedRoute> <ProfilePage /> </ProtectedRoute>} />
      <Route path="/my_orders" element={<ProtectedRoute> <MyOrdersPage /> </ProtectedRoute>} />
      <Route path="/payment" element={<ProtectedRoute> <PaymentPage /> </ProtectedRoute>} />
      <Route path="/my_events" element={<ProtectedRoute> <MyEventsPage /> </ProtectedRoute>} />
      <Route path="/track-order/:orderId" element={<ProtectedRoute> <TrackOrderPage /> </ProtectedRoute>} />
      {/* --- Protected: Booking (Customer or Admin) --- */}
      <Route 
        path="/booking" 
        element={
          <RoleBasedRoute allowedRoles={['customer', 'admin']}>
            <BookingPage />
          </RoleBasedRoute>
        } 
      />

      {/* --- Protected: Event Manager --- */}
      <Route 
        path="/eventManager/*" 
        element={
          <RoleBasedRoute allowedRoles={['eventManager', 'admin']}>
            <EventManagerPage />
          </RoleBasedRoute>
        } 
      />

      {/* --- Protected: Store Partner --- */}
      <Route 
        path="/store/*" 
        element={
          <RoleBasedRoute allowedRoles={['storePartner', 'admin']}>
             <div className="p-10">Store Dashboard Coming Soon</div>
          </RoleBasedRoute>
        } 
      />

      {/* --- Protected: Admin --- */}
      {/* Note: Admin routes can be nested or flat depending on your sidebar logic. 
          I'm keeping them flat as per your V1, but ensuring they are protected. */}
      
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
    </Provider>
  );
}

// Wraps logic for Cart Sidebar + Routes
function AppContent() {
  const { 
    isCartOpen, 
    closeCart, 
    cart, 
    calculateTotals, 
    updateQuantity, 
    removeItem, 
    handleCheckout 
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

// Main App Component
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