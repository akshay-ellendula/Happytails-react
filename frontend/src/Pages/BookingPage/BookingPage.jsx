import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import toast from "react-hot-toast";
import { axiosInstance } from "../../utils/axios.js";
import Header from "../../components/Header";
import MobileMenu from "../../components/MobileMenu";
import TimerBanner from "./components/TimerBanner";
import OrderSummary from "./components/OrderSummary";
import BillingDetails from "./components/BillingDetails";
import CheckoutModal from "./components/CheckoutModal";

const BookingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;
  const [currentStep, setCurrentStep] = useState(1); // 1: Order, 2: Billing, 3: Payment
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes timer
  const [ticketCount, setTicketCount] = useState(1);
  const hasToastShown = useRef(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    state: "Telangana",
    email: "",
    acceptTerms: false,
  });

  // Redirect if no event data
  useEffect(() => {
    if (!event) {
      toast.error("No event selected");
      navigate("/events");
      return;
    }
  }, [event, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasToastShown.current) {
            hasToastShown.current = true;
            toast("Booking time expired! Please try again.");
            navigate("/events");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Calculate prices
  const ticketPrice = event?.price || 0;
  const baseAmount = ticketPrice * ticketCount;
  const bookingFee = Math.round(baseAmount * 0.1); // 10% booking fee
  const grandTotal = baseAmount + bookingFee;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTicketChange = (newCount) => {
    if (newCount < 1) return;
    if (newCount > (event?.ticketsLeft || 1)) {
      toast.error(`Only ${event.ticketsLeft} tickets available`);
      return;
    }
    setTicketCount(newCount);
  };

  // Step 1: Order Summary Continue
  const handleOrderContinue = () => {
    if (ticketCount < 1) {
      toast.error("Please select at least 1 ticket");
      return;
    }
    setCurrentStep(2); // Move to billing details
  };

  // Step 2: Billing Details Continue
  const handleBillingContinue = () => {
    if (!formData.name || !formData.phone || !formData.email) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!formData.acceptTerms) {
      toast.error("Please accept terms and conditions");
      return;
    }
    setShowModal(true); // Open payment modal
  };

  const handlePaymentSuccess = async () => {
    try {
      // Make API call to create ticket
      await axiosInstance.post(`/tickets/${event.id}`, {
        numberOfTickets: ticketCount,
      });
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Booking failed. Please try again.");
    }
  };

  if (!event) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header onMenuToggle={toggleMobileMenu} />
      {isMobileMenuOpen && (
        <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
      )}
      <TimerBanner time={formatTime(timeLeft)} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#1a1a1a] mb-8">
          Review your booking for {event.title}
        </h1>

        {/* Step 1: Order Summary */}
        {currentStep === 1 && (
          <OrderSummary
            event={event}
            ticketCount={ticketCount}
            onTicketChange={handleTicketChange}
            baseAmount={baseAmount}
            bookingFee={bookingFee}
            grandTotal={grandTotal}
            onContinue={handleOrderContinue}
          />
        )}

        {/* Step 2: Billing Details */}
        {currentStep === 2 && (
          <BillingDetails
            formData={formData}
            onInputChange={handleInputChange}
            onContinue={handleBillingContinue}
            onBack={() => setCurrentStep(1)} // Add back button
          />
        )}
      </main>

      {/* Step 3: Payment Modal */}
      <CheckoutModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        grandTotal={grandTotal}
      />
    </div>
  );
};

export default BookingPage;
