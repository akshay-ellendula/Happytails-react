// App.jsx
import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext"; 

import HomePage from "./pages/Home/HomePage";
import AuthPage from "./pages/Auth/Authpage";
import ProductAccessoryPageWrapper from "./pages/Accessory/ProductAccessoryPageWrapper";
import EventsPage from "./pages/Events/EventsPage";
import EventDetailPage from "./pages/EventDeatils/EventDetailPage";
import BookingPage from "./pages/BookingPage/BookingPage";
import PartnerRegistration from "./pages/PartnerRegistration/PartnerRegistrationPage";
import ProductDetailPage from "./pages/Accessory/ProductDetailPage";
import CartSidebar from "./pages/Accessory/components/CartSidebar"; 

// UPDATED: Import new pages
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import MyOrdersPage from "./pages/MyOrdersPage/MyOrdersPage";


// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth(); // UPDATED: Get loading state

  // UPDATED: Wait for auth check to complete
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
      <Route path="/" element={<HomePage />} />
      <Route path="/pet_accessory" element={<ProductAccessoryPageWrapper />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/event/:id" element={<EventDetailPage />} />
      <Route path="/booking" element={<ProtectedRoute> <BookingPage /> </ProtectedRoute>} />
      <Route path="/partnerRegistrataion" element={<PartnerRegistration />} />
      
      {/* UPDATED: Add new protected routes */}
      <Route path="/profile" element={<ProtectedRoute> <ProfilePage /> </ProtectedRoute>} />
      <Route path="/my_orders" element={<ProtectedRoute> <MyOrdersPage /> </ProtectedRoute>} />
    </Routes>
  );
}

// AppContent remains the same
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

// App remains the same
function App() {
  return (
    <AuthProvider>
      <CartProvider> 
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;