import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const ContactPage = () => {
  return (
    <div className="bg-[#050505] min-h-screen text-white font-outfit">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-white/50 text-lg mb-16 max-w-2xl">
          Have a question, feedback, or need help? We'd love to hear from you.
        </p>

        <div className="grid md:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#111] rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-[#f2c737]" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <p className="text-white/50 text-sm">support@happytails.com</p>
                <p className="text-white/30 text-xs mt-1">We typically respond within 24 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#111] rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-[#f2c737]" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Phone</h3>
                <p className="text-white/50 text-sm">+91 98765 43210</p>
                <p className="text-white/30 text-xs mt-1">Mon–Fri, 10 AM – 6 PM IST</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#111] rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#f2c737]" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Address</h3>
                <p className="text-white/50 text-sm">Hyderabad, Telangana, India</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
