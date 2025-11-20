import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

// Pages
import HomePage from "./Pages/Home/HomePage";
import AuthPage from "./Pages/Auth/Authpage";
import ProductAccessoryPageWrapper from "./Pages/Accessory/ProductAccessoryPageWrapper";
import EventsPage from "./Pages/Events/EventsPage";
import EventDetailPage from "./Pages/EventDeatils/EventDetailPage";
import BookingPage from "./Pages/BookingPage/BookingPage";
import PartnerRegistration from "./Pages/PartnerRegistration/PartnerRegistrationPage";
import EventManagerPage from "./Pages/EventManager/EventManagerPage";
import NotFound from "./pages/NotFoundPage/NotFound.jsx";
import ServiceProviderLogin from "./pages/Auth/ServiceProviderLogin.jsx";

// Components
import RoleBasedRoute from "./components/RoleBasedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<HomePage />} />
      <Route path="/pet_accessory" element={<ProductAccessoryPageWrapper />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/event/:id" element={<EventDetailPage />} />
      <Route path="/partnerRegistrataion" element={<PartnerRegistration />} />
      <Route path="/404" element={<NotFound />} />

      {/* --- Authentication Routes (Customer) --- */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/service-login" element={<ServiceProviderLogin />} />

      {/* --- Customer Protected Routes --- */}
      <Route 
        path="/booking" 
        element={
          <RoleBasedRoute allowedRoles={['customer', 'admin']}> 
             <BookingPage /> 
          </RoleBasedRoute>
        }
      />

      {/* --- Event Manager Protected Routes --- */}
      {/* Note: The EventManagerPage handles its own sub-navigation internally */}
      <Route 
        path="/eventManager/*" 
        element={
          <RoleBasedRoute allowedRoles={['eventManager', 'admin']}>
            <EventManagerPage />
          </RoleBasedRoute>
        } 
      />

      {/* --- Admin Routes (Placeholder for future) --- */}
      <Route 
        path="/admin/*" 
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
             <div>Admin Dashboard Placeholder</div>
          </RoleBasedRoute>
        } 
      />

      {/* --- Store Partner Routes (Placeholder for future) --- */}
      <Route 
        path="/store/*" 
        element={
          <RoleBasedRoute allowedRoles={['storePartner', 'admin']}>
             <div>Store Dashboard Placeholder</div>
          </RoleBasedRoute>
        } 
      />

      {/* Catch all - Redirect to 404 */}
      <Route path="*" element={<Navigate to="/404" replace />} />
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