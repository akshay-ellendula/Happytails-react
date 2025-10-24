import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ShopSection from "./components/ShopSection";
import AboutUs from "./components/AboutUs";
import Footer from "./components/Footer";
import styles from "./home.module.css"; // Import styles

const HomePage = ({ user }) => {
  return (
    // Apply the .body class for background and font
    <div className={styles.body}> 
      <Navbar user={user} />
      <HeroSection />
      <ShopSection />
      <AboutUs />
      <Footer />
    </div>
  );
};

export default HomePage;