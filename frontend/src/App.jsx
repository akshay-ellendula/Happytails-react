// App.jsx
import HomePage from "./pages/Home/HomePage"; // Corrected path case
import AuthPage from "./pages/Auth/Authpage";
import ProductAccessoryPageWrapper from './pages/Accessory/ProductAccessoryPageWrapper'; // Import the wrapper
import EventsPage from './pages/Events/EventsPage';
import EventDetailPage from "./pages/EventDeatils/EventDetailPage";
import BookingPage from "./pages/BookingPage/BookingPage";
import { Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pet_accessory" element={<ProductAccessoryPageWrapper />} />
        <Route path="/signup" element={<AuthPage/>}/>
        <Route path="/login" element={<AuthPage/>}/>
        <Route path="/events" element={<EventsPage/>}/>
        <Route path='/event/:id' element={<EventDetailPage/>}/>
        <Route path="/booking" element={<BookingPage />} /> 
      </Routes>
      <Toaster/>
    </>
  );
}

export default App;