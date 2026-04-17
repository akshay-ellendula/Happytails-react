import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Check,
  Package,
  Truck,
  Home,
  ArrowLeft,
  Loader2,
  MapPin,
  CreditCard,
  Phone,
  FileText,
  Download,
  Info,
} from "lucide-react";
import { axiosInstance } from "../../utils/axios";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import MobileMenu from "../../components/MobileMenu";
import Footer from "../../components/Footer";

import jsPDF from "jspdf";
import lastAutoTable from "jspdf-autotable";

export default function TrackOrderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user } = useAuth();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!order) {
      const fetchOrder = async () => {
        try {
          const res = await axiosInstance.get("/products/getUserOrders");
          if (res.data.success) {
            const foundOrder = res.data.orders.find(
              (o) => o.id === orderId || o._id === orderId,
            );
            if (foundOrder) {
              setOrder(foundOrder);
            } else {
              alert("Order not found");
              navigate("/my_orders");
            }
          }
        } catch (error) {
          console.error("Error fetching order:", error);
          navigate("/my_orders");
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [order, orderId, navigate]);

  const steps = [
    {
      label: "Order Placed",
      icon: FileText,
      date: order?.order_date,
      status: "pending",
    },
    { label: "Processing", icon: Package, date: null, status: "processing" },
    {
      label: "Shipped",
      icon: Truck,
      date: order?.shipped_at,
      status: "shipped",
    },
    {
      label: "Out for Delivery",
      icon: Truck,
      date: order?.delivery_date,
      status: "out_for_delivery",
    },
    {
      label: "Delivered",
      icon: Home,
      date: order?.delivered_at,
      status: "delivered",
    },
  ];

  const getStepStatus = (orderStatus) => {
    if (!orderStatus) return 0;
    const s = orderStatus.toLowerCase();
    if (s === "delivered") return 5;
    if (s === "out for delivery" || s === "out_for_delivery") return 4;
    if (s === "shipped") return 3;
    if (s === "confirmed" || s === "processing") return 2;
    if (s === "pending") return 1;
    return 0;
  };

  const currentStep = getStepStatus(order?.status);

  const subtotal =
    order?.subtotal ||
    order?.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) ||
    0;
  const platformFee = subtotal * 0.04;
  const finalTotal = order?.total_amount || subtotal + platformFee;

  // PROFESSIONAL RECEIPT PDF GENERATOR
  const downloadReceipt = () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPos = 15;

      // Color scheme
      const primary = [26, 26, 26];
      // === HEADER ===
      doc.setFillColor(26, 26, 26);
      doc.rect(0, 0, pageWidth, 30, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("HAPPY TAILS", 15, 12);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Pet Care & Supplies", 15, 18);

      doc.setTextColor(200, 200, 200);
      doc.setFontSize(8);
      doc.text("support@happytails.com | +91 98765 43210", pageWidth - 15, 12, {
        align: "right",
      });
      doc.text("www.happytails.com", pageWidth - 15, 18, { align: "right" });

      yPos = 40;

      // === RECEIPT TITLE ===
      doc.setFillColor(255, 254, 139);
      doc.rect(0, yPos - 8, pageWidth, 14, "F");

      doc.setTextColor(26, 26, 26);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("ORDER RECEIPT", 15, yPos);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`#${order?.id || order?._id}`, pageWidth - 15, yPos - 3, {
        align: "right",
      });

      yPos += 12;

      // === ORDER INFO & DATES ===
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "bold");
      doc.text("Order Information:", 15, yPos);

      doc.setFont("helvetica", "normal");
      yPos += 6;

      const orderDate = new Date(order?.order_date).toLocaleDateString(
        "en-IN",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      );

      doc.text(`Date: ${orderDate}`, 15, yPos);
      doc.text(`Status: ${order?.status}`, 100, yPos);

      yPos += 8;

      // === CUSTOMER DETAILS BOX ===
      doc.setFillColor(243, 244, 246);
      doc.rect(15, yPos, pageWidth - 30, 32, "F");

      doc.setTextColor(26, 26, 26);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("BILL TO:", 20, yPos + 5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(8);
      let custY = yPos + 11;

      doc.text(`${user?.userName || "Customer"}`, 20, custY);
      custY += 5;
      doc.text(`${user?.email || "No email"}`, 20, custY);
      custY += 5;
      doc.text(`${user?.phoneNumber || "No phone"}`, 20, custY);
      custY += 5;

      if (user?.address) {
        const addr =
          `${user.address.houseNumber || ""} ${user.address.streetNo || ""}, ${user.address.city || ""} - ${user.address.pincode || ""}`.trim();
        const splitAddr = doc.splitTextToSize(addr, pageWidth - 50);
        if (splitAddr[0]) doc.text(splitAddr[0], 20, custY);
      }

      yPos += 38;

      // === ITEMS TABLE ===
      const tableColumn = [
        "Item Name",
        "Size/Color",
        "Qty",
        "Unit Price",
        "Total",
      ];
      const tableRows = [];

      order?.items?.forEach((item) => {
        const variant = item.size ? item.size : "-";
        const color = item.color ? item.color : "";
        const sizeColor = `${variant}${color ? " / " + color : ""}`;
        const itemTotal = item.price * item.quantity;

        tableRows.push([
          item.product_name || "Product",
          sizeColor,
          item.quantity.toString(),
          `Rs. ${item.price.toFixed(2)}`,
          `Rs. ${itemTotal.toFixed(2)}`,
        ]);
      });

      lastAutoTable(doc, {
        startY: yPos,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        headStyles: {
          fillColor: primary,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
          cellPadding: 4,
          fontSize: 8,
          lineColor: [200, 200, 200],
        },
        bodyStyles: {
          textColor: [60, 60, 60],
          cellPadding: 3,
          fontSize: 8,
          lineColor: [230, 230, 230],
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { cellWidth: 50, halign: "left" },
          1: { cellWidth: 30, halign: "center" },
          2: { cellWidth: 15, halign: "center" },
          3: { cellWidth: 35, halign: "right" },
          4: { cellWidth: 35, halign: "right", fontStyle: "bold" },
        },
        margin: { left: 15, right: 15 },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // === BILLING SUMMARY ===
      const summaryLeft = pageWidth / 2 + 10;
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");

      doc.text("Subtotal:", summaryLeft, yPos);
      doc.text(`Rs. ${subtotal.toFixed(2)}`, pageWidth - 15, yPos, {
        align: "right",
      });

      yPos += 6;
      doc.text("Delivery Fee:", summaryLeft, yPos);
      doc.text("FREE", pageWidth - 15, yPos, { align: "right" });

      yPos += 6;
      doc.text("Platform Charge (4%):", summaryLeft, yPos);
      doc.text(`Rs. ${platformFee.toFixed(2)}`, pageWidth - 15, yPos, {
        align: "right",
      });

      // === TOTAL BOX ===
      yPos += 8;
      doc.setFillColor(255, 254, 139);
      doc.rect(summaryLeft - 5, yPos - 4, pageWidth - summaryLeft, 12, "F");

      doc.setTextColor(26, 26, 26);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("GRAND TOTAL:", summaryLeft, yPos + 4);
      doc.text(`Rs. ${finalTotal.toFixed(2)}`, pageWidth - 15, yPos + 4, {
        align: "right",
      });

      // === FOOTER ===
      yPos = pageHeight - 45;

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(15, yPos, pageWidth - 15, yPos);

      yPos += 8;
      doc.setFontSize(8);
      doc.setTextColor(26, 26, 26);
      doc.setFont("helvetica", "bold");
      doc.text("RETURN & REFUND POLICY", 15, yPos);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(7);
      yPos += 5;

      const policies = [
        "• Returns accepted within 14 days of delivery",
        "• Items must be unused and in original packaging",
        "• Include this receipt with your return",
        "• Platform charges are non-refundable",
      ];

      policies.forEach((policy) => {
        doc.text(policy, 15, yPos);
        yPos += 4;
      });

      // === THANK YOU ===
      yPos = pageHeight - 8;
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text(
        "Thank you for shopping with Happy Tails! 🐾",
        pageWidth / 2,
        yPos,
        { align: "center" },
      );

      doc.save(`Happytails_Receipt_${order?.id || order?._id}.pdf`);
    } catch (error) {
      console.error("Error generating receipt:", error);
      alert("Failed to generate receipt. Please try again.");
    }
  };

  const addressStr = user?.address
    ? `${user.address.houseNumber || ""} ${user.address.streetNo || ""}, ${user.address.city || ""} - ${user.address.pincode || ""}`
    : "Address not available";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#1a1a1a]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#effe8b] flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-[#1a1a1a] mb-4" />
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">
            Order Not Found
          </h1>
          <button
            onClick={() => navigate("/my_orders")}
            className="text-blue-600 hover:underline"
          >
            Go back to orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#effe8b]">
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <MobileMenu isOpen={isMobileMenuOpen} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#1a1a1a] font-bold mb-8 hover:opacity-70"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Tracking Card */}
            <div className="bg-white rounded-3xl shadow-xl border-4 border-black overflow-hidden">
              <div className="bg-[#1a1a1a] text-white p-6 flex justify-between items-center">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">
                    {order.status === "Delivered" ? "Arrived!" : "On its way"}
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">
                    Order ID: #{order.id || order._id}
                  </p>
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
                    style={{
                      width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                    }}
                  ></div>

                  <div className="relative z-10 flex justify-between w-full">
                    {steps.map((step, idx) => {
                      const isCompleted = idx < currentStep;
                      const isCurrent = idx === currentStep - 1;
                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center group"
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                              isCompleted
                                ? "bg-green-500 border-green-500 text-white shadow-lg scale-110"
                                : isCurrent
                                  ? "bg-white border-green-500 text-green-500 shadow-md scale-110"
                                  : "bg-white border-gray-200 text-gray-300"
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-6 h-6" />
                            ) : (
                              <step.icon className="w-5 h-5" />
                            )}
                          </div>
                          <p
                            className={`mt-4 text-xs font-bold uppercase tracking-wider ${
                              isCompleted || isCurrent
                                ? "text-[#1a1a1a]"
                                : "text-gray-400"
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      );
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
                        <div
                          className={`absolute -left-[21px] top-0 w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors ${
                            isCompleted
                              ? "bg-green-500 border-green-500 text-white"
                              : isCurrent
                                ? "bg-white border-green-500 text-green-500"
                                : "bg-white border-gray-200 text-gray-300"
                          }`}
                        >
                          <step.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4
                            className={`font-bold text-base ${
                              isCompleted || isCurrent
                                ? "text-[#1a1a1a]"
                                : "text-gray-400"
                            }`}
                          >
                            {step.label}
                          </h4>
                          {step.date && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(step.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
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
                  <div
                    key={idx}
                    className="flex gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                      {item.image_data ? (
                        <img
                          src={item.image_data}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[#1a1a1a] line-clamp-1">
                        {item.product_name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Variant: {item.size || "Std"}{" "}
                        {item.color ? `• ${item.color}` : ""}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm font-medium">
                          Qty: {item.quantity}
                        </p>
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
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">
                Delivery Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">
                      Shipping Address
                    </p>
                    <p className="text-sm text-[#1a1a1a] mt-1 font-medium leading-relaxed">
                      {user?.userName}
                      <br />
                      {addressStr}
                    </p>
                  </div>
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">
                      Contact Info
                    </p>
                    <p className="text-sm text-[#1a1a1a] mt-1 font-medium">
                      {user?.email}
                      <br />
                      {user?.phoneNumber || "No phone provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#1a1a1a]">
                  Payment Summary
                </h3>

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
                  <p className="text-xs text-blue-600 font-bold uppercase">
                    Payment Method
                  </p>
                  <p className="text-sm font-medium text-blue-900">
                    Card ending in •••• {order.payment_last_four || "XXXX"}
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

                <div className="bg-gray-50 p-3 rounded-lg mt-4 flex items-start gap-2 text-xs text-gray-500">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
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
