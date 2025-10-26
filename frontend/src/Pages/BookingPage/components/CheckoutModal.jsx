import { X, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const CheckoutModal = ({ isOpen, onClose, onPaymentSuccess, grandTotal }) => {
  const [cardData, setCardData] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
    nickname: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    // Format card number with spaces
    if (field === 'number') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (value.length > 19) return; // Limit to 16 digits + spaces
    }
    
    // Format expiry date
    if (field === 'expiry') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (value.length > 5) return;
    }
    
    // Format CVV
    if (field === 'cvv') {
      value = value.replace(/\D/g, '');
      if (value.length > 4) return;
    }

    setCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateCard = () => {
    // Basic validation
    if (!cardData.name.trim()) {
      toast.error('Please enter name on card');
      return false;
    }

    const cleanCardNumber = cardData.number.replace(/\s/g, '');
    if (cleanCardNumber.length !== 16 || !/^\d+$/.test(cleanCardNumber)) {
      toast.error('Please enter a valid 16-digit card number');
      return false;
    }

    if (!cardData.expiry || !/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      toast.error('Please enter valid expiry date (MM/YY)');
      return false;
    }

    // Check if card is expired
    const [month, year] = cardData.expiry.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    if (expiryDate < new Date()) {
      toast.error('Card has expired');
      return false;
    }

    if (!cardData.cvv || cardData.cvv.length < 3 || !/^\d+$/.test(cardData.cvv)) {
      toast.error('Please enter valid CVV');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateCard()) return;

    setIsProcessing(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate payment processing
      const isSuccess = Math.random() > 0.1; // 90% success rate
      
      if (isSuccess) {
        toast.success('Payment successful!');
        onPaymentSuccess();
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } catch (error) {
      toast.error('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
        <button 
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Payment Details</h2>

        {/* Payment Method */}
        <div className="border-2 border-green-500 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-[#1a1a1a]">Add Debit / Credit / ATM Card</span>
          </div>

          {/* Card Logos */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-6 bg-blue-900 text-white px-2 rounded text-xs font-bold flex items-center">VISA</div>
            <div className="h-6 bg-red-600 text-white px-2 rounded text-xs font-bold flex items-center">MC</div>
            <span className="text-xs font-semibold text-gray-600">RuPay</span>
            <span className="text-xs font-semibold text-gray-600">Diners</span>
            <span className="text-xs font-semibold text-gray-600">Amex</span>
          </div>

          {/* Card Form */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Name on Card *</label>
              <input 
                type="text" 
                value={cardData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter name as on card"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                disabled={isProcessing}
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">Card Number *</label>
              <input 
                type="text" 
                value={cardData.number}
                onChange={(e) => handleInputChange('number', e.target.value)}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                disabled={isProcessing}
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Expiry Date *</label>
                <input 
                  type="text" 
                  placeholder="MM/YY"
                  value={cardData.expiry}
                  onChange={(e) => handleInputChange('expiry', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                  disabled={isProcessing}
                  maxLength={5}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">CVV *</label>
                <input 
                  type="text" 
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                  disabled={isProcessing}
                  maxLength={4}
                />
              </div>
            </div>

            <div>
              <input 
                type="text" 
                placeholder="Nickname for card (optional)"
                value={cardData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <button 
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full font-bold py-4 rounded-full transition uppercase mb-4 ${
            isProcessing 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {isProcessing ? 'Processing...' : `Pay ₹${grandTotal}`}
        </button>

        {/* Accepted Cards Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">
            We accept Credit and Debit Cards from Visa, Mastercard, Rupay, Diners & American Express
          </p>
          <div className="flex justify-center items-center space-x-3">
            <span className="text-xs font-semibold text-gray-600">Verified by VISA</span>
            <span className="text-xs font-semibold text-gray-600">Mastercard SecureCode</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;