import { Trash2, Check, Plus, Minus } from "lucide-react";

const OrderSummary = ({
  event,
  ticketCount,
  onTicketChange,
  baseAmount,
  bookingFee,
  grandTotal,
  onContinue,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Step 1</p>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">
            Order Summary
          </h2>
        </div>
        <div className="w-8 h-8 rounded-full border-2 border-green-500 flex items-center justify-center">
          <Check className="w-5 h-5 text-green-500" />
        </div>
      </div>

      {/* Tickets Section */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#1a1a1a] mb-4 uppercase">
          Tickets
        </h3>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-bold text-[#1a1a1a] mb-1">{event.title}</h4>
              <p className="text-sm text-gray-600">Regular Ticket</p>
              <p className="text-xs text-gray-500 mt-1">
                {event.ticketsLeft} tickets available
              </p>
            </div>
            <button className="text-gray-400 hover:text-red-500">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Ticket Counter */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onTicketChange(ticketCount - 1)}
                className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#1a1a1a]"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-lg w-8 text-center">
                {ticketCount}
              </span>
              <button
                onClick={() => onTicketChange(ticketCount + 1)}
                disabled={ticketCount >= event.ticketsLeft}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  ticketCount >= event.ticketsLeft
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 hover:border-[#1a1a1a]"
                }`}
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 ml-2">tickets</span>
            </div>
            <p className="font-bold text-[#1a1a1a]">
              ₹ {event.price * ticketCount}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#1a1a1a] mb-4 uppercase">
          Payment Details
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[#1a1a1a]">Order Amount</p>
            <p className="font-semibold text-[#1a1a1a]">₹ {baseAmount}</p>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[#1a1a1a]">Booking Fee</p>
              <p className="text-xs text-gray-500">Includes taxes</p>
            </div>
            <p className="font-semibold text-[#1a1a1a]">₹ {bookingFee}</p>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
            <p className="text-lg font-bold text-[#1a1a1a]">Grand Total</p>
            <p className="text-lg font-bold text-[#1a1a1a]">₹ {grandTotal}</p>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={onContinue}
        className="w-full bg-[#1a1a1a] text-white font-bold py-4 rounded-full hover:bg-gray-800 transition uppercase"
      >
        Continue to Billing
      </button>
    </div>
  );
};

export default OrderSummary;
