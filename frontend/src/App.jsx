// App.jsx
import HomePage from "./Pages/Home/HomePage"; // Corrected path case
import AuthPage from "./Pages/Auth/Authpage";
import ProductAccessoryPageWrapper from './pages/Accessory/ProductAccessoryPageWrapper'; // Import the wrapper
import EventsPage from './pages/Events/EventsPage';
import EventDetailPage from "./pages/EventDeatils/EventDetailPage";
import BookingPage from "./pages/BookingPage/BookingPage";
import { Routes, Route } from "react-router"; // Use react-router-dom

function App() {
  return (
    <>
      <Routes>
        {/* <Route path="/" element={<HomePage />} /> */}
        {/* --- CHANGE: Use the wrapper component for this route --- */}
        {/* <Route path="/pet_accessory" element={<ProductAccessoryPageWrapper />} />
        <Route path="/signup" element={<AuthPage/>}/>
        <Route path="/login" element={<AuthPage/>}/> */}
        <Route path="/events" element={<EventsPage/>}/>
        <Route path='/event/:id' element={<EventDetailPage/>}/>
        <Route path="/booking" element={<BookingPage />} /> 
        {/* Add other application routes here */}
      </Routes>
    </>
  );
}

export default App;