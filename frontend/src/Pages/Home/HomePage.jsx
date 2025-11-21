import { useState } from 'react';
import Header from '../../components/Header';
import MobileMenu from '../../components/MobileMenu';
import Hero from './components/Hero';
import PetEvents from './components/PetEvents';
import Shop from './components/Shop';
import About from './components/About';
import Footer from '../../components/Footer';

function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* The <style jsx global> block that was here has been removed.
        It was causing the console errors and is not needed because
        these styles are already in your src/index.css file.
      */}

      <div className="bg-[#effe8b] font-outfit overflow-x-hidden">
        <Header onMenuToggle={toggleMobileMenu} />
        
        {isMobileMenuOpen && (
          <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
        )}

        <Hero />
        <PetEvents />
        <Shop />
        <About />
        <Footer />
      </div>
    </>
  );
}

export default HomePage;