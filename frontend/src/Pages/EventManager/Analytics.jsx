import React, { useState, useEffect } from "react";
import {
  LineChart, Line, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";
import { axiosInstance } from '../../utils/axios.js';
import { Loader2 } from "lucide-react";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [basicStats, setBasicStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [feeData, setFeeData] = useState([]);
  const [timeFilter, setTimeFilter] = useState("6months");

  const COLORS = ["#A78BFA", "#60A5FA", "#34D399", "#FBBF24", "#F87171"];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Fetch analytics data (Removed Attendance API call)
        const [dashboardRes, eventTypesRes, feesRes, revenueTrendsRes] = await Promise.all([
          axiosInstance.get('/eventAnalytics/dashboard'),
          axiosInstance.get('/eventAnalytics/event-types'),
          axiosInstance.get('/eventAnalytics/platform-fees'),
          axiosInstance.get(`/eventAnalytics/revenue-trends?period=${timeFilter}`)
        ]);

        // 1. Basic Stats
        setBasicStats(dashboardRes.data.basicStats);

        // 2. Revenue Trends
        // FIX: Controller now returns an array directly, so we set it directly
        setRevenueData(revenueTrendsRes.data || []);

        // 3. Event Types (Pie Chart)
        // FIX: Controller returns an array of objects { event: 'Name', sold: 10, ... }
        // We map 'event' to 'name' and 'sold' to 'value' for the Pie Chart
        const formattedCategory = (eventTypesRes.data || []).map((item) => ({
            name: item.event,
            value: item.sold
        }));
        setCategoryData(formattedCategory);

        // 4. Platform Fees
        setFeeData(feesRes.data || []);

      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeFilter]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin w-10 h-10 text-gray-500" /></div>;

  return (
    <>
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">Event Analytics</h1>
            <p className="text-gray-600">Detailed insights and performance metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#effe8b]"
            >
              <option value="30days">Last 30 days</option>
              <option value="3months">Last 3 months</option>
              <option value="6months">Last 6 months</option>
            </select>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Summary Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-6">Event Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 border border-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Events</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">{basicStats?.totalEvents || 0}</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">₹{basicStats?.totalRevenue?.toLocaleString() || 0}</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Platform Fee (6%)</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">₹{basicStats?.platformFee?.toLocaleString() || 0}</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Net Revenue</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">₹{basicStats?.netRevenue?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Trends */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Revenue Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#000" strokeWidth={2} dot={{ fill: "#000" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Ticket Sales by Type */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Ticket Sales by Event Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Fee Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Platform Fee Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalRevenue" fill="#000000" name="Total Revenue" />
                <Bar dataKey="platformFee" fill="#FBBF24" name="Platform Fee (6%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default Analytics;