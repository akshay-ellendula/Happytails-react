import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../utils/axios';
import { X, Check, ArrowLeft, Loader2 } from 'lucide-react';
import Header from '../../components/Header';
import MobileMenu from '../../components/MobileMenu';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { calculateTotals } = useCart();
  const totals = calculateTotals();
  const grandTotal = totals.total;

  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    nickname: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // --- Input Handling & Formatting ---
  const handleInputChange = (name, value) => {
    if (name === 'number') {
      // Remove non-digits and add space every 4 digits
      value = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (value.length > 19) return;
    } else if (name === 'expiry') {
      // Allow only numbers and slash
      value = value.replace(/[^\d/]/g, '');
      // Auto-insert slash after 2 digits if not deleting
      if (value.length === 2 && cardData.expiry.length === 1) {
        value += '/';
      }
      if (value.length > 5) return;
    } else if (name === 'cvv') {
      // Only numbers, max 4
      value = value.replace(/\D/g, '');
      if (value.length > 4) return;
    } else if (name === 'name') {
        // Simple name validation (optional regex can be added)
    }

    setCardData(prev => ({ ...prev, [name]: value }));
  };

  // --- Validation Logic ---
  const validateForm = () => {
    const cleanNumber = cardData.number.replace(/\s/g, '');
    
    if (cleanNumber.length !== 16) {
      toast.error("Invalid card number length");
      return false;
    }
    
    // Luhn Algorithm for card validity
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i));
      if (shouldDouble) {
        if ((digit *= 2) > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    if (sum % 10 !== 0) {
        toast.error("Invalid card number");
        return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      toast.error("Invalid expiry date (MM/YY)");
      return false;
    }

    // Check expiry date logic
    const [month, year] = cardData.expiry.split('/').map(num => parseInt(num, 10));
    const now = new Date();
    const currentYear = parseInt(now.getFullYear().toString().substr(-2));
    const currentMonth = now.getMonth() + 1;

    if (month < 1 || month > 12) {
        toast.error("Invalid month");
        return false;
    }
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        toast.error("Card has expired");
        return false;
    }

    if (cardData.cvv.length < 3) {
      toast.error("Invalid CVV");
      return false;
    }

    if (!cardData.name.trim()) {
      toast.error("Name on card is required");
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      const paymentData = {
        cardNumber: cardData.number,
        expiryDate: cardData.expiry,
        cvv: cardData.cvv,
        cardHolder: cardData.name,
        amount: grandTotal
      };

      const response = await axiosInstance.post('/products/process-payment', paymentData);

      if (response.data.success) {
        toast.success("Payment Successful!");
        navigate(response.data.redirectUrl || '/my_orders');
      } else {
        toast.error(response.data.message || "Payment Failed");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Transaction failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#effe8b] min-h-screen flex flex-col font-outfit">
      <Header onMenuToggle={toggleMobileMenu} />
      {isMobileMenuOpen && (
        <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Main Content Area - Centered Overlay */}
      <div className="flex-1 flex items-center justify-center p-4 py-12 relative">
        
        {/* Card Container */}
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative border-4 border-black">
            
            {/* Close / Back Button */}
            <button 
                onClick={() => navigate('/pet_accessory')}
                disabled={isProcessing}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
                <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Payment Details</h2>

            {/* Payment Method Selector */}
            <div className="border-2 border-green-500 bg-green-50 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                        <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-[#1a1a1a]">Debit / Credit / ATM Card</span>
                </div>

                {/* Card Logos */}
                <div className="flex items-center space-x-3 pl-8">
                    <div className="h-6 bg-blue-900 text-white px-2 rounded text-[10px] font-bold flex items-center tracking-tighter shadow-sm">VISA</div>
                    <div className="h-6 bg-red-600 text-white px-2 rounded text-[10px] font-bold flex items-center shadow-sm">MC</div>
                    <span className="text-xs font-semibold text-gray-500 border border-gray-300 px-1.5 py-0.5 rounded bg-white">RuPay</span>
                    <span className="text-xs font-semibold text-gray-500 border border-gray-300 px-1.5 py-0.5 rounded bg-white">Amex</span>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
                {/* Name */}
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Name on Card <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        value={cardData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter name as on card"
                        className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all font-medium text-gray-800 placeholder-gray-400"
                        disabled={isProcessing}
                    />
                </div>

                {/* Number */}
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Card Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={cardData.number}
                            onChange={(e) => handleInputChange('number', e.target.value)}
                            placeholder="0000 0000 0000 0000"
                            className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all font-mono font-medium text-gray-800 placeholder-gray-400"
                            disabled={isProcessing}
                            maxLength={19}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                        </div>
                    </div>
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Expiry Date <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            placeholder="MM/YY"
                            value={cardData.expiry}
                            onChange={(e) => handleInputChange('expiry', e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all font-mono font-medium text-gray-800 placeholder-gray-400 text-center"
                            disabled={isProcessing}
                            maxLength={5}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">CVV <span className="text-red-500">*</span></label>
                        <input 
                            type="password" 
                            placeholder="123"
                            value={cardData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all font-mono font-medium text-gray-800 placeholder-gray-400 text-center"
                            disabled={isProcessing}
                            maxLength={4}
                        />
                    </div>
                </div>

                {/* Nickname */}
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Nickname (Optional)</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Salary Card"
                        value={cardData.nickname}
                        onChange={(e) => handleInputChange('nickname', e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all font-medium text-gray-800 placeholder-gray-400"
                        disabled={isProcessing}
                    />
                </div>
            </div>

            {/* Action Button */}
            <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className={`w-full mt-8 font-bold text-lg py-4 rounded-full transition-all duration-300 uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center ${
                    isProcessing 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-[#1a1a1a] text-white hover:bg-black'
                }`}
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="animate-spin mr-2 w-5 h-5" /> Processing...
                    </>
                ) : (
                    `Pay ₹${grandTotal}`
                )}
            </button>

            {/* Footer Trust Badges */}
            <div className="text-center mt-6">
                <p className="text-[10px] text-gray-400 mb-2 font-medium">
                    Secured by 256-bit SSL Encryption
                </p>
                <div className="flex justify-center items-center space-x-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <span>Verified by VISA</span>
                    <span>•</span>
                    <span>Mastercard SecureCode</span>
                </div>
            </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentPage;