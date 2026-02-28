// pages/Home/components/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { images } from '../../../assets/assets';

const Hero = () => {
  return (
    <section className="relative h-screen bg-cover bg-center bg-no-repeat" 
      style={{ 
        backgroundImage: `url(${images.goldenRetriever})`
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Content */}
      <div className="fade-in absolute w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 drop-shadow-lg">
          For The Pet who has Everything...
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl text-white mb-10 drop-shadow-lg">
          Still Deserves More!
        </p>
        
        {/* Shop Now Button */}
        <Link
          to="/pet_accessory"
          className="inline-block px-8 py-4 bg-[#f2c737] text-[#1a1a1a] font-bold text-lg rounded-full hover:bg-white transition-colors border-2 border-black shadow-lg"
        >
          Shop Now
        </Link>
      </div>

      {/* Gradient overlay from your theme color */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f2c737] to-transparent"></div>
    </section>
  );
};

export default Hero;