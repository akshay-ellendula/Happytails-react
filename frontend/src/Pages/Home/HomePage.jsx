import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ShopSection from "./components/ShopSection";
import AboutUs from "./components/AboutUs";
import Footer from "./components/Footer";
// No need to import styles here, as styles are applied via child components,
// but if you had a global style like 'body' (which you have), you'd import it.
import "./home.module.css"; 

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