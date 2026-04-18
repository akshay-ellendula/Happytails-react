// pages/Home/components/Hero.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Sparkles, ShoppingBag, Calendar, Heart, Star, PawPrint } from 'lucide-react';

const Hero = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#1a1a1a]">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#2a2520] to-[#1a1a1a]"></div>

      {/* Animated gradient orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#f2c737]/15 blur-[120px] animate-float"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#f2c737]/10 blur-[100px] animate-float delay-300"></div>
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-[#f2c737]/5 blur-[80px] animate-float delay-500"></div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* Floating decorative paw prints */}
      <div className="absolute top-[15%] left-[8%] text-[#f2c737]/10 animate-float delay-200">
        <PawPrint className="w-16 h-16 sm:w-24 sm:h-24 rotate-[-20deg]" />
      </div>
      <div className="absolute top-[25%] right-[10%] text-[#f2c737]/8 animate-float delay-500">
        <PawPrint className="w-12 h-12 sm:w-20 sm:h-20 rotate-[15deg]" />
      </div>
      <div className="absolute bottom-[25%] left-[15%] text-[#f2c737]/6 animate-float delay-700">
        <PawPrint className="w-10 h-10 sm:w-16 sm:h-16 rotate-[40deg]" />
      </div>
      <div className="absolute bottom-[35%] right-[8%] text-[#f2c737]/10 animate-float delay-100">
        <Heart className="w-8 h-8 sm:w-14 sm:h-14" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center text-center px-5 sm:px-6 py-28">
        {/* Badge */}
        <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f2c737]/10 border border-[#f2c737]/20 backdrop-blur-sm mb-8 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Sparkles className="w-4 h-4 text-[#f2c737]" />
          <span className="text-[#f2c737] text-xs sm:text-sm font-semibold tracking-wider uppercase">India's #1 Pet Community</span>
        </div>

        {/* Paw Emoji */}
        <div className={`text-6xl sm:text-7xl mb-6 transition-all duration-1000 delay-100 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          🐾
        </div>

        {/* Headline */}
        <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-6 leading-[1] tracking-tight max-w-5xl transition-all duration-1000 delay-200 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          For The Pet Who
          <br />
          <span className="relative inline-block">
            <span className="text-[#f2c737]">Has Everything</span>
            {/* Underline decoration */}
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
              <path d="M2 8C50 2 100 2 150 6C200 10 250 4 298 8" stroke="#f2c737" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </span>
        </h1>

        {/* Subheadline */}
        <p className={`text-base sm:text-lg md:text-xl text-white/60 mb-10 max-w-xl sm:max-w-2xl font-light leading-relaxed transition-all duration-1000 delay-400 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          Premium pet events, exclusive accessories, and a community
          that treats every furry friend like family.
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 w-full sm:w-auto transition-all duration-1000 delay-600 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Link
            to="/events"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#f2c737] text-[#1a1a1a] font-bold text-base sm:text-lg rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(242,199,55,0.35)] hover:scale-105"
          >
            <Calendar className="w-5 h-5 transition-transform group-hover:rotate-12" />
            <span>Explore Events</span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
          </Link>

          <Link
            to="/pet_accessory"
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-md text-white font-bold text-base sm:text-lg rounded-full border border-white/20 hover:bg-white hover:text-[#1a1a1a] transition-all duration-300 hover:scale-105"
          >
            <ShoppingBag className="w-5 h-5 transition-transform group-hover:-rotate-12" />
            <span>Shop Now</span>
          </Link>
        </div>

        {/* Stats Bar */}
        <div className={`mt-16 sm:mt-20 grid grid-cols-3 gap-6 sm:gap-16 transition-all duration-1000 delay-800 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {[
            { value: "500+", label: "Events Hosted", color: "text-white" },
            { value: "10K+", label: "Happy Pets", color: "text-[#f2c737]" },
            { value: "200+", label: "Products", color: "text-white" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className={`text-2xl sm:text-3xl md:text-4xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-white/40 text-[10px] sm:text-xs font-medium mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className={`mt-12 flex items-center gap-2 transition-all duration-1000 delay-900 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex -space-x-2">
            {['🐕', '🐈', '🐩', '🦮'].map((emoji, i) => (
              <div key={i} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#2a2a2a] border-2 border-[#1a1a1a] flex items-center justify-center text-sm">
                {emoji}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#f2c737] text-[#f2c737]" />
            ))}
          </div>
          <span className="text-white/40 text-xs sm:text-sm font-medium">Loved by 10,000+ pet parents</span>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-white/40" />
      </div>

      {/* Bottom gradient blend into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-t from-[#f2c737] to-transparent"></div>
    </section>
  );
};

export default Hero;