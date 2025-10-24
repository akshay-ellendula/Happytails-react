// App.jsx
import HomePage from "./Pages/Home/HomePage"; // Corrected path case
import AuthPage from "./Pages/Auth/Authpage";
import ProductAccessoryPageWrapper from './pages/Accessory/ProductAccessoryPageWrapper'; // Import the wrapper
import { Routes, Route } from "react-router"; // Use react-router-dom

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* --- CHANGE: Use the wrapper component for this route --- */}
        <Route path="/pet_accessory" element={<ProductAccessoryPageWrapper />} />
        <Route path="/signup" element={<AuthPage/>}/>
        <Route path="/login" element={<AuthPage/>}/>
        {/* Add other application routes here */}
      </Routes>
    </>
  );
}

export default App;