// App.jsx
import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext"; // 1. Import CartProvider and useCart

import HomePage from "./pages/Home/HomePage";
import AuthPage from "./pages/Auth/Authpage";
import ProductAccessoryPageWrapper from "./pages/Accessory/ProductAccessoryPageWrapper";
import EventsPage from "./pages/Events/EventsPage";
import EventDetailPage from "./pages/EventDeatils/EventDetailPage";
import BookingPage from "./pages/BookingPage/BookingPage";
import PartnerRegistration from "./pages/PartnerRegistration/PartnerRegistrationPage";
import ProductDetailPage from "./pages/Accessory/ProductDetailPage";
import CartSidebar from "./pages/Accessory/components/CartSidebar"; // 2. Import CartSidebar

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
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
    </Routes>
  );
}

// 3. New component to render the global cart
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
      
      {/* 4. Render CartSidebar globally */}
      <CartSidebar
        isOpen={isCartOpen}
        setIsOpen={closeCart} // Use closeCart to close
        cart={cart}
        totals={totals}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        handleCheckout={handleCheckout}
      />
      <Toaster /> {/* Moved Toaster here */}
    </>
  );
}


function App() {
  return (
    <AuthProvider>
      <CartProvider> {/* 5. Wrap content in CartProvider */}
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;