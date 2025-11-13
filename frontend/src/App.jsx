// App.jsx
import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import HomePage from "./pages/Home/HomePage";
import AuthPage from "./pages/Auth/Authpage";
import ProductAccessoryPageWrapper from "./pages/Accessory/ProductAccessoryPageWrapper";
import EventsPage from "./pages/Events/EventsPage";
import EventDetailPage from "./pages/EventDeatils/EventDetailPage";
import BookingPage from "./pages/BookingPage/BookingPage";
import PartnerRegistration from "./pages/PartnerRegistration/PartnerRegistrationPage";
import EventManagerPage from "./pages/EventManager/EventManagerPage";

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
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/event/:id" element={<EventDetailPage />} />
      <Route path="/booking" element={<ProtectedRoute> <BookingPage /> </ProtectedRoute>}/>
      <Route path="/partnerRegistrataion" element={<PartnerRegistration/> } />
      <Route path="/eventManager" element={<EventManagerPage/>}/>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
