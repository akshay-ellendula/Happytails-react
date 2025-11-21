import Event from '../models/eventModel.js';
import Ticket from '../models/ticketModel.js';
import mongoose from 'mongoose';

// ==========================================
// CONTROLLER: Get Revenue Trends (Line Chart)
// Supports: 30days (Daily), 3months (Weekly), 6months (Monthly)
// ==========================================
export const getRevenueTrends = async (req, res) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        const { period } = req.query; 

        // 1. Fetch Event IDs for this Manager
        const events = await Event.find({ eventManagerId }).select('_id');
        const eventIds = events.map(e => e._id);

        // 2. Determine Date Range & Grouping Format
        const endDate = new Date();
        let startDate = new Date();
        let groupByFormat;
        
        // "Remove unwanted time interval": Logic is strictly mapped to frontend options
        switch (period) {
            case '30days':
                startDate.setDate(endDate.getDate() - 30);
                groupByFormat = "%Y-%m-%d"; // Group by Day
                break;
            case '3months':
                startDate.setMonth(endDate.getMonth() - 3);
                groupByFormat = "%Y-%U"; // Group by Week number
                break;
            case '6months':
            default:
                startDate.setMonth(endDate.getMonth() - 6);
                groupByFormat = "%Y-%m"; // Group by Month
                break;
        }

        // 3. Aggregate Data
        const revenueData = await Ticket.aggregate([
            {
                $match: {
                    eventId: { $in: eventIds },
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: true // Only count active/paid tickets
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: groupByFormat, date: "$createdAt" } },
                    revenue: { $sum: "$price" }
                }
            },
            { $sort: { _id: 1 } } // Sort by date ascending
        ]);

        // 4. Map for Recharts (XAxis: month/date, Line: revenue)
        // Note: For a perfect chart, you might want to fill in "0" for missing dates in JS, 
        // but this returns the actual data points found.
        const formattedData = revenueData.map(item => {
            // Beautify labels based on format
            let label = item._id;
            if(period === '6months') {
                const [year, month] = item._id.split('-');
                const dateObj = new Date(year, month - 1);
                label = dateObj.toLocaleString('default', { month: 'short' });
            }
            return {
                month: label, 
                revenue: item.revenue
            };
        });

        res.status(200).json(formattedData);

    } catch (error) {
        console.error("Error in getRevenueTrends:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==========================================
// CONTROLLER: Get Event Type Distribution (Pie Chart)
// Groups by Event Category
// ==========================================
export const getEventTypeDistribution = async (req, res) => {
    try {
        const eventManagerId = req.user.eventManagerId;

        // Aggregate: Join Events -> Tickets to count sales per category
        const categoryStats = await Event.aggregate([
            { $match: { eventManagerId: new mongoose.Types.ObjectId(eventManagerId) } },
            {
                $lookup: {
                    from: "tickets",
                    localField: "_id",
                    foreignField: "eventId",
                    as: "tickets"
                }
            },
            // Unwind to count individual tickets. 
            // preserveNullAndEmptyArrays: false removes events with 0 tickets (optional)
            { $unwind: "$tickets" },
            {
                $group: {
                    _id: "$category", // Group by Category
                    sold: { $sum: 1 },
                    revenue: { $sum: "$tickets.price" }
                }
            },
            {
                $project: {
                    event: "$_id", // Frontend expects 'event' key for Name
                    sold: 1,
                    revenue: 1,
                    _id: 0
                }
            }
        ]);

        // If no data, return empty array to prevent frontend crash
        res.status(200).json(categoryStats || []);

    } catch (error) {
        console.error("Error in getEventTypeDistribution:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==========================================
// CONTROLLER: Platform Fees Breakdown (Bar Chart)
// Fixed to last 6 months as typically required for breakdown
// ==========================================
export const getPlatformFeeBreakdown = async (req, res) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        const events = await Event.find({ eventManagerId }).select('_id');
        const eventIds = events.map(e => e._id);

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyData = await Ticket.aggregate([
            {
                $match: {
                    eventId: { $in: eventIds },
                    createdAt: { $gte: sixMonthsAgo },
                    status: true
                }
            },
            {
                $group: {
                    _id: { 
                        month: { $month: "$createdAt" }, 
                        year: { $year: "$createdAt" } 
                    },
                    totalRevenue: { $sum: "$price" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const formattedData = monthlyData.map(item => {
            const date = new Date(item._id.year, item._id.month - 1);
            const monthName = date.toLocaleString('default', { month: 'short' });
            
            // Calculate Fees
            const totalRevenue = item.totalRevenue;
            const platformFee = totalRevenue * 0.06; // 6% Fee
            const netRevenue = totalRevenue - platformFee;
            
            return {
                month: `${monthName} ${item._id.year}`,
                totalRevenue,
                platformFee: Math.round(platformFee * 100) / 100,
                netRevenue: Math.round(netRevenue * 100) / 100
            };
        });

        res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error in getPlatformFeeBreakdown:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==========================================
// CONTROLLER: Dashboard Analytics (Basic Stats)
// ==========================================
export const getDashboardAnalytics = async (req, res) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        
        const events = await Event.find({ eventManagerId });
        const eventIds = events.map(e => e._id);

        // Get All Valid Tickets
        const tickets = await Ticket.find({ eventId: { $in: eventIds }, status: true });

        // 1. Totals
        const totalEvents = events.length;
        const totalTicketsSold = tickets.reduce((sum, t) => sum + (t.numberOfTickets || 1), 0);
        const totalRevenue = tickets.reduce((sum, t) => sum + t.price, 0);
        const platformFee = totalRevenue * 0.06;
        const netRevenue = totalRevenue - platformFee;

        // 2. Calculate Growth (Current Month vs Previous Month)
        const now = new Date();
        const startCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        // Filter tickets
        const currentTickets = tickets.filter(t => t.createdAt >= startCurrentMonth);
        const lastTickets = tickets.filter(t => t.createdAt >= startLastMonth && t.createdAt < startCurrentMonth);

        const currentRev = currentTickets.reduce((sum, t) => sum + t.price, 0);
        const lastRev = lastTickets.reduce((sum, t) => sum + t.price, 0);
        
        // Avoid division by zero
        const revenueGrowth = lastRev === 0 ? 100 : Math.round(((currentRev - lastRev) / lastRev) * 100);

        res.status(200).json({
            basicStats: {
                totalEvents,
                totalTicketsSold,
                totalRevenue,
                platformFee: Math.round(platformFee * 100) / 100,
                netRevenue: Math.round(netRevenue * 100) / 100,
                revenueGrowth,
                // Assuming 1 ticket = 1 attendee for simplicity in dashboard
                totalAttendees: totalTicketsSold 
            }
        });

    } catch (error) {
        console.error("Error in getDashboardAnalytics:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==========================================
// CONTROLLER: Performance Metrics
// ==========================================
export const getPerformanceMetrics = async (req, res) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        const events = await Event.find({ eventManagerId });
        const eventIds = events.map(e => e._id);
        
        const tickets = await Ticket.find({ eventId: { $in: eventIds }, status: true });

        const totalRevenue = tickets.reduce((sum, t) => sum + t.price, 0);
        const totalTickets = tickets.reduce((sum, t) => sum + (t.numberOfTickets || 1), 0);
        
        const averageTicketPrice = totalTickets > 0 ? totalRevenue / totalTickets : 0;

        // Calculate Repeat Customers
        const customerCounts = {};
        tickets.forEach(t => {
            if(t.customerId) {
                const cid = t.customerId.toString();
                customerCounts[cid] = (customerCounts[cid] || 0) + 1;
            }
        });
        
        const uniqueCustomers = Object.keys(customerCounts).length;
        const repeatCount = Object.values(customerCounts).filter(count => count > 1).length;
        const repeatCustomerRate = uniqueCustomers > 0 
            ? Math.round((repeatCount / uniqueCustomers) * 100) 
            : 0;

        // Customer Lifetime Value
        const clv = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;

        res.status(200).json({
            averageTicketPrice: Math.round(averageTicketPrice * 100) / 100,
            repeatCustomers: repeatCustomerRate,
            customerLifetimeValue: Math.round(clv)
        });

    } catch (error) {
        console.error("Error in getPerformanceMetrics:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==========================================
// CONTROLLER: Attendance (Extra Utility)
// ==========================================
export const getAttendanceAnalytics = async (req, res) => {
    try {
        // Returns event-wise attendance stats
        const eventManagerId = req.user.eventManagerId;
        const events = await Event.find({ eventManagerId });

        const attendanceData = events.map(event => ({
            name: event.title,
            date: new Date(event.date_time).toLocaleDateString(),
            capacity: event.total_tickets || 100,
            sold: event.tickets_sold || 0,
            rate: Math.round(((event.tickets_sold || 0) / (event.total_tickets || 100)) * 100)
        }));

        res.status(200).json(attendanceData);
    } catch (error) {
        console.error("Error in getAttendanceAnalytics:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};