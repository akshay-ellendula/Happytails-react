import React, { useState } from "react";
import { useCart } from "../../context/CartContext";          
import { useAuth } from "../../hooks/useAuth";               
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axios";           
import { toast } from "react-hot-toast";

const CheckoutPage = () => {
  const { cart, calculateTotals } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(
    user?.addresses?.findIndex(a => a.isDefault) ?? 0
  );
  const [addingNew, setAddingNew] = useState(!user?.addresses?.length);
  const [newAddress, setNewAddress] = useState({
    houseNumber: '',
    streetNo: '',
    city: '',
    pincode: '',
  });

  const totals = calculateTotals();

  const handleNewAddressChange = (e) => {
    setNewAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProceed = async () => {
    let selectedAddress;

    if (addingNew) {
      if (!newAddress.city || !newAddress.pincode) {
        toast.error('Please fill city and pincode at minimum');
        return;
      }
      selectedAddress = { ...newAddress };
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
    return <div className="p-8 text-center text-xl">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Order Summary */}
      <div className="mb-10 border rounded-lg p-6 bg-white shadow">
        <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
        {cart.map((item, i) => (
          <div key={i} className="flex justify-between py-3 border-b last:border-0">
            <div>
              <p className="font-medium">{item.product_name}</p>
              <p className="text-sm text-gray-600">
                {item.size && `Size: ${item.size}`}
                {item.size && item.color && ' • '}
                {item.color && `Color: ${item.color}`}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </div>
          </div>
        ))}
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>₹{totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Charge (4%)</span>
            <span>₹{totals.charge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₹{totals.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Address Selection */}
      <div className="border rounded-lg p-6 bg-white shadow">
        <h2 className="text-2xl font-semibold mb-4">Shipping Address</h2>

        {!addingNew && user?.addresses?.length > 0 ? (
          <>
            <select
              value={selectedAddressIndex}
              onChange={e => setSelectedAddressIndex(Number(e.target.value))}
              className="w-full p-3 border rounded mb-4"
            >
              {user.addresses.map((addr, idx) => (
                <option key={idx} value={idx}>
                  {addr.houseNumber}, {addr.streetNo}, {addr.city} – {addr.pincode}
                  {addr.isDefault && ' (Default)'}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setAddingNew(true)}
              className="text-blue-600 hover:underline font-medium"
            >
              + Add new address
            </button>
          </>
        ) : (
          <div>
            <h3 className="font-medium text-lg mb-4">Enter New Address</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                name="houseNumber"
                placeholder="House / Flat No."
                value={newAddress.houseNumber}
                onChange={handleNewAddressChange}
                className="p-3 border rounded"
              />
              <input
                name="streetNo"
                placeholder="Street / Area / Locality"
                value={newAddress.streetNo}
                onChange={handleNewAddressChange}
                className="p-3 border rounded"
              />
              <input
                name="city"
                placeholder="City"
                value={newAddress.city}
                onChange={handleNewAddressChange}
                className="p-3 border rounded"
              />
              <input
                name="pincode"
                placeholder="PIN Code"
                value={newAddress.pincode}
                onChange={handleNewAddressChange}
                className="p-3 border rounded"
              />
            </div>

            {user?.addresses?.length > 0 && (
              <button
                type="button"
                onClick={() => setAddingNew(false)}
                className="mt-4 text-blue-600 hover:underline font-medium"
              >
                ← Use saved address
              </button>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleProceed}
        className="mt-10 w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition"
      >
        Proceed to Payment
      </button>
    </div>
  );
};

export default CheckoutPage;