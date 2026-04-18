import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const PrivacyPage = () => {
  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect personal information you provide during registration (name, email, password), shipping addresses, payment information (processed securely through Stripe — we do not store card details), and usage data such as browsing behavior and device information."
    },
    {
      title: "2. How We Use Your Information",
      content: "Your information is used to process orders and deliver products, manage event bookings and tickets, personalize your experience and recommendations, send order updates and promotional communications (with your consent), and improve our platform and services."
    },
    {
      title: "3. Information Sharing",
      content: "We do not sell your personal information. We share data only with: payment processors (Stripe) to complete transactions, shipping partners to deliver your orders, and event managers for ticket verification — only the minimum data required."
    },
    {
      title: "4. Data Security",
      content: "We implement industry-standard security measures including SSL encryption, secure password hashing, and regular security audits. However, no method of electronic storage is 100% secure, and we cannot guarantee absolute security."
    },
    {
      title: "5. Cookies",
      content: "We use cookies to maintain your session, remember your preferences, and analyze site traffic. You can control cookie settings through your browser. Disabling cookies may affect some platform functionality."
    },
    {
      title: "6. Your Rights",
      content: "You have the right to access, update, or delete your personal information at any time through your profile settings. You may also request a copy of your data or ask us to stop processing it by contacting our support team."
    },
    {
      title: "7. Third-Party Links",
      content: "Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies before providing personal information."
    },
    {
      title: "8. Changes to This Policy",
      content: "We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on our platform. Continued use of HappyTails after changes constitutes acceptance of the updated policy."
    }
  ];

  return (
    <div className="bg-[#050505] min-h-screen text-white font-outfit">
      <Header />

      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
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

export default PrivacyPage;
