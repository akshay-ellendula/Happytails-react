// pages/Home/components/CallToAction.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Handshake, ArrowRight, Zap, Globe, TrendingUp } from 'lucide-react';

const CallToAction = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-[#1a1a1a] relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#f2c737]/5 blur-3xl"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Main CTA Card */}
        <div className={`max-w-5xl mx-auto text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f2c737]/10 border border-[#f2c737]/20 mb-6">
            <Handshake className="w-4 h-4 text-[#f2c737]" />
            <span className="text-sm font-bold text-[#f2c737] uppercase tracking-wider">Become a Partner</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
            Got an Event?
            <br />
            <span className="text-[#f2c737]">List it on HappyTails</span>
          </h2>

          <p className="text-white/50 text-lg max-w-2xl mx-auto mb-12">
            Reach thousands of pet lovers, sell tickets effortlessly, and grow your 
            pet event business with our powerful platform.
          </p>

          {/* Benefits row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
            {[
              { icon: Zap, label: "Instant Setup", desc: "Go live in minutes" },
              { icon: Globe, label: "Wide Reach", desc: "10K+ active pet lovers" },
              { icon: TrendingUp, label: "Analytics", desc: "Track every sale" },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#f2c737]/30 transition-all duration-300 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${(i + 1) * 200}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-[#f2c737]/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-[#f2c737]" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">{item.label}</h3>
                <p className="text-white/40 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Link
            to="/partnerRegistrataion"
            className="group inline-flex items-center gap-3 px-10 py-5 text-lg text-[#1a1a1a] bg-[#f2c737] rounded-full font-bold hover:shadow-[0_0_60px_rgba(242,199,55,0.3)] transition-all duration-300 hover:scale-105 animate-pulse-glow"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
