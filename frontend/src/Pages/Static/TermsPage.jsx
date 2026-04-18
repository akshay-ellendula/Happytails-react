import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const TermsPage = () => {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using HappyTails, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform."
    },
    {
      title: "2. User Accounts",
      content: "You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information during registration and to update your information as needed. HappyTails reserves the right to suspend or terminate accounts that violate these terms."
    },
    {
      title: "3. Orders & Payments",
      content: "All orders placed through HappyTails are subject to availability and confirmation. Prices are displayed in INR and include applicable taxes unless stated otherwise. Payment is processed securely through Stripe. We reserve the right to cancel orders if fraud or unauthorized activity is detected."
    },
    {
      title: "4. Shipping & Delivery",
      content: "Delivery timelines are estimates and may vary depending on your location. HappyTails is not liable for delays caused by third-party shipping providers. You are responsible for providing accurate delivery information."
    },
    {
      title: "5. Returns & Refunds",
      content: "If you receive a damaged or incorrect product, please contact us within 7 days of delivery. Refunds will be processed to your original payment method within 5-10 business days after the return is approved."
    },
    {
      title: "6. Event Bookings",
      content: "Event tickets purchased through HappyTails are non-refundable unless the event is cancelled by the organizer. In case of cancellation, a full refund will be issued automatically."
    },
    {
      title: "7. Intellectual Property",
      content: "All content on HappyTails, including logos, text, images, and software, is the property of HappyTails or its licensors and is protected by applicable intellectual property laws."
    },
    {
      title: "8. Limitation of Liability",
      content: "HappyTails shall not be liable for any indirect, incidental, or consequential damages arising from the use of our platform. Our total liability shall not exceed the amount paid by you for the specific product or service in question."
    },
    {
      title: "9. Changes to Terms",
      content: "We reserve the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms."
    }
  ];

  return (
    <div className="bg-[#050505] min-h-screen text-white font-outfit">
      <Header />

      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: April 2025</p>

        <div className="space-y-8">
          {sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-lg font-semibold mb-2 text-white/90">{section.title}</h2>
              <p className="text-white/50 text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsPage;
