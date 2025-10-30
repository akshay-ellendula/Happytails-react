import { ChevronLeft } from 'lucide-react';

const BillingDetails = ({ formData, onInputChange, onContinue, onBack }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-[#1a1a1a] transition"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <div>
            <p className="text-sm text-gray-500 mb-1">Step 2</p>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">Billing Details</h2>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full border-2 border-gray-300"></div>
      </div>

      <p className="text-sm text-gray-600 mb-6">These details will be shown on your invoice *</p>

      {/* Form */}
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Full Name *</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a1a] text-[#1a1a1a] font-medium"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Phone Number *</label>
          <input 
            type="tel" 
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            placeholder="Enter your phone number"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a1a] text-[#1a1a1a] font-medium"
            required
          />
        </div>

        {/* State */}
        <div>
          <label className="text-sm text-gray-600 mb-2 block">State *</label>
          <select 
            value={formData.state}
            onChange={(e) => onInputChange('state', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a1a] text-[#1a1a1a] font-medium bg-white"
          >
            <option value="">Select your state</option>
            <option value="Telangana">Telangana</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
          </select>
        </div>

        {/* Email */}
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Email Address *</label>
          <input 
            type="email" 
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#1a1a1a] text-[#1a1a1a] font-medium"
            required
          />
          <p className="text-xs text-gray-500 mt-2">
            We'll email you ticket confirmation and invoices
          </p>
        </div>

        {/* Terms & Conditions */}
        <div className="flex items-start space-x-3 pt-4">
          <input 
            type="checkbox" 
            id="terms" 
            checked={formData.acceptTerms}
            onChange={(e) => onInputChange('acceptTerms', e.target.checked)}
            className="w-5 h-5 mt-1 text-[#1a1a1a] border-2 border-gray-300 rounded focus:ring-[#1a1a1a]"
          />
          <label htmlFor="terms" className="text-sm text-[#1a1a1a]">
            I have read and accepted the{' '}
            <a href="#" className="text-blue-600 hover:underline">terms and conditions</a>
          </label>
        </div>

        {/* Continue Button */}
        <button 
          onClick={onContinue}
          className="w-full bg-[#1a1a1a] text-white font-bold py-4 rounded-full hover:bg-gray-800 transition uppercase mt-6"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default BillingDetails;