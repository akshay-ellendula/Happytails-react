import React, { useState, useEffect } from "react";
import {
  LineChart, Line, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart
} from "recharts";
import { axiosInstance } from '../../utils/axios.js';
import { 
  Loader2, TrendingUp, DollarSign, Calendar, Ticket, 
  Users, Activity, Percent, ArrowUpRight, ArrowDownRight, Filter, Download
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [basicStats, setBasicStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [feeData, setFeeData] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [attendance, setAttendance] = useState([]);

  // Setup default dates (Last 30 Days)
  const defaultEndDate = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const defaultStartDate = thirtyDaysAgo.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  // Modern Color Palette (Replaced light yellow with vibrant #F59E0B for white backgrounds)
  const COLORS = ["#1a1a1a", "#F59E0B", "#A78BFA", "#34D399", "#F87171", "#60A5FA"];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Pass custom dates as query parameters to your backend
        const queryParams = { params: { startDate, endDate } };

        const [
          dashboardRes, 
          eventTypesRes, 
          feesRes, 
          revenueTrendsRes,
          performanceRes,
          attendanceRes
        ] = await Promise.all([
          axiosInstance.get('/eventAnalytics/dashboard', queryParams),
          axiosInstance.get('/eventAnalytics/event-types', queryParams),
          axiosInstance.get('/eventAnalytics/platform-fees', queryParams),
          axiosInstance.get('/eventAnalytics/revenue-trends', queryParams),
          axiosInstance.get('/eventAnalytics/performance-metrics', queryParams),
          axiosInstance.get('/eventAnalytics/attendance', queryParams)
        ]);

        setBasicStats(dashboardRes.data.basicStats);
        setRevenueData(revenueTrendsRes.data || []);
        
        const formattedCategory = (eventTypesRes.data || []).map((item) => ({
            name: item.event || 'General',
            value: item.sold
        }));
        setCategoryData(formattedCategory);
        setFeeData(feesRes.data || []);
        setPerformance(performanceRes.data || {});
        
        const sortedAttendance = (attendanceRes.data || []).sort((a, b) => b.rate - a.rate);
        setAttendance(sortedAttendance);

      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full bg-gray-50">
        <Loader2 className="animate-spin w-10 h-10 text-gray-500" />
      </div>
    );
  }

  const generatePDFReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(26, 26, 26);
    doc.text("Happy Tails - Analytics Report", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: "center" });
    doc.text(`Date Range: ${startDate} to ${endDate}`, pageWidth / 2, 34, { align: "center" });
    
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 40, pageWidth - 14, 40);

    // Financial Summary
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Financial Summary", 14, 50);

    const financialsData = [
      ["Gross Revenue", `Rs ${basicStats?.totalRevenue?.toLocaleString() || 0}`],
      ["Platform Fee (6%)", `Rs ${basicStats?.platformFee?.toLocaleString() || 0}`],
      ["Net Revenue (Payout)", `Rs ${basicStats?.netRevenue?.toLocaleString() || 0}`],
      ["Tickets Sold", `${basicStats?.totalTicketsSold || 0}`]
    ];

    autoTable(doc, {
      startY: 55,
      head: [["Metric", "Value"]],
      body: financialsData,
      theme: 'grid',
      headStyles: { fillColor: [26, 26, 26] },
      styles: { fontSize: 11 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // Customer Insights
    const finalYAfterFinance = doc.lastAutoTable.finalY || 100;
    doc.setFontSize(16);
    doc.text("Customer Insights", 14, finalYAfterFinance + 15);

    const insightsData = [
      ["Average Ticket Price", `Rs ${performance?.averageTicketPrice?.toLocaleString() || 0}`],
      ["Customer Lifetime Value", `Rs ${performance?.customerLifetimeValue?.toLocaleString() || 0}`]
    ];

    autoTable(doc, {
      startY: finalYAfterFinance + 20,
      head: [["Insight", "Value"]],
      body: insightsData,
      theme: 'grid',
      headStyles: { fillColor: [26, 26, 26] },
      styles: { fontSize: 11 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // Top Events
    const finalYAfterInsights = doc.lastAutoTable.finalY || 150;
    doc.setFontSize(16);
    doc.text("Top Events by Attendance", 14, finalYAfterInsights + 15);

    const topEventsData = attendance.slice(0, 5).map(evt => [
        evt.name,
        evt.date,
        evt.isCancelled ? "Cancelled" : "Active",
        `${evt.sold} / ${evt.capacity}`,
        `${evt.rate}%`
    ]);

    autoTable(doc, {
        startY: finalYAfterInsights + 20,
        head: [["Event Name", "Date", "Status", "Sales/Capacity", "Fill Rate"]],
        body: topEventsData,
        theme: 'grid',
        headStyles: { fillColor: [26, 26, 26] },
        styles: { fontSize: 10 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    }

    doc.save(`Analytics_Report_${startDate}_to_${endDate}.pdf`);
  };

  // Helper for trend badge
  const GrowthBadge = ({ value }) => {
    if (value === undefined || value === null) return null;
    const isPositive = value >= 0;
    return (
      <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1" />}
        {Math.abs(value)}% vs last mo
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50 overflow-auto pb-20">
      <header className="bg-white shadow-sm border-b border-gray-100 p-6 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Analytics Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Track your event performance, revenue, and customer insights</p>
          </div>
          
          {/* Custom Date Filters & Download Config */}
          <div className="flex items-center gap-3">
            <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
              <div className="flex items-center px-3 gap-2 border-r border-gray-200 hidden sm:flex">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Filter:</span>
              </div>
              <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none cursor-pointer p-1"
              />
              <span className="text-gray-400 text-sm hidden sm:inline">to</span>
              <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none cursor-pointer pr-3 p-1"
              />
            </div>
            {/* Download Button */}
            <button 
              onClick={generatePDFReport}
              className="bg-gray-800 text-white p-2 sm:px-4 sm:py-2.5 rounded-xl text-sm font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 shadow-sm"
              title="Download PDF Report"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* TOP STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl"><DollarSign className="w-6 h-6" /></div>
              <GrowthBadge value={basicStats?.revenueGrowth} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Net Revenue</p>
              <h3 className="text-3xl font-extrabold text-[#1a1a1a]">₹{basicStats?.netRevenue?.toLocaleString() || 0}</h3>
              <p className="text-xs text-gray-400 mt-2">Gross: ₹{basicStats?.totalRevenue?.toLocaleString() || 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Ticket className="w-6 h-6" /></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Tickets Sold</p>
              <h3 className="text-3xl font-extrabold text-[#1a1a1a]">{basicStats?.totalTicketsSold || 0}</h3>
              <p className="text-xs text-gray-400 mt-2">Total attendees registered</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Calendar className="w-6 h-6" /></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Active Events</p>
              <h3 className="text-3xl font-extrabold text-[#1a1a1a]">{basicStats?.totalEvents || 0}</h3>
              <p className="text-xs text-gray-400 mt-2">Hosted on platform</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-4 -right-4 p-4 opacity-[0.03]"><Activity className="w-32 h-32" /></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-red-50 text-red-500 rounded-xl"><Percent className="w-6 h-6" /></div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-gray-500 mb-1">Platform Fees (6%)</p>
              <h3 className="text-3xl font-extrabold text-gray-800">₹{basicStats?.platformFee?.toLocaleString() || 0}</h3>
              <p className="text-xs text-gray-400 mt-2">Deducted automatically</p>
            </div>
          </div>
        </div>

        {/* CUSTOMER INSIGHTS ROW */}
        <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] rounded-2xl shadow-md p-8 text-white">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#effe8b]" /> Customer Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-700/50">
            <div className="pt-4 md:pt-0">
              <p className="text-gray-400 text-sm font-medium mb-1 tracking-wide uppercase">Average Ticket Price</p>
              <p className="text-4xl font-black mt-2">₹{performance?.averageTicketPrice?.toLocaleString() || 0}</p>
            </div>
            <div className="pt-8 md:pt-0 md:pl-12">
              <p className="text-gray-400 text-sm font-medium mb-1 tracking-wide uppercase">Customer Lifetime Value (LTV)</p>
              <p className="text-4xl font-black text-[#effe8b] mt-2">₹{performance?.customerLifetimeValue?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        {/* CHARTS ROW 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trends Area Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-[#1a1a1a] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-500" /> Revenue Trends
              </h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} tickFormatter={(val) => `₹${val}`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold', color: '#1a1a1a' }}
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#1a1a1a" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, fill: '#ffffff', stroke: '#1a1a1a', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ticket Sales by Type Pie Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-gray-500" /> Sales by Category
            </h2>
            <div className="h-72">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={100}
                      innerRadius={65}
                      paddingAngle={6}
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 500, color: '#475569' }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 font-medium">No category data available</div>
              )}
            </div>
          </div>
        </div>

        {/* CHARTS ROW 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Fee Breakdown Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-6 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-gray-500" /> Revenue vs Fees
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} tickFormatter={(val) => `₹${val}`} />
                  <RechartsTooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 500 }} />
                  <Bar dataKey="netRevenue" stackId="a" fill="#1a1a1a" name="Net Revenue" radius={[0, 0, 6, 6]} barSize={32} />
                  <Bar dataKey="platformFee" stackId="a" fill="#F87171" name="Platform Fee (6%)" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Event Attendance Stats Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" /> Top Events by Attendance
            </h2>
            <div className="flex-1 overflow-auto pr-2">
              <div className="space-y-4 mt-2">
                {attendance.length === 0 ? (
                  <div className="text-center text-gray-400 py-10 font-medium">No attendance data available</div>
                ) : (
                  attendance.map((evt, idx) => (
                    <div key={idx} className="bg-gray-50/80 rounded-xl p-4 flex flex-col gap-3 border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-[#1a1a1a] truncate max-w-[200px]" title={evt.name}>{evt.name}</p>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">{evt.date}</p>
                        </div>
                        {evt.isCancelled ? (
                          <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[11px] font-bold shadow-sm border border-red-100 uppercase tracking-widest">
                            Cancelled
                          </span>
                        ) : (
                          <span className="bg-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm border border-gray-200 text-gray-800">
                            {evt.rate}%
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full ${evt.isCancelled ? 'bg-red-400' : evt.rate > 80 ? 'bg-green-500' : evt.rate > 50 ? 'bg-[#1a1a1a]' : 'bg-red-400'}`} 
                          style={{ width: `${Math.min(evt.rate, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs font-semibold text-gray-500">
                        <span>{evt.sold} tickets sold</span>
                        <span>{evt.capacity} capacity</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analytics;