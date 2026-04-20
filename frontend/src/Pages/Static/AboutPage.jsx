import React from "react";
import { Link } from "react-router-dom";
import { PawPrint, Heart, Users, ShieldCheck, Sparkles } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";


const AboutPage = () => {
  return (
    <div className="bg-[#050505] min-h-screen text-white font-outfit">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">About HappyTails</h1>
        <p className="text-white/50 text-lg mb-16 max-w-2xl">
          We're on a mission to make every pet's life better — one event, one product, and one community at a time.
        </p>

        <div className="grid sm:grid-cols-2 gap-8 mb-20">
          <div className="bg-[#111] rounded-2xl p-8">
            <Heart className="w-8 h-8 text-[#f2c737] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Our Mission</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              To create a vibrant ecosystem where pet lovers can discover events, shop premium accessories, and connect with like-minded people who share their passion for animals.
            </p>
          </div> 
          <div className="bg-[#111] rounded-2xl p-8">
            <Users className="w-8 h-8 text-[#f2c737] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Our Community</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Thousands of pet owners, event managers, and store partners trust HappyTails to bring joy to their furry friends through curated experiences and quality products.
            </p>
          </div>
          { <div className="bg-[#111] rounded-2xl p-8">
            <ShieldCheck className="w-8 h-8 text-[#f2c737] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Trust & Safety</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Every vendor and event manager on our platform is verified. We ensure secure payments, quality products, and safe event experiences for you and your pets.
            </p>
          </div> }
          <div className="bg-[#111] rounded-2xl p-8">
            <Sparkles className="w-8 h-8 text-[#f2c737] mb-4" />
            <h3 className="text-lg font-semibold mb-2">What We Offer</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              From premium pet accessories and toys to fun-filled pet events and community meetups — HappyTails is your one-stop destination for everything your pet needs.
            </p>
          </div>
        </div>

        <div className="text-center border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-4">Want to partner with us?</h2>
          <p className="text-white/40 mb-8 max-w-md mx-auto">
            Whether you're a store owner or event organizer, join HappyTails and grow your reach.
          </p>
          <Link to="/partnerRegistrataion" className="px-8 py-3 bg-[#f2c737] text-black font-semibold rounded-lg hover:bg-white transition-colors">
            Become a Partner
          </Link>
        </div> 
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
