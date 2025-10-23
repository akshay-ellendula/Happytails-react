import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ShopSection from "./components/ShopSection";
import AboutUs from "./components/AboutUs";
import Footer from "./components/Footer";
import "./home.css";

const HomePage = ({ user }) => {
  return (
    <>
      <Navbar user={user} />
      <HeroSection />
      <ShopSection />
      <AboutUs />
      <Footer />
    </>
  );
};

export default HomePage;
