import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../utils/axios';
import { CreditCard, Calendar, Lock, ArrowLeft } from 'lucide-react';
import Header from '../Home/components/Header'; // Using the consistent header
import Footer from '../../components/Footer'; // Using the consistent footer

const PaymentPage = () => {
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    // Formatting for card number (adds spaces)
    if (name === 'number') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (value.length > 19) return; // 16 digits + 3 spaces
    }
    
    // Formatting for expiry date (adds /)
    if (name === 'expiry') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (value.length > 5) return;
    }
    
    // Formatting for CVV (max 4 digits)
    if (name === 'cvv') {
      value = value.replace(/\D/g, '');
      if (value.length > 4) return;
    }

    setCardData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const cleanCardNumber = cardData.number.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cleanCardNumber)) {
      toast.error('Please enter a valid 16-digit card number');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      toast.error('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    if (!/^\d{3,4}$/.test(cardData.cvv)) {
      toast.error('Please enter a valid 3 or 4-digit CVV');
      return false;
    }
    if (!cardData.name.trim()) {
      toast.error('Please enter the name on the card');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      const paymentData = {
        cardNumber: cardData.number,
        expiryDate: cardData.expiry,
        cvv: cardData.cvv
      };

      // This endpoint reads the checkout_session cookie you set in the backend
      const response = await axiosInstance.post('/products/process-payment', paymentData);

      if (response.data.success) {
        toast.success('Payment successful! Redirecting to your orders...');
        navigate(response.data.redirectUrl || '/my_orders');
      } else {
        toast.error(response.data.message || 'Payment failed.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#effe8b] min-h-screen flex flex-col font-outfit">
      <Header />
      
      <div className="grow flex items-center justify-center py-12 px-4">
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md border-4 border-black">
          
          {/* Back Button */}
          <button
            onClick={() => navigate('/pet_accessory')} // Go back to shop
            className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            disabled={isProcessing}
          >
            <ArrowLeft size={20} />
            Back to Shop
          </button>

          <div className="px-8 sm:px-12 py-16 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-6">
              Secure Payment
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <FormInput
                name="name"
                placeholder="Name on Card"
                value={cardData.name}
                onChange={handleInputChange}
                icon={User}
              />
              <FormInput
                name="number"
                placeholder="Card Number (XXXX XXXX XXXX XXXX)"
                value={cardData.number}
                onChange={handleInputChange}
                icon={CreditCard}
                maxLength={19}
              />
              <div className="flex gap-4">
                <FormInput
                  name="expiry"
                  placeholder="Expiry (MM/YY)"
                  value={cardData.expiry}
                  onChange={handleInputChange}
                  icon={Calendar}
                  maxLength={5}
                />
                <FormInput
                  name="cvv"
                  placeholder="CVV"
                  value={cardData.cvv}
                  onChange={handleInputChange}
                  icon={Lock}
                  maxLength={4}
                  type="password"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full cursor-pointer rounded-xl text-sm font-bold px-8 py-4 mt-4 uppercase tracking-wider transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-4 focus:ring-opacity-50 border-2 border-black ${
                  isProcessing
                    ? 'bg-gray-400 text-gray-800 cursor-not-allowed'
                    : 'bg-[#1a1a1a] text-white hover:bg-gray-800 focus:ring-[#1a1a1a]'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Pay Securely'}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

// Re-using your FormInput component style from Authpage for consistency
const FormInput = ({ type = 'text', name, placeholder, value, onChange, icon: Icon, ...props }) => (
  <div className="w-full">
    <div className="relative">
      {Icon && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon size={20} />
        </span>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-5 py-4 my-2 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#effe8b] focus:ring-2 focus:ring-[#effe8b] focus:ring-opacity-50 transition-all placeholder-gray-400 ${
          Icon ? 'pl-12' : ''
        }`}
        {...props}
      />
    </div>
  </div>
);

// We need to import User from lucide-react for the FormInput
import { User } from 'lucide-react';

export default PaymentPage;