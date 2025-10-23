import HomePage from "./pages/Home/HomePage";
import SignUpPage from "./Pages/SignUp/SignUpPage";
import { Routes, Route } from "react-router";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage/>}/>
      </Routes>
    </>
  );
}

export default App;
