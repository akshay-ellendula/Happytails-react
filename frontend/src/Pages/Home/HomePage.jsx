import { useState } from 'react';
import Header from './components/Header';
import MobileMenu from './components/MobileMenu';
import Hero from './components/Hero';
import PetEvents from './components/PetEvents';
import Shop from './components/Shop';
import About from './components/About';
import Footer from './components/Footer';

function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Global Styles for this page */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
        
        body {
          font-family: 'Outfit', sans-serif;
          background-color: #effe8b;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .fade-in { 
          animation: fadeIn 3s ease; 
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(200px) scale(0.3); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @supports (animation-timeline: view()) {
          .slide-up { 
            animation: slideUp both; 
            animation-timeline: view(95% 5%); 
          }
        }
      `}</style>

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