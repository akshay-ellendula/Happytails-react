import { useState } from 'react';
import Header from '../../components/Header';
import MobileMenu from '../../components/MobileMenu';
import Hero from './components/Hero';
import PetEvents from './components/PetEvents';
import Shop from './components/Shop';
import Footer from '../../components/Footer';

function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <div className="font-outfit overflow-x-hidden">
        <Header onMenuToggle={toggleMobileMenu} />
        
        {isMobileMenuOpen && (
          <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
        )}

        <Hero />
        <PetEvents />
        <Shop />
        <Footer />
      </div>
    </>
  );
}

export default HomePage;