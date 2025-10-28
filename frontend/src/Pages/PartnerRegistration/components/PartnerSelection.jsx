// pages/PartnerRegistration/components/PartnerSelection.jsx
import React from 'react';

const PartnerSelection = ({ onSelectPartner }) => {
  const partnerTypes = [
    {
      id: 'store',
      title: 'Store Partner',
      icon: '🏪',
      color: 'bg-yellow-400',
      description: 'Sell pet products and accessories through our platform',
      features: [
        'Reach thousands of pet owners',
        'Manage inventory easily',
        'Get featured in our marketplace'
      ]
    },
    {
      id: 'event',
      title: 'Event Manager',
      icon: '🎪',
      color: 'bg-blue-400',
      description: 'Organize and manage pet events in your area',
      features: [
        'Host exciting pet events',
        'Connect with pet lovers',
        'Build your event portfolio'
      ]
    }
  ];

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
          Join Our Partner Network
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose your path and become part of the Happy Tails family. Grow your business with us!
        </p>
      </div>

      {/* Partner Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {partnerTypes.map((partner) => (
          <PartnerCard 
            key={partner.id}
            partner={partner}
            onSelect={onSelectPartner}
          />
        ))}
      </div>
    </>
  );
};

const PartnerCard = ({ partner, onSelect }) => (
  <div className="bg-white rounded-3xl border-4 border-black p-6 card-hover cursor-pointer">
    <div className="text-center mb-6">
      <div className={`w-20 h-20 ${partner.color} rounded-2xl border-2 border-black flex items-center justify-center mx-auto mb-4`}>
        <span className="text-2xl">{partner.icon}</span>
      </div>
      <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2">{partner.title}</h3>
      <p className="text-gray-600">{partner.description}</p>
    </div>
    <ul className="space-y-3 mb-6">
      {partner.features.map((feature, index) => (
        <li key={index} className="flex items-center text-sm text-gray-700">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
          {feature}
        </li>
      ))}
    </ul>
    <button 
      onClick={() => onSelect(partner.id)}
      className="w-full py-4 bg-[#1a1a1a] text-white rounded-xl font-semibold hover:bg-[#1a1a1a]/90 transition-colors"
    >
      Become {partner.title}
    </button>
  </div>
);

export default PartnerSelection;