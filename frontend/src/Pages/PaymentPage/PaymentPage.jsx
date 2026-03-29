import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../utils/axios";
import { ArrowLeft, CreditCard, Calendar, Lock } from "lucide-react";
import Header from "../../components/Header";
import MobileMenu from "../../components/MobileMenu";
import Footer from "../../components/Footer";
import { useCart } from "../../context/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const ELEMENT_STYLE = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1a1a1a",
      fontFamily: "Outfit, sans-serif",
      "::placeholder": { color: "#9ca3af" },
      lineHeight: "24px",
    },
    invalid: { color: "#ef4444", iconColor: "#ef4444" },
  },
};

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  const finalizeOrder = useCallback(async (paymentIntentId) => {
    const response = await axiosInstance.post("/products/process-payment", {
      paymentIntentId,
    });

    if (response.data.success) {
      clearCart();
      toast.success("Payment successful! Redirecting to your orders...");
      navigate(response.data.redirectUrl || "/my_orders");
      return;
    }

    toast.error(response.data.message || "Order creation failed.");
  }, [clearCart, navigate]);

  useEffect(() => {
    axiosInstance
      .post("/products/create-payment-intent")
      .then((res) => {
        if (!res.data.success) {
          toast.error("Could not initialise payment. Please try again.");
          return;
        }

        if (res.data.paymentCompleted && res.data.paymentIntentId) {
          finalizeOrder(res.data.paymentIntentId).catch((err) => {
            toast.error(err.response?.data?.message || "Could not complete your order.");
          });
          return;
        }

        if (res.data.clientSecret) {
          setClientSecret(res.data.clientSecret);
          return;
        }

        toast.error("Could not initialise payment. Please try again.");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Session expired. Please restart checkout.");
        navigate("/checkout");
      });
  }, [finalizeOrder, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setIsProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: { card: elements.getElement(CardNumberElement) },
        }
      );

      if (error) {
        toast.error(error.message || "Payment failed. Please try again.");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        await finalizeOrder(paymentIntent.id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Card Number */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <CreditCard size={16} />
          Card Number
        </label>
        <div className="border-2 border-gray-200 rounded-xl px-4 py-4 focus-within:border-[#c8cc70] transition-all bg-white">
          <CardNumberElement options={{ ...ELEMENT_STYLE, showIcon: true }} />
        </div>
      </div>

      {/* Expiry & CVC Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Calendar size={16} />
            Expiry Date
          </label>
          <div className="border-2 border-gray-200 rounded-xl px-4 py-4 focus-within:border-[#c8cc70] transition-all bg-white">
            <CardExpiryElement options={ELEMENT_STYLE} />
          </div>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Lock size={16} />
            CVC
          </label>
          <div className="border-2 border-gray-200 rounded-xl px-4 py-4 focus-within:border-[#c8cc70] transition-all bg-white">
            <CardCvcElement options={ELEMENT_STYLE} />
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center pt-1">
        Test card: 4242 4242 4242 4242 · Any future date · Any 3-digit CVV
      </p>

      <button
        type="submit"
        disabled={isProcessing || !clientSecret}
        className={`w-full cursor-pointer rounded-xl text-sm font-bold px-8 py-4 uppercase tracking-wider transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-4 focus:ring-opacity-50 border-2 border-black ${isProcessing || !clientSecret
            ? "bg-gray-400 text-gray-800 cursor-not-allowed"
            : "bg-[#1a1a1a] text-white hover:bg-gray-800 focus:ring-[#1a1a1a]"
          }`}
      >
        {isProcessing ? "Processing..." : "Pay Securely"}
      </button>
    </form>
  );
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="bg-[#effe8b] min-h-screen flex flex-col font-outfit">
      <Header onMenuToggle={toggleMobileMenu} />
      {isMobileMenuOpen && (
        <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="grow flex items-center justify-center py-12 px-4">
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md border-4 border-black">
          <button
            onClick={() => navigate("/pet_accessory")}
            className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Shop
          </button>

          <div className="px-8 sm:px-12 py-16 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-6">
              Secure Payment
            </h1>

            <p className="mb-6 rounded-xl border border-dashed border-black/20 bg-[#effe8b]/40 px-4 py-3 text-sm text-gray-700">
              Stripe test mode is enabled. Use test card `4242 4242 4242 4242`
              with any future expiry date and any 3-digit CVV.
            </p>

            {stripePromise ? (
              <Elements stripe={stripePromise}>
                <CheckoutForm />
              </Elements>
            ) : (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-700">
                Add `VITE_STRIPE_PUBLISHABLE_KEY` in `frontend/.env` to load the Stripe test form.
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentPage;
