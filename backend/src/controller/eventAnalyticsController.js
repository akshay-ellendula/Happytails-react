import Event from '../models/eventModel.js';
import Ticket from '../models/ticketModel.js';
import mongoose from 'mongoose';

// Helper function to parse dates from the query
const parseDates = (query) => {
    let { startDate, endDate } = query;
    
    // Default to today if no end date
    const end = endDate ? new Date(endDate) : new Date();
    // Default to 30 days ago if no start date
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Set hours to cover the entire day
    end.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);

    return { start, end };
};

// ==========================================
// CONTROLLER: Get Revenue Trends (Line Chart)
// ==========================================
export const getRevenueTrends = async (req, res) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        const { start, end } = parseDates(req.query);

        // 1. Fetch Event IDs for this Manager
        const events = await Event.find({ eventManagerId }).select('_id');
        const eventIds = events.map(e => e._id);

        // 2. Determine Date Range & Grouping Format dynamically
        const diffDays = (end - start) / (1000 * 60 * 60 * 24);
        let groupByFormat = "%Y-%m-%d"; // Default to daily
        
        if (diffDays > 90) {
            groupByFormat = "%Y-%m"; // Group by Month if range > 3 months
        } else if (diffDays > 31) {
            groupByFormat = "%Y-%U"; // Group by Week if range > 1 month
        }

        // 3. Aggregate Data
        const revenueData = await Ticket.aggregate([
            {
                $match: {
                    eventId: { $in: eventIds },
                    createdAt: { $gte: start, $lte: end },
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
        const formattedData = revenueData.map(item => {
            let label = item._id;
            if(groupByFormat === "%Y-%m") {
                const [year, month] = item._id.split('-');
                const dateObj = new Date(year, month - 1);
                label = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });
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
// ==========================================
export const getEventTypeDistribution = async (req, res) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        const { start, end } = parseDates(req.query);

        // Fetch events to get categories map
        const events = await Event.find({ eventManagerId }).select('_id category');
        const eventMap = {};
        events.forEach(e => {
            eventMap[e._id.toString()] = e.category || 'General';
        });

        // Find tickets in the date range
        const tickets = await Ticket.find({
            eventId: { $in: events.map(e => e._id) },
            createdAt: { $gte: start, $lte: end },
            status: true
        });

        // Group by category manually
        const categoryStats = {};
        tickets.forEach(t => {
            const cat = eventMap[t.eventId.toString()];
            if (!categoryStats[cat]) {
                categoryStats[cat] = { sold: 0, revenue: 0 };
            }
            categoryStats[cat].sold += (t.numberOfTickets || 1);
            categoryStats[cat].revenue += t.price;
        });

        const formattedData = Object.keys(categoryStats).map(cat => ({
            event: cat,
            sold: categoryStats[cat].sold,
            revenue: categoryStats[cat].revenue
        }));

        res.status(200).json(formattedData);

    } catch (error) {
        console.error("Error in getEventTypeDistribution:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==========================================
// CONTROLLER: Platform Fees Breakdown (Bar Chart)
// ==========================================
export const getPlatformFeeBreakdown = async (req, res) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        const { start, end } = parseDates(req.query);
        
        const events = await Event.find({ eventManagerId }).select('_id');
        const eventIds = events.map(e => e._id);

        const monthlyData = await Ticket.aggregate([
            {
                $match: {
                    eventId: { $in: eventIds },
                    createdAt: { $gte: start, $lte: end },
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
        const { start, end } = parseDates(req.query);
        
        const events = await Event.find({ eventManagerId });
        const eventIds = events.map(e => e._id);

        // Get Valid Tickets in date range
        const tickets = await Ticket.find({ 
            eventId: { $in: eventIds }, 
            createdAt: { $gte: start, $lte: end },
            status: true 
        });

        // 1. Totals
        const totalEvents = events.length; // Total overall events for this manager
        const totalTicketsSold = tickets.reduce((sum, t) => sum + (t.numberOfTickets || 1), 0);
        const totalRevenue = tickets.reduce((sum, t) => sum + t.price, 0);
        const platformFee = totalRevenue * 0.06;
        const netRevenue = totalRevenue - platformFee;

        // 2. Calculate Growth (Current Period vs Previous Period)
        const periodLength = end.getTime() - start.getTime();
        const prevStart = new Date(start.getTime() - periodLength);
        const prevEnd = new Date(start.getTime() - 1); // 1 ms before current start

        const prevTickets = await Ticket.find({
            eventId: { $in: eventIds },
            createdAt: { $gte: prevStart, $lte: prevEnd },
            status: true
        });

        const prevRev = prevTickets.reduce((sum, t) => sum + t.price, 0);
        
        // Avoid division by zero
        let revenueGrowth = 0;
        if (prevRev === 0) {
            revenueGrowth = totalRevenue > 0 ? 100 : 0;
        } else {
            revenueGrowth = Math.round(((totalRevenue - prevRev) / prevRev) * 100);
        }

        res.status(200).json({
            basicStats: {
                totalEvents,
                totalTicketsSold,
                totalRevenue,
                platformFee: Math.round(platformFee * 100) / 100,
                netRevenue: Math.round(netRevenue * 100) / 100,
                revenueGrowth,
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
        const { start, end } = parseDates(req.query);

        const events = await Event.find({ eventManagerId }).select('_id');
        const eventIds = events.map(e => e._id);
        
        const tickets = await Ticket.find({ 
            eventId: { $in: eventIds }, 
            createdAt: { $gte: start, $lte: end },
            status: true 
        });

        const totalRevenue = tickets.reduce((sum, t) => sum + t.price, 0);
        const totalTickets = tickets.reduce((sum, t) => sum + (t.numberOfTickets || 1), 0);
        const averageTicketPrice = totalTickets > 0 ? totalRevenue / totalTickets : 0;

        // Calculate Customer LTV
        const customerCounts = {};
        tickets.forEach(t => {
            if(t.customerId) {
                const cid = t.customerId.toString();
                customerCounts[cid] = (customerCounts[cid] || 0) + 1;
            }
        });
        
        const uniqueCustomers = Object.keys(customerCounts).length;
        const clv = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;

        res.status(200).json({
            averageTicketPrice: Math.round(averageTicketPrice * 100) / 100,
            customerLifetimeValue: Math.round(clv)
        });

    } catch (error) {
        console.error("Error in getPerformanceMetrics:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==========================================
// CONTROLLER: Attendance
// ==========================================
export const getAttendanceAnalytics = async (req, res) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        const { start, end } = parseDates(req.query);
        
        // Find events whose date_time falls within the selected filter range
        const events = await Event.find({ 
            eventManagerId,
            date_time: { $gte: start, $lte: end }
        });

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