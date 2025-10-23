import HomePage from "./pages/Home/HomePage";
import AuthPage from "./Pages/Auth/Authpage";
import { Routes, Route } from "react-router";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<AuthPage/>}/>
        <Route path="/login" element={<AuthPage/>}/>
      </Routes>
    </>
  );
}

export default App;
