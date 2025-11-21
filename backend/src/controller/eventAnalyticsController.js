import Event from '../models/eventModel.js';
import Ticket from '../models/ticketModel.js';

// ==========================================
// CONTROLLER: Get Revenue Trends (Line Chart)
// Matches Frontend: <LineChart data={revenueTrend}>
// ==========================================
export const getRevenueTrends = async (req, res) => {
    try {
        // In a real app, you would filter by req.user.eventManagerId
        // For now, we return the mock data structure your frontend needs
        const period = '6months'; 
        const revenueData = await generateRevenueTrendsData(period);
        
        // DIRECTLY return the array. 
        // Frontend: setRevenueTrend(trendRes.data || [])
        res.status(200).json(revenueData);

    } catch (error) {
        console.log("Error in getRevenueTrends controller:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==========================================
// CONTROLLER: Get Event Type Distribution (Bar Chart)
// Matches Frontend: <BarChart data={ticketBreakdown}>
// ==========================================
export const getEventTypeDistribution = async (req, res) => {
    try {
        const eventManagerId = req.user.eventManagerId;

        // 1. Fetch Data
        const events = await Event.find({ eventManagerId });
        const eventIds = events.map(event => event._id);
        const tickets = await Ticket.find({ eventId: { $in: eventIds } });

        // 2. Aggregate Data
        const categoryStats = {};
        
        events.forEach(event => {
            // specific category or fallback
            const catName = event.category || 'General'; 

            if (!categoryStats[catName]) {
                categoryStats[catName] = {
                    event: catName, // "event" matches <XAxis dataKey="event" />
                    sold: 0,        // "sold" matches <Bar dataKey="sold" />
                    revenue: 0
                };
            }
            
            // Calculate Revenue for this specific event
            const eventTickets = tickets.filter(t => t.eventId.toString() === event._id.toString());
            const eventRevenue = eventTickets.reduce((sum, t) => sum + t.price, 0);
            
            // Accumulate
            // assuming event.tickets_sold is a field in your Event model, otherwise use eventTickets.length
            const soldCount = event.tickets_sold || eventTickets.length || 0;
            
            categoryStats[catName].sold += soldCount;
            categoryStats[catName].revenue += eventRevenue;
        });

        // 3. Convert Object to Array for Recharts
        // Output: [{ event: 'Music', sold: 120, revenue: 5000 }, ...]
        const chartData = Object.values(categoryStats);

        res.status(200).json(chartData);

    } catch (error) {
        console.log("Error in getEventTypeDistribution controller:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==========================================
// CONTROLLER: Dashboard Analytics (General)
// ==========================================
export const getDashboardAnalytics = async (req, res) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        
        const events = await Event.find({ eventManagerId });
        const eventIds = events.map(event => event._id);
        const tickets = await Ticket.find({ eventId: { $in: eventIds } });

        // Basic Stats Calculations
        const totalEvents = events.length;
        const totalTicketsSold = tickets.reduce((sum, ticket) => sum + ticket.numberOfTickets || 1, 0);
        const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
        const platformFee = totalRevenue * 0.06;
        const netRevenue = totalRevenue - platformFee;

        res.status(200).json({
            basicStats: {
                totalEvents,
                totalTicketsSold,
                totalRevenue,
                platformFee,
                netRevenue,
                totalAttendees: totalTicketsSold, // Assuming 1 ticket = 1 attendee
                revenueGrowth: 15, 
                ticketsGrowth: 8,
                eventsGrowth: 12,
                attendeesGrowth: 5
            },
            // Ensure this helper also returns Recharts format if used in frontend
            chartData: await generateChartData(eventIds), 
            performanceMetrics: await getPerformanceMetricsHelper(eventManagerId, events, tickets)
        });

    } catch (error) {
        console.log("Error in getDashboardAnalytics controller:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==========================================
// CONTROLLER: Platform Fees
// ==========================================
export const getPlatformFeeBreakdown = async (req, res) => {
    try {
        const monthlyData = await generateMonthlyFeeData(6);
        res.status(200).json(monthlyData);
    } catch (error) {
        console.log("Error in getPlatformFeeBreakdown controller:", error);
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
        const eventIds = events.map(event => event._id);
        const tickets = await Ticket.find({ eventId: { $in: eventIds } });

        const metrics = await getPerformanceMetricsHelper(eventManagerId, events, tickets);
        res.status(200).json(metrics);

    } catch (error) {
        console.log("Error in getPerformanceMetrics controller:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ==========================================
// CONTROLLER: Attendance (Optional/Extra)
// ==========================================
export const getAttendanceAnalytics = async (req, res) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        const events = await Event.find({ eventManagerId });

        // Format directly for Recharts if you build a chart for this later
        const attendanceData = events.map(event => ({
            name: event.title,
            date: new Date(event.date).toLocaleDateString(),
            capacity: event.capacity || 100,
            sold: event.tickets_sold || 0,
            rate: Math.round(((event.tickets_sold || 0) / (event.capacity || 100)) * 100)
        }));

        res.status(200).json(attendanceData);
    } catch (error) {
        console.log("Error in getAttendanceAnalytics controller:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Helper for Performance Metrics to avoid code duplication
const getPerformanceMetricsHelper = async (id, events, tickets) => {
    const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
    const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.numberOfTickets || 1, 0);
    const averageTicketPrice = totalTickets > 0 ? totalRevenue / totalTickets : 0;

    return {
        averageTicketPrice: Math.round(averageTicketPrice * 100) / 100,
        conversionRate: 78,
        repeatCustomers: 42,
        customerLifetimeValue: 186
    };
};

const generateChartData = async (eventIds) => {
    // Recharts Format: Array of Objects
    return [
        { month: 'Jan', revenue: 3200 },
        { month: 'Feb', revenue: 4500 },
        { month: 'Mar', revenue: 3800 },
        { month: 'Apr', revenue: 5100 },
        { month: 'May', revenue: 4200 },
        { month: 'Jun', revenue: 5900 },
        { month: 'Jul', revenue: 4800 },
        { month: 'Aug', revenue: 6200 },
        { month: 'Sep', revenue: 5500 },
        { month: 'Oct', revenue: 9000 }
    ];
};

const generateRevenueTrendsData = async (period) => {
    // Recharts Format: Array of Objects
    // Keys MUST match <XAxis dataKey="month"> and <Line dataKey="revenue">
    
    const dataMap = {
        '30days': [
            { month: 'Week 1', revenue: 1200 },
            { month: 'Week 2', revenue: 1800 },
            { month: 'Week 3', revenue: 1500 },
            { month: 'Week 4', revenue: 2100 }
        ],
        '3months': [
            { month: 'Month 1', revenue: 5200 },
            { month: 'Month 2', revenue: 4800 },
            { month: 'Month 3', revenue: 6100 }
        ],
        '6months': [
            { month: 'Jan', revenue: 3200 },
            { month: 'Feb', revenue: 4500 },
            { month: 'Mar', revenue: 3800 },
            { month: 'Apr', revenue: 5100 },
            { month: 'May', revenue: 4200 },
            { month: 'Jun', revenue: 5900 }
        ]
    };

    return dataMap[period] || dataMap['6months'];
};

const generateMonthlyFeeData = async (months) => {
    const monthlyData = [];
    const currentDate = new Date();
    
    // Fixed mock data array for simplicity
    const revenuePattern = [6500, 7200, 6800, 7500, 8200, 9000];

    for (let i = months - 1; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(currentDate.getMonth() - i);
        
        const monthName = monthDate.toLocaleString('default', { month: 'short' }); // 'Jan' not 'January'
        const year = monthDate.getFullYear();
        
        const totalRevenue = revenuePattern[i] || 5000;
        const platformFee = totalRevenue * 0.06;
        const netRevenue = totalRevenue - platformFee;
        
        monthlyData.push({
            month: `${monthName} ${year}`, // Matches XAxis
            totalRevenue,
            platformFee: Math.round(platformFee * 100) / 100,
            netRevenue: Math.round(netRevenue * 100) / 100
        });
    }
    
    return monthlyData;
};