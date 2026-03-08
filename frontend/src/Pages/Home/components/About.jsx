// pages/Home/components/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { images } from '../../../assets/assets';

const About = () => {
  return (
    <section className="py-16 lg:py-24 bg-[#f2c737]">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-center max-w-7xl mx-auto">
          <div className="flex-1">
            <img 
              src={images.img1} 
              className="w-full h-auto rounded-xl shadow-lg border-2 border-black" 
              alt="Happy pets"
            />
          </div>
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1a1a] mb-6">About Us</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Welcome to HappyTails Where Every Pet Finds Their Perfect Match!
            </p>
            <p className="text-gray-700 leading-relaxed mb-8">
              At HappyTails, we believe that pets aren't just animals — they're family. 
              That's why we've created a one-stop destination for pet lovers who want 
              nothing but the best for their furry companions. From thrilling dog races 
              and exciting pet events to a carefully curated selection of pet essentials 
              and stylish accessories, we're here to make every moment with your pet special.
            </p>
            <Link
              to="/about"
              className="inline-block px-6 py-2 text-[#1a1a1a] border-2 border-black rounded-lg hover:bg-[#1a1a1a] hover:text-white transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;