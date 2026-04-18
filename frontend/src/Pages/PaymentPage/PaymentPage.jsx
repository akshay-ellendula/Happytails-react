import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
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

// Stripe config tailored to the luxurious dark theme
const ELEMENT_STYLE = {
  style: {
    base: {
      fontSize: "16px",
      color: "#ffffff",
      fontFamily: "Outfit, sans-serif",
      "::placeholder": { color: "rgba(255,255,255,0.2)" },
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
      toast.success("Payment successful! Directed to Vault...");
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
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Card Number */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
          <CreditCard size={14} />
          Primary Vector
        </label>
        <div className="border border-white/20 rounded-lg px-4 py-4 bg-transparent outline-none transition-colors hover:border-white/30 focus-within:border-[#f2c737] shadow-inner">
          <CardNumberElement options={{ ...ELEMENT_STYLE, showIcon: true, iconStyle: 'solid' }} />
        </div>
      </div>

      {/* Expiry & CVC Row */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
            <Calendar size={14} />
            Lifespan
          </label>
          <div className="border border-white/20 rounded-lg px-4 py-4 bg-transparent transition-colors hover:border-white/30 focus-within:border-[#f2c737] shadow-inner">
            <CardExpiryElement options={ELEMENT_STYLE} />
          </div>
        </div>
        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
            <Lock size={14} />
            CCV Array
          </label>
          <div className="border border-white/20 rounded-lg px-4 py-4 bg-transparent transition-colors hover:border-white/30 focus-within:border-[#f2c737] shadow-inner">
            <CardCvcElement options={ELEMENT_STYLE} />
          </div>
        </div>
      </div>

      <p className="text-[10px] text-white/30 uppercase tracking-widest text-center pt-2">
        Dev Gateway: 4242 4242 4242 4242 · Any future date · Any 3-digit CVV
      </p>

      <div className="col-span-2 pt-6">
          <button
            type="submit"
            disabled={isProcessing || !clientSecret}
            className={`group w-full relative h-14 rounded-lg flex items-center justify-center font-black tracking-widest uppercase text-base transition-all duration-300 overflow-hidden ${isProcessing || !clientSecret
                ? "bg-white/10 text-white/30 cursor-not-allowed shadow-none"
                : "bg-[#f2c737] text-black shadow-[0_5px_20px_rgba(242,199,55,0.15)] hover:shadow-[0_10px_30px_rgba(242,199,55,0.3)] hover:scale-[1.01]"
              }`}
          >
              {!isProcessing && clientSecret && (
                <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {isProcessing ? "Transacting..." : <><Lock size={16} /> Finalize Authorization</>}
              </span>
          </button>
      </div>
    </form>
  );
};

const PaymentPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="bg-[#050505] min-h-screen flex flex-col font-outfit text-white relative overflow-hidden">
      
       {/* Ambient Lighting */ }
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-t from-[#f2c737]/10 to-transparent blur-[120px] translate-y-1/2" />
         <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-b from-[#f2c737]/5 to-transparent blur-[100px]" />
      </div>

      <Header onMenuToggle={toggleMobileMenu} />
      {isMobileMenuOpen && (
         <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="grow flex items-center justify-center py-12 px-6 relative z-10">
        <div className="w-full max-w-lg">
          
          <div className="mb-8">
            <Link
              to="/checkout"
              className="inline-flex items-center gap-2 text-white/40 hover:text-[#f2c737] transition-colors font-bold uppercase tracking-widest text-xs mb-6"
            >
              <ArrowLeft size={16} /> Modify Manifest
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black tracking-widest uppercase border-b border-white/10 pb-4">
              Gateway
            </h1>
          </div>

          <div className="bg-transparent mt-8">
            <p className="mb-8 border border-white/10 bg-white/5 rounded-lg px-4 py-3 text-xs uppercase tracking-widest font-bold text-white/60">
              Stripe development pipeline active.
            </p>

            {stripePromise ? (
              <Elements stripe={stripePromise}>
                <CheckoutForm />
              </Elements>
            ) : (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-5 text-sm font-bold tracking-widest uppercase text-red-500 mt-6">
                Missing `VITE_STRIPE_PUBLISHABLE_KEY` in environment config.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 relative z-10 w-full">
         <Footer />
      </div>
    </div>
  );
};

export default PaymentPage;
