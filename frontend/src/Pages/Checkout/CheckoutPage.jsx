import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { axiosInstance } from "../../utils/axios";
import { toast } from "react-hot-toast";
import { ArrowLeft, Lock, CreditCard, Package } from "lucide-react";

const CheckoutPage = () => {
  const { cart, calculateTotals } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(
    user?.addresses?.findIndex(a => a.isDefault) ?? 0
  );
  const [addingNew, setAddingNew] = useState(!user?.addresses?.length);
  const [newAddress, setNewAddress] = useState({
    name: "",
    houseNumber: '',
    streetNo: '',
    city: '',
    pincode: '',
  });

  const totals = calculateTotals();

  const handleNewAddressChange = (e) => {
    setNewAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    if (addingNew && !newAddress.name.trim() && newAddress.city) {
      const addressCount = user?.addresses?.length || 0;
      const defaultNames = ["Home", "Office", "Studio", "Vault", "Other"];
      const suggestedName = addressCount < defaultNames.length
        ? defaultNames[addressCount]
        : `Address ${addressCount + 1}`;

      setNewAddress(prev => ({
        ...prev,
        name: suggestedName
      }));
    }
  }, [addingNew, newAddress.city, user?.addresses?.length]);

  const handleProceed = async () => {
    let selectedAddress;

    if (addingNew) {
      if (!newAddress.city || !newAddress.pincode || !newAddress.houseNumber || !newAddress.streetNo) {
        toast.error('Please complete all address fields.');
        return;
      }
      selectedAddress = {
        ...newAddress,
        name: newAddress.name.trim() || `Address ${(user?.addresses?.length || 0) + 1}`
      };
    } else {
      if (!user?.addresses?.length) {
        toast.error('No saved addresses found');
        return;
      }
      selectedAddress = user.addresses[selectedAddressIndex];
    }

    const cartPayload = cart.map(item => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product_name,
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
      size: item.size || null,
      color: item.color || null,
    }));

    try {
      const response = await axiosInstance.post('/products/checkout', {
        cart: cartPayload,
        selectedAddress,
      });

      if (response.data.success) {
        navigate(response.data.redirectUrl || '/payment');
      } else {
        toast.error(response.data.message || 'Checkout failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Network error during checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-[#050505] min-h-screen flex items-center justify-center font-outfit text-white">
        <div className="text-center flex flex-col items-center">
          <Package strokeWidth={1} className="w-24 h-24 text-white/20 mb-6" />
          <h2 className="text-3xl font-black mb-4 tracking-widest uppercase">Vault is empty</h2>
          <p className="text-white/40 mb-8 max-w-sm">You haven't added any premium items to your checkout vault yet.</p>
          <Link to="/pet_accessory" className="px-8 py-3 bg-[#f2c737] text-black font-bold uppercase tracking-widest rounded-lg shadow-lg">Return to Store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen text-white font-outfit relative overflow-hidden">

      {/* Ambient Lighting Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-b from-[#f2c737]/10 to-transparent blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-t from-[#f2c737]/5 to-transparent blur-[100px]" />
      </div>

      <div className="max-w-[1200px] mx-auto py-12 px-6 lg:px-12 relative z-10">

        {/* Header Block separate from grid to allow perfect top alignment of columns */}
        <div className="mb-12 border-b border-white/10 pb-6">
          <Link to="/pet_accessory" className="inline-flex items-center gap-2 text-white/40 hover:text-[#f2c737] transition-colors font-bold uppercase tracking-widest text-xs mb-6">
            <ArrowLeft size={16} /> Continue Browsing
          </Link>
          <h1 className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 uppercase tracking-widest flex items-center gap-4">
            Checkout
          </h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Left Column: Flow & Forms */}
          <div className="col-span-1 lg:col-span-7">

            {/* Minimal Address Section */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-lg font-bold tracking-widest uppercase text-white/80">Shipping Destination</h2>
              </div>

              {!addingNew && user?.addresses?.length > 0 ? (
                <div className="animate-fade-in-up">
                  <div className="mb-8">
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
                      Select Stored Origin
                    </label>
                    <select
                      value={selectedAddressIndex}
                      onChange={e => setSelectedAddressIndex(Number(e.target.value))}
                      className="w-full px-5 py-4 bg-transparent border border-white/20 rounded-lg font-medium text-white focus:outline-none focus:border-[#f2c737] appearance-none cursor-pointer transition-colors"
                    >
                      {user.addresses.map((addr, idx) => (
                        <option key={idx} value={idx} className="bg-black text-white">
                          {addr.name || `Location ${idx + 1}`} {addr.isDefault && ' (Primary System Default)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Address Preview Minimal */}
                  <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-[#f2c737]">
                        {user.addresses[selectedAddressIndex]?.name || `Location ${selectedAddressIndex + 1}`}
                      </h3>
                    </div>
                    <div className="space-y-1 text-white/60 font-medium">
                      <p>{user.addresses[selectedAddressIndex]?.houseNumber}, {user.addresses[selectedAddressIndex]?.streetNo}</p>
                      <p>{user.addresses[selectedAddressIndex]?.city}, {user.addresses[selectedAddressIndex]?.pincode}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAddingNew(true)}
                    className="text-[#f2c737] hover:text-white font-bold tracking-widest uppercase text-xs flex items-center gap-2 transition-colors py-2"
                  >
                    + Establish New Coordinate
                  </button>
                </div>
              ) : (
                <div className="animate-fade-in-up">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Location Alias</label>
                      <input
                        name="name"
                        placeholder="e.g. Headquarters, Studio, Safehouse"
                        value={newAddress.name}
                        onChange={handleNewAddressChange}
                        className="w-full p-4 bg-transparent border border-white/20 rounded-lg focus:outline-none focus:border-[#f2c737] text-white font-medium transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Unit / Flat No.</label>
                        <input
                          name="houseNumber"
                          placeholder="Unit Identifier"
                          value={newAddress.houseNumber}
                          onChange={handleNewAddressChange}
                          className="w-full p-4 bg-transparent border border-white/20 rounded-lg focus:outline-none focus:border-[#f2c737] text-white font-medium transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Street Vector</label>
                        <input
                          name="streetNo"
                          placeholder="Sector, Street, or Complex"
                          value={newAddress.streetNo}
                          onChange={handleNewAddressChange}
                          className="w-full p-4 bg-transparent border border-white/20 rounded-lg focus:outline-none focus:border-[#f2c737] text-white font-medium transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">City Hub</label>
                        <input
                          name="city"
                          placeholder="Metropolis"
                          value={newAddress.city}
                          onChange={handleNewAddressChange}
                          className="w-full p-4 bg-transparent border border-white/20 rounded-lg focus:outline-none focus:border-[#f2c737] text-white font-medium transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Postal Code</label>
                        <input
                          name="pincode"
                          placeholder="6-Digit Verification"
                          value={newAddress.pincode}
                          onChange={handleNewAddressChange}
                          className="w-full p-4 bg-transparent border border-white/20 rounded-lg focus:outline-none focus:border-[#f2c737] text-white font-medium transition-colors"
                          maxLength="6"
                        />
                      </div>
                    </div>
                  </div>

                  {user?.addresses?.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAddingNew(false)}
                      className="text-white/40 hover:text-white font-bold tracking-widest uppercase text-xs flex items-center gap-2 mt-8 transition-colors"
                    >
                      ← Revert to Saved Coordinate
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Summary Minimal */}
          <div className="col-span-1 lg:col-span-5 relative">
            <div className="lg:sticky lg:top-12">

              <h2 className="text-lg font-bold uppercase tracking-widest mb-8 text-white/80 flex items-center justify-between border-b border-white/10 pb-4">
                Order Manifest
                <span className="text-xs font-bold text-white/40">{cart.length} Item(s)</span>
              </h2>

              <div className="max-h-[400px] overflow-y-auto no-scrollbar space-y-6 mb-8">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between items-start group">
                    <div className="flex-1 pr-4">
                      <p className="font-bold text-white/90 group-hover:text-[#f2c737] transition-colors leading-tight mb-1">{item.product_name}</p>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30">
                        {item.size && <span>{item.size}</span>}
                        {item.size && item.color && <span className="w-1 h-1 rounded-full bg-white/10" />}
                        {item.color && <span>{item.color}</span>}
                        {(item.size || item.color) && <span className="w-1 h-1 rounded-full bg-white/10" />}
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white/90">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6 space-y-4">
                <div className="flex justify-between font-bold text-white/50 text-sm">
                  <span>Subtotal Payload</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-white/50 text-sm">
                  <span>Transaction Tax (4%)</span>
                  <span>₹{totals.charge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-2">
                  <span className="text-lg font-bold uppercase tracking-widest text-white/80">Total Valuation</span>
                  <span className="text-2xl font-black text-[#f2c737]">₹{totals.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleProceed}
                className="group w-full relative mt-8 h-14 bg-[#f2c737] rounded-lg flex items-center justify-center font-black text-black tracking-widest uppercase text-base shadow-[0_5px_20px_rgba(242,199,55,0.15)] hover:shadow-[0_10px_30px_rgba(242,199,55,0.3)] hover:scale-[1.01] transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <span className="relative z-10 flex items-center gap-2">
                  <Lock size={16} /> Authorize Transfer
                </span>
              </button>

              <div className="mt-5 flex flex-col items-center gap-3 w-full">
                <div className="flex items-center gap-2 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                  <CreditCard size={12} /> End-to-End Encrypted Node
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
