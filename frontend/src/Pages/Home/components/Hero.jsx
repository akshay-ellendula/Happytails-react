// components/Hero.jsx
import React from 'react';
import { images } from '../../../assets/assets';

const Hero = () => {
  return (
    <section className="relative h-screen bg-[#effe8b]">
      <div className="fade-in absolute w-full top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1a1a] mb-5 drop-shadow-lg">For The Pet who has EveryThing...</h1>
        <p className="text-xl md:text-2xl lg:text-3xl text-[#1a1a1a] drop-shadow-lg">Still Deserves More!</p>
      </div>
      <img 
        src={images.img3} 
        className="absolute w-[75px] h-[75px] md:w-48 md:h-48 top-[80%] md:top-[70%] left-[65%] md:left-[85%] object-cover rounded-lg shadow-lg -z-10 md:z-0 border-2 border-black" 
        alt="Dog" 
      />
      <img 
        src={images.img2}
        className="absolute w-[75px] h-[75px] md:w-48 md:h-48 top-[65%] md:top-[45%] left-[30%] md:left-0 object-cover rounded-lg shadow-lg -z-10 md:z-0 border-2 border-black" 
        alt="Cat" 
      />
      <img 
        src={images.img4} 
        className="absolute w-[120px] h-[120px] md:w-48 md:h-48 top-[35%] md:top-[10%] left-[15%] md:left-[25%] object-cover rounded-lg shadow-lg -z-10 md:z-0 border-2 border-black" 
        alt="Dog playing" 
      />
    </section>
  );
};

export default Hero;