import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const faqData = [
  {
    question: "What is HappyTails?",
    answer: "HappyTails is a platform for pet lovers to discover pet events, shop premium pet accessories, and connect with the pet community. We bring together event managers, store partners, and pet owners in one place."
  },
  {
    question: "How do I create an account?",
    answer: "Click on 'Sign Up' in the navigation bar. You can register using your email or sign in with Google. It only takes a few seconds!"
  },
  {
    question: "How do I place an order?",
    answer: "Browse our Pet Shop, add items to your cart, proceed to checkout, enter your shipping address, and complete payment through our secure Stripe gateway."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit and debit cards (Visa, Mastercard, American Express) through Stripe's secure payment processing. Your card details are never stored on our servers."
  },
  {
    question: "How can I track my order?",
    answer: "Go to 'My Orders' from your profile. Click on any order to see its current status, shipping details, and delivery timeline."
  },
  {
    question: "Can I return or exchange a product?",
    answer: "Yes! If you receive a damaged or incorrect product, contact us within 7 days of delivery. We'll arrange a return and process your refund within 5-10 business days."
  },
  {
    question: "How do I book an event ticket?",
    answer: "Browse the Pet Events page, select an event you're interested in, choose the number of tickets, and complete the booking. Your tickets will appear in 'My Events'."
  },
  {
    question: "I'm a store owner. How do I list my products?",
    answer: "Register as a Store Partner through our Partner Registration page. Once approved, you'll get access to the Shop Manager dashboard where you can add products, manage orders, and view analytics."
  },
  {
    question: "I'm an event organizer. How do I list my events?",
    answer: "Register as an Event Manager through our Partner Registration page. After verification, you'll get access to the Event Manager dashboard to create and manage events."
  },
  {
    question: "How do I contact support?",
    answer: "You can reach us at support@happytails.com or through our Contact Us page. We typically respond within 24 hours on business days."
  }
];

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className="font-medium text-white/90 group-hover:text-white transition-colors pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-white/30 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#f2c737]' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-5 pr-10">
          <p className="text-white/50 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQPage = () => {
  return (
    <div className="bg-[#050505] min-h-screen text-white font-outfit">
      <Header />

      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-white/50 text-lg mb-12 max-w-2xl">
          Got questions? We've got answers. If you can't find what you're looking for, feel free to contact us.
        </p>

        <div>
          {faqData.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQPage;
