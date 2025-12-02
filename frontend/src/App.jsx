// App.jsx
import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from "./pages/Home/HomePage";
import AuthPage from "./pages/Auth/Authpage";
import ProductAccessoryPageWrapper from './pages/Accessory/ProductAccessoryPageWrapper';
import EventsPage from './pages/Events/EventsPage';
import EventDetailPage from "./pages/EventDeatils/EventDetailPage";
import BookingPage from "./pages/BookingPage/BookingPage";
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





// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Provider store={store}>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pet_accessory" element={<ProductAccessoryPageWrapper />} />
      <Route path="/signup" element={<AuthPage/>}/>
      <Route path="/login" element={<AuthPage/>}/>
      <Route path="/events" element={<EventsPage/>}/>
      <Route path='/event/:id' element={<EventDetailPage/>}/>
      <Route 
        path="/booking" 
        element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        } 
      />
      <Route path="/admin/login" element={<AdminLoginPage />} />
     <Route path="/admin/dashboard" element={<Dashboard />} />
     <Route path="/admin/users" element={<Users />} />
     <Route path="/admin/event-managers" element={<EventManagers />} />
     <Route path="/admin/events" element={<Events />} />
     <Route path="/admin/products" element={<Products />} />
     <Route path="/admin/orders" element={<Orders />} />
     <Route path="/admin/vendors" element={<Vendors />} />
     <Route path="/admin/users/:id" element={<UserDetails />} />
     <Route path="/admin/vendors/:id" element={<VendorDetails />} />
     <Route path="/admin/event-managers/:id" element={<EventManagerDetails />} />
    <Route path="/admin/events/:id" element={<EventDetails />} />
     <Route path="/admin/products/:id" element={<ProductDetails />} />



    </Routes>
    </Provider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster/>
    </AuthProvider>
  );
}

export default App;