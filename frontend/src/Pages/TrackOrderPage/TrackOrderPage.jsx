import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  Check, Package, Truck, Home, ArrowLeft, Loader2, 
  MapPin, CreditCard, Phone, FileText, Download, Info 
} from 'lucide-react';
import { axiosInstance } from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import MobileMenu from '../../components/MobileMenu';
import Footer from '../../components/Footer';

// Use the functional import for jspdf-autotable
import jsPDF from 'jspdf';
import lastAutoTable from 'jspdf-autotable';

export default function TrackOrderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user } = useAuth();
  
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

  const steps = [
    { label: 'Order Placed', icon: FileText, date: order?.order_date, status: 'confirmed' },
    { label: 'Processing', icon: Package, date: null, status: 'processing' },
    { label: 'Shipped', icon: Truck, date: order?.shipped_at, status: 'shipped' },
    { label: 'Out for Delivery', icon: Truck, date: null, status: 'out_for_delivery' },
    { label: 'Delivered', icon: Home, date: order?.delivered_at, status: 'delivered' }
  ];

  const getStepStatus = (orderStatus) => {
    if (!orderStatus) return 0;
    const s = orderStatus.toLowerCase();
    if (s === 'delivered') return 5;
    if (s === 'out for delivery') return 4;
    if (s === 'shipped') return 3;
    if (s === 'processing') return 2; 
    if (s === 'confirmed' || s === 'pending') return 1;
    return 0;
  };

  const currentStep = getStepStatus(order?.status);

  // --- CALCULATIONS ---
  const subtotal = order?.subtotal || order?.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
  const platformFee = subtotal * 0.04; // 4% Platform Charge
  const finalTotal = order?.total_amount || (subtotal + platformFee);

  // --- RECEIPT GENERATOR FUNCTION ---
  const downloadReceipt = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Brand Colors
    const colorBlack = "#1a1a1a";
    const colorYellow = "#effe8b";
    const colorGray = "#f3f4f6";

    // --- 1. HEADER ---
    // Brand Name (Top Left)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(colorBlack);
    doc.text("HAPPY TAILS", 20, 25);
    
    // Receipt Label (Top Right)
    doc.setFontSize(30);
    doc.setTextColor(220, 220, 220); // Light gray watermark style
    doc.text("RECEIPT", pageWidth - 20, 25, { align: "right" });

    // Yellow Divider Line
    doc.setDrawColor(colorYellow);
    doc.setLineWidth(1.5);
    doc.line(20, 35, pageWidth - 20, 35);

    // --- 2. ORDER & COMPANY INFO ---
    let yPos = 50;
    
    // Left: From Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colorBlack);
    doc.text("From:", 20, yPos);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text("Happy Tails Pet Store", 20, yPos + 6);
    doc.text("support@happytails.com", 20, yPos + 11);
    doc.text("+91 98765 43210", 20, yPos + 16);

    // Right: Order Details
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colorBlack);
    doc.text("Order Details:", pageWidth - 20, yPos, { align: "right" });
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(`Order ID: #${order.id || order._id}`, pageWidth - 20, yPos + 6, { align: "right" });
    doc.text(`Date: ${new Date(order.order_date).toLocaleDateString()}`, pageWidth - 20, yPos + 11, { align: "right" });
    doc.text(`Status: ${order.status}`, pageWidth - 20, yPos + 16, { align: "right" });

    yPos += 25;

    // --- 3. BILL TO SECTION (Gray Rounded Box) ---
    doc.setFillColor(colorGray);
    doc.roundedRect(20, yPos, pageWidth - 40, 28, 3, 3, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colorBlack);
    doc.text("Billed To:", 26, yPos + 10);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    const userName = user?.userName || "Customer";
    const userEmail = user?.email || "";
    let addressLine = "";
    if (user?.address) {
        addressLine = `${user.address.houseNumber}, ${user.address.streetNo}, ${user.address.city} - ${user.address.pincode}`;
    }
    
    doc.setFontSize(10);
    doc.text(`${userName}  |  ${userEmail}`, 26, yPos + 16);
    if(addressLine) {
        // Truncate if too long to fit one line
        const splitAddr = doc.splitTextToSize(addressLine, pageWidth - 60);
        doc.text(splitAddr[0], 26, yPos + 22);
    }

    yPos += 40;

    // --- 4. ITEMS TABLE ---
    const tableColumn = ["Item", "Variant", "Qty", "Price", "Total"];
    const tableRows = [];

    order.items.forEach(item => {
      const variant = `${item.size || '-'} ${item.color ? '• ' + item.color : ''}`;
      const itemTotal = item.price * item.quantity;
      const rowData = [
        item.product_name,
        variant,
        item.quantity,
        `Rs. ${item.price}`,
        `Rs. ${itemTotal.toFixed(2)}`
      ];
      tableRows.push(rowData);
    });

    lastAutoTable(doc, {
      startY: yPos,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { 
          fillColor: colorBlack, 
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'left',
          cellPadding: 4
      },
      bodyStyles: {
          textColor: 50,
          cellPadding: 3
      },
      alternateRowStyles: {
          fillColor: [250, 250, 250] // Very light gray stripe
      },
      columnStyles: {
        0: { cellWidth: 70 }, 
        4: { halign: 'right', fontStyle: 'bold' }, 
        3: { halign: 'right' }, 
        2: { halign: 'center' }, 
      },
      styles: { fontSize: 10, lineColor: 240 }, // Light borders
    });

    // --- 5. FINANCIAL SUMMARY ---
    let finalY = (doc).lastAutoTable.finalY + 10;
    
    const drawTotalLine = (label, value, isTotal = false) => {
        if (isTotal) {
            // Highlight Box for Grand Total
            doc.setFillColor(colorYellow);
            doc.roundedRect(pageWidth - 90, finalY - 6, 70, 10, 2, 2, "F");
            doc.setFont("helvetica", "bold");
            doc.setTextColor(colorBlack);
        } else {
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80);
        }
        
        doc.text(label, pageWidth - 85, finalY);
        doc.text(value, pageWidth - 25, finalY, { align: "right" });
        finalY += 9;
    };

    drawTotalLine("Subtotal:", `Rs. ${subtotal.toFixed(2)}`);
    drawTotalLine("Platform Charges (4%):", `Rs. ${platformFee.toFixed(2)}`);
    drawTotalLine("Delivery Fee:", "Free");
    
    finalY += 2; // Extra spacing
    drawTotalLine("Grand Total:", `Rs. ${finalTotal.toFixed(2)}`, true);

    // --- 6. POLICY SECTION ---
    let policyY = 240; // Push to bottom area
    
    // Separator line
    doc.setDrawColor(220);
    doc.setLineWidth(0.5);
    doc.line(20, policyY, pageWidth - 20, policyY); 
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colorBlack);
    doc.text("Refund Policy & Terms:", 20, policyY + 10);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.setFontSize(8);
    const policyText = "Refund requests must be made within 14 days of delivery. Items must be unused, in original packaging, and accompanied by this receipt. Platform charges are non-refundable.";
    const splitPolicy = doc.splitTextToSize(policyText, pageWidth - 40);
    doc.text(splitPolicy, 20, policyY + 16);

    // --- 7. FOOTER ---
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Thank you for shopping with Happy Tails!", pageWidth / 2, 280, { align: "center" });
    
    doc.save(`Happytails_Receipt_${order.id || order._id}.pdf`);
  };

  if (loading) {
      return (
        <div className="min-h-screen bg-[#effe8b] flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#1a1a1a]" />
        </div>
      );
  }

  if (!order) return null;

  const addressStr = user?.address 
    ? `${user.address.houseNumber}, ${user.address.streetNo}, ${user.address.city} - ${user.address.pincode}`
    : "Address not available";

  return (
    <div className="bg-[#effe8b] font-outfit min-h-screen flex flex-col">
      <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      {isMobileMenuOpen && <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />}

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <button 
            onClick={() => navigate('/my_orders')}
            className="flex items-center text-[#1a1a1a] font-bold mb-6 hover:underline transition-all hover:-translate-x-1"
        >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to My Orders
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Tracking & Items */}
            <div className="lg:col-span-2 space-y-8">
                {/* Tracking Card */}
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
                        {/* Progress Bar */}
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
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Mobile Timeline */}
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
                                                    {new Date(step.date).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Items */}
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
                
                {/* Shipping Info */}
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

                {/* Payment & Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-[#1a1a1a]">Payment Summary</h3>
                        
                        <button 
                            onClick={downloadReceipt}
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-2 rounded-full transition-colors"
                            title="Download Receipt"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                    
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
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Delivery Fee</span>
                            <span className="text-green-600">Free</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Platform Charges (4%)</span>
                            <span>₹{platformFee.toFixed(2)}</span>
                        </div>
                        
                        <div className="w-full h-px bg-gray-200 my-2"></div>
                        <div className="flex justify-between text-lg font-bold text-[#1a1a1a]">
                            <span>Grand Total</span>
                            <span>₹{finalTotal.toFixed(2)}</span>
                        </div>
                        
                        {/* Policy Note on UI */}
                        <div className="bg-gray-50 p-3 rounded-lg mt-4 flex items-start gap-2 text-xs text-gray-500">
                            <Info className="w-4 h-4 mt-0.5 shrink-0" />
                            <p>Returns accepted within 14 days of delivery. Platform charges are non-refundable.</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={downloadReceipt}
                        className="w-full mt-6 bg-[#1a1a1a] text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Download Invoice
                    </button>
                </div>

            </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}