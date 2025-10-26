// App.jsx
import React, { useState } from 'react'; // Added useState for example user state
import { Routes, Route } from "react-router"; // Use react-router-dom

// --- Page Imports ---
import HomePage from "./Pages/Home/HomePage";
import AuthPage from "./Pages/Auth/Authpage";
import ProductAccessoryPageWrapper from './pages/Accessory/ProductAccessoryPageWrapper';

// --- 1. IMPORT YOUR NEW PAGE ---
import ProductDetailPage from './pages/Accessory/ProductDetailPage'; // Correct path based on structure

function App() {
  // Example user state - replace with your actual auth logic (Context, Redux, etc.)
  const [user, setUser] = useState(null); 
  // You would typically have a useEffect here to check for a logged-in user

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        {/* --- Accessory Shop Page --- */}
        <Route 
          path="/pet_accessory" 
          element={<ProductAccessoryPageWrapper user={user} />} // Pass user prop if needed
        />

        {/* --- 2. ADD THE ROUTE FOR PRODUCT DETAIL --- */}
        <Route 
          path="/product/:id" 
          element={<ProductDetailPage user={user} />} // Pass user prop
        />

        {/* --- Auth Routes --- */}
        {/* You might want separate routes for login/signup if AuthPage handles both */}
        <Route path="/signup" element={<AuthPage setUser={setUser} />}/> 
        <Route path="/login" element={<AuthPage setUser={setUser} />}/> 

        {/* Add other application routes here */}
        
      </Routes>
    </>
  );
}

export default App;