import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

// Pages
import HomePage from "./Pages/Home/HomePage";
import AuthPage from "./Pages/Auth/Authpage"; // Customer Login
import ServiceProviderLogin from "./Pages/Auth/ServiceProviderLogin"; // Service Provider Login
import ProductAccessoryPageWrapper from "./Pages/Accessory/ProductAccessoryPageWrapper";
import EventsPage from "./Pages/Events/EventsPage";
import EventDetailPage from "./Pages/EventDeatils/EventDetailPage";
import BookingPage from "./Pages/BookingPage/BookingPage";
import AdminLoginPage from "./pages/AdminLogin/AdminLoginPage";
import Dashboard from "./Pages/Admin/Dashboard";
import Users from "./Pages/Admin/Users";
import EventManagers from "./Pages/Admin/EventManagers";
import Events from "./Pages/Admin/Events";
import Products from "./Pages/Admin/Products";
import Orders from "./Pages/Admin/Orders";
import Vendors from "./Pages/Admin/Vendors";


import PartnerRegistration from "./Pages/PartnerRegistration/PartnerRegistrationPage";
import EventManagerPage from "./Pages/EventManager/EventManagerPage";
import NotFound from "./Pages/NotFoundPage/NotFound"; // Ensure you have a NotFound page

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
      
      {/* --- Auth Routes --- */}
      <Route path="/login" element={<AuthPage />} /> {/* Customer Login */}
      <Route path="/signup" element={<AuthPage />} /> {/* Customer Signup */}
      <Route path="/service-login" element={<ServiceProviderLogin />} /> {/* Event Manager / Store Login */}

      {/* --- Protected: Customer --- */}
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

      {/* --- Protected: Store Partner (Placeholder) --- */}
      <Route 
        path="/store/*" 
        element={
          <RoleBasedRoute allowedRoles={['storePartner', 'admin']}>
             <div className="p-10">Store Dashboard Coming Soon</div>
          </RoleBasedRoute>
        } 
      />

      {/* --- Protected: Admin (Placeholder) --- */}
      <Route 
        path="/admin/*" 
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
             <div className="p-10">Admin Dashboard Coming Soon</div>
          </RoleBasedRoute>
        } 
      />

      {/* --- 404 --- */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
     <Route path="/admin/dashboard" element={<Dashboard />} />
     <Route path="/admin/users" element={<Users />} />
     <Route path="/admin/event-managers" element={<EventManagers />} />
     <Route path="/admin/events" element={<Events />} />
     <Route path="/admin/products" element={<Products />} />
     <Route path="/admin/orders" element={<Orders />} />
     <Route path="/admin/vendors" element={<Vendors />} />



    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster position="top-center" />
    </AuthProvider>
  );
}

export default App;