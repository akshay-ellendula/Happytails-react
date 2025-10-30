// components/About.jsx
import React from 'react';
import { images } from '../../../assets/assets';

const About = () => {
  return (
    <section className="slide-up flex flex-col lg:flex-row gap-12 mx-5 lg:mx-[75px] my-12 lg:my-48 items-center bg-[#effe8b]">
      <img 
        src={images.img1} 
        className="w-full lg:w-[500px] h-auto lg:h-[500px] object-cover rounded-lg shadow-lg border-2 border-black" 
        alt="About us" 
      />
      <div className="text-center lg:text-left leading-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1a1a] mb-4">About Us</h2>
        <p className="text-lg lg:text-xl text-gray-700">
          Welcome to Happy Tails Where Every Wag Matters!<br/>
          At Happy Tails, we believe that pets aren't just animals — they're family. That's why we've created a one-stop destination for pet lovers who want nothing but the best for their furry companions.<br/> 
          From thrilling dog races and exciting pet events to a carefully curated selection of pet essentials and stylish accessories, Happy Tails brings together community, care, and convenience — all under one digital roof. Our mission is to make pet parenting joyful and stress-free by connecting you with experiences and products that keep tails wagging and hearts full.
        </p>
      </div>
    </section>
  );
};

export default About;