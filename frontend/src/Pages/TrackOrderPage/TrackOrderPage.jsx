import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  Check, Package, Truck, Home, ArrowLeft, Loader2, 
  MapPin, CreditCard, Phone, HelpCircle, FileText 
} from 'lucide-react';
import { axiosInstance } from '../../utils/axios';
import { useAuth } from '../../context/AuthContext'; // To get user address
import Header from '../../components/Header';
import MobileMenu from '../../components/MobileMenu';
import Footer from '../../components/Footer';

export default function TrackOrderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user } = useAuth(); // Get logged-in user details for address
  
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fallback: Fetch order if page is refreshed
  useEffect(() => {
    if (!order) {
      const fetchOrder = async () => {
        try {
          const res = await axiosInstance.get("/products/getUserOrders");
          if (res.data.success) {
            const foundOrder = res.data.orders.find(o => o.id === orderId || o._id === orderId);
            if (foundOrder) {
                setOrder(foundOrder);
            } else {
                alert("Order not found");
                navigate('/my_orders');
            }
          }
        } catch (error) {
          console.error("Error fetching order:", error);
          navigate('/my_orders');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [order, orderId, navigate]);

  // Determine steps and current progress
  const steps = [
    { label: 'Order Placed', icon: FileText, date: order?.order_date, status: 'confirmed' },
    { label: 'Processing', icon: Package, date: null, status: 'processing' }, // Implied step
    { label: 'Shipped', icon: Truck, date: order?.shipped_at, status: 'shipped' },
    { label: 'Out for Delivery', icon: Truck, date: null, status: 'out_for_delivery' },
    { label: 'Delivered', icon: Home, date: order?.delivered_at, status: 'delivered' }
  ];

  const getStepStatus = (orderStatus) => {
    if (!orderStatus) return 0;
    const s = orderStatus.toLowerCase();
    // Map backend status strings to step index (0-4)
    if (s === 'delivered') return 5; // All complete
    if (s === 'out for delivery') return 4;
    if (s === 'shipped') return 3;
    if (s === 'processing') return 2; 
    if (s === 'confirmed' || s === 'pending') return 1;
    return 0;
  };

  const currentStep = getStepStatus(order?.status);

  if (loading) {
      return (
        <div className="min-h-screen bg-[#effe8b] flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#1a1a1a]" />
        </div>
      );
  }

  if (!order) return null;

  // Formatting Address
  const addressStr = user?.address 
    ? `${user.address.houseNumber}, ${user.address.streetNo}, ${user.address.city} - ${user.address.pincode}`
    : "Address not available";

  return (
    <div className="bg-[#effe8b] font-outfit min-h-screen flex flex-col">
      <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      {isMobileMenuOpen && <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />}

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Back Button */}
        <button 
            onClick={() => navigate('/my_orders')}
            className="flex items-center text-[#1a1a1a] font-bold mb-6 hover:underline transition-all hover:-translate-x-1"
        >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to My Orders
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Tracking & Items */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* 1. Main Tracking Card */}
                <div className="bg-white rounded-3xl shadow-xl border-4 border-black overflow-hidden">
                    <div className="bg-[#1a1a1a] text-white p-6 flex justify-between items-center">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold">
                                {order.status === 'Delivered' ? 'Arrived!' : 'On its way'}
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">Order ID: #{order.id || order._id}</p>
                        </div>
                        <div className="bg-[#effe8b] text-[#1a1a1a] px-4 py-2 rounded-xl font-bold text-sm">
                            {order.delivery_date 
                                ? `Exp: ${new Date(order.delivery_date).toLocaleDateString()}` 
                                : "Est: 3-5 Days"}
                        </div>
                    </div>

                    <div className="p-8 md:p-10">
                        {/* Desktop Horizontal Progress Bar */}
                        <div className="relative hidden md:block mb-12">
                            <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-100 rounded-full -translate-y-1/2"></div>
                            <div 
                                className="absolute top-1/2 left-0 h-2 bg-green-500 rounded-full -translate-y-1/2 transition-all duration-1000 ease-out"
                                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                            ></div>
                            
                            <div className="relative z-10 flex justify-between w-full">
                                {steps.map((step, idx) => {
                                    const isCompleted = idx < currentStep;
                                    const isCurrent = idx === currentStep - 1;
                                    return (
                                        <div key={idx} className="flex flex-col items-center group">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                                                isCompleted 
                                                    ? 'bg-green-500 border-green-500 text-white shadow-lg scale-110' 
                                                    : isCurrent 
                                                        ? 'bg-white border-green-500 text-green-500 shadow-md scale-110'
                                                        : 'bg-white border-gray-200 text-gray-300'
                                            }`}>
                                                {isCompleted ? <Check className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                                            </div>
                                            <p className={`mt-4 text-xs font-bold uppercase tracking-wider ${
                                                isCompleted || isCurrent ? 'text-[#1a1a1a]' : 'text-gray-400'
                                            }`}>
                                                {step.label}
                                            </p>
                                            {step.date && (
                                                <p className="text-[10px] text-gray-500 font-medium mt-1">
                                                    {new Date(step.date).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Mobile Vertical Timeline */}
                        <div className="md:hidden relative pl-4 border-l-2 border-gray-200 space-y-8">
                            {steps.map((step, idx) => {
                                const isCompleted = idx < currentStep;
                                const isCurrent = idx === currentStep - 1;
                                return (
                                    <div key={idx} className="relative pl-6">
                                        <div className={`absolute -left-[21px] top-0 w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors ${
                                            isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                                            isCurrent ? 'bg-white border-green-500 text-green-500' : 'bg-white border-gray-200 text-gray-300'
                                        }`}>
                                            <step.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-base ${isCompleted || isCurrent ? 'text-[#1a1a1a]' : 'text-gray-400'}`}>
                                                {step.label}
                                            </h4>
                                            {step.date && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(step.date).toLocaleDateString()} • {new Date(step.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* 2. Order Items */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-[#1a1a1a] mb-4 flex items-center">
                        <Package className="w-5 h-5 mr-2" /> Package Details
                    </h3>
                    <div className="space-y-4">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                    {item.image_data ? (
                                        <img src={item.image_data} alt={item.product_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Package />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-[#1a1a1a] line-clamp-1">{item.product_name}</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Variant: {item.size || 'Std'} {item.color ? `• ${item.color}` : ''}
                                    </p>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-sm font-medium">Qty: {item.quantity}</p>
                                        <p className="text-sm font-bold">₹{item.price}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Info & Summary */}
            <div className="space-y-6">
                
                {/* 3. Shipping Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Delivery Information</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Shipping Address</p>
                                <p className="text-sm text-[#1a1a1a] mt-1 font-medium leading-relaxed">
                                    {user?.userName}<br/>
                                    {addressStr}
                                </p>
                            </div>
                        </div>
                        
                        <div className="w-full h-px bg-gray-100"></div>

                        <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Contact Info</p>
                                <p className="text-sm text-[#1a1a1a] mt-1 font-medium">
                                    {user?.email}<br/>
                                    {user?.phoneNumber || 'No phone provided'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Payment & Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Payment Summary</h3>
                    
                    <div className="flex items-center gap-3 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="text-xs text-blue-600 font-bold uppercase">Payment Method</p>
                            <p className="text-sm font-medium text-blue-900">
                                Card ending in •••• {order.payment_last_four || 'XXXX'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{order.subtotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Delivery Fee</span>
                            <span className="text-green-600">Free</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Tax (Included)</span>
                            <span>₹{((order.total_amount || 0) - (order.subtotal || 0)).toFixed(2)}</span>
                        </div>
                        <div className="w-full h-px bg-gray-200 my-2"></div>
                        <div className="flex justify-between text-lg font-bold text-[#1a1a1a]">
                            <span>Grand Total</span>
                            <span>₹{order.total_amount?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}