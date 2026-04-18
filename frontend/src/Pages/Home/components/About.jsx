// pages/Home/components/About.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Award, ArrowRight, PawPrint, Star, Users, Calendar } from 'lucide-react';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: Heart, title: "Built with Love", description: "Every feature designed with your pet's happiness in mind" },
    { icon: Shield, title: "Trusted Community", description: "Verified event organizers and quality-checked products" },
    { icon: Award, title: "Premium Quality", description: "Only the best events and accessories for your furry friend" }
  ];

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-[#f2c737] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#1a1a1a]/5 blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-72 h-72 rounded-full bg-white/30 blur-3xl"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center max-w-7xl mx-auto">

          {/* Visual Side — Pure CSS illustration card */}
          <div className={`flex-1 w-full ${isVisible ? 'animate-fade-in-left' : 'opacity-0'}`}>
            <div className="relative">
              {/* Main visual card */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#2d2520] p-8 sm:p-12 shadow-2xl min-h-[300px] sm:min-h-[380px] flex flex-col justify-center items-center text-center">
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: '30px 30px'
                  }}
                ></div>

                {/* Floating paw prints inside card */}
                <PawPrint className="absolute top-6 left-6 w-8 h-8 text-[#f2c737]/15 rotate-[-20deg]" />
                <PawPrint className="absolute bottom-8 right-8 w-10 h-10 text-[#f2c737]/15 rotate-[30deg]" />
                <PawPrint className="absolute top-1/2 right-6 w-6 h-6 text-[#f2c737]/10 rotate-[60deg]" />

                {/* Large emoji */}
                <div className="text-6xl sm:text-8xl mb-6 relative z-10">🐾</div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 relative z-10">HappyTails</h3>
                <p className="text-white/50 text-sm sm:text-base max-w-xs relative z-10">Where every pet finds their perfect match</p>

                {/* Stats row inside card */}
                <div className="flex gap-6 sm:gap-10 mt-8 relative z-10">
                  {[
                    { icon: Calendar, value: "500+", label: "Events" },
                    { icon: Users, value: "10K+", label: "Users" },
                    { icon: Star, value: "4.9", label: "Rating" },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <item.icon className="w-5 h-5 text-[#f2c737] mx-auto mb-1" />
                      <p className="text-lg sm:text-xl font-black text-white">{item.value}</p>
                      <p className="text-white/30 text-[10px] uppercase tracking-wider font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-5 right-2 sm:right-6 bg-white rounded-2xl p-3 sm:p-4 shadow-xl border border-black/5 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#f2c737] rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#1a1a1a]" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-[#1a1a1a]">10K+</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Happy Customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className={`flex-1 ${isVisible ? 'animate-fade-in-right' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1a1a1a]/10 mb-6">
              <span className="text-sm font-bold text-[#1a1a1a] uppercase tracking-wider">Our Story</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1a1a1a] mb-6 leading-tight tracking-tight">
              Where Every Pet
              <span className="block text-[#1a1a1a]/70">Finds Their Perfect Match</span>
            </h2>

            <p className="text-[#1a1a1a]/60 text-base sm:text-lg leading-relaxed mb-8">
              At HappyTails, we believe that pets aren't just animals — they're family.
              That's why we've created a one-stop destination for pet lovers who want
              nothing but the best for their furry companions. From thrilling dog shows
              and exciting pet events to a carefully curated selection of pet essentials,
              we're here to make every moment with your pet special.
            </p>

            {/* Feature Pills */}
            <div className="space-y-3 sm:space-y-4 mb-10">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-3 sm:p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/80 transition-all duration-300 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${(index + 2) * 200}ms` }}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#f2c737]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a1a1a] text-sm">{feature.title}</h3>
                    <p className="text-[#1a1a1a]/50 text-xs sm:text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/about"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-[#1a1a1a] text-white rounded-full font-bold text-base sm:text-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-105"
            >
              Learn More
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;