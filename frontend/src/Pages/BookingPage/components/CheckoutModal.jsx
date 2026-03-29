import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { axiosInstance } from '../../../utils/axios.js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1a1a1a',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
};

const PaymentForm = ({ eventId, numberOfTickets, grandTotal, onPaymentSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    if (!eventId || !numberOfTickets) return;
    axiosInstance
      .post(`/tickets/create-payment-intent/${eventId}`, { numberOfTickets })
      .then((res) => {
        if (res.data.success) setClientSecret(res.data.clientSecret);
        else toast.error('Could not initialise payment. Please try again.');
      })
      .catch(() => toast.error('Failed to initialise payment.'));
  }, [eventId, numberOfTickets]);

  const handlePayment = async () => {
    if (!stripe || !elements || !clientSecret) return;

    setIsProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (error) {
        toast.error(error.message || 'Payment failed. Please try again.');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (err) {
      toast.error('Payment processing failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Card Logos */}
      <div className="flex items-center space-x-3 mb-2">
        <div className="h-6 bg-blue-900 text-white px-2 rounded text-xs font-bold flex items-center">VISA</div>
        <div className="h-6 bg-red-600 text-white px-2 rounded text-xs font-bold flex items-center">MC</div>
        <span className="text-xs font-semibold text-gray-600">RuPay</span>
        <span className="text-xs font-semibold text-gray-600">Amex</span>
      </div>

      <div className="border-2 border-gray-200 rounded-xl px-4 py-4 focus-within:border-green-500 transition-all">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      <p className="text-xs text-gray-400 text-center">
        Test card: 4242 4242 4242 4242 · Any future date · Any 3-digit CVV
      </p>

      <button
        onClick={handlePayment}
        disabled={isProcessing || !clientSecret}
        className={`w-full font-bold py-4 rounded-full transition uppercase ${
          isProcessing || !clientSecret
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-red-500 text-white hover:bg-red-600'
        }`}
      >
        {isProcessing ? 'Processing...' : `Pay ₹${grandTotal}`}
      </button>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          We accept Credit and Debit Cards from Visa, Mastercard, Rupay &amp; American Express
        </p>
      </div>
    </div>
  );
};

const CheckoutModal = ({ isOpen, onClose, onPaymentSuccess, grandTotal, eventId, numberOfTickets }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Payment Details</h2>

        <div className="border-2 border-green-500 rounded-xl p-4 mb-6">
          <Elements stripe={stripePromise}>
            <PaymentForm
              eventId={eventId}
              numberOfTickets={numberOfTickets}
              grandTotal={grandTotal}
              onPaymentSuccess={onPaymentSuccess}
              onClose={onClose}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
