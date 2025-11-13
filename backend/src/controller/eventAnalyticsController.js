import Event from '../models/eventModel.js';
import Ticket from '../models/ticketModel.js';

//@desc Get comprehensive dashboard analytics
//@route GET /api/analytics/dashboard
//@access Event Manager
export const getDashboardAnalytics = async (req, res) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        
        const events = await Event.find({ eventManagerId });
        const eventIds = events.map(event => event._id);
        const tickets = await Ticket.find({ eventId: { $in: eventIds } });

        // Basic Stats
        const totalEvents = events.length;
        const totalTicketsSold = tickets.reduce((sum, ticket) => sum + ticket.numberOfTickets, 0);
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
                totalAttendees: totalTicketsSold,
                revenueGrowth: 15, // Mock data
                ticketsGrowth: 8,
                eventsGrowth: 12,
                attendeesGrowth: 5
            },
            chartData: await generateChartData(eventIds),
            performanceMetrics: await getPerformanceMetrics(eventManagerId)
        });

    } catch (error) {
        console.log("Error in getDashboardAnalytics controller:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

//@desc Get revenue trends data for charts
//@route GET /api/analytics/revenue-trends
//@access Event Manager
export const getRevenueTrends = async (req, res) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        const { period = '6months' } = req.query;

        const revenueData = await generateRevenueTrendsData(period);
        
        res.status(200).json(revenueData);

    } catch (error) {
        console.log("Error in getRevenueTrends controller:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

//@desc Get event type distribution
//@route GET /api/analytics/event-types
//@access Event Manager
export const getEventTypeDistribution = async (req, res) => {
    try {
        const eventManagerId = req.user.eventManagerId;

        const events = await Event.find({ eventManagerId });
        const eventIds = events.map(event => event._id);
        const tickets = await Ticket.find({ eventId: { $in: eventIds } });

        const categoryStats = {};
        
        events.forEach(event => {
            if (!categoryStats[event.category]) {
                categoryStats[event.category] = {
                    count: 0,
                    ticketsSold: 0,
                    revenue: 0
                };
            }
            
            const eventTickets = tickets.filter(ticket => ticket.eventId.toString() === event._id.toString());
            const eventRevenue = eventTickets.reduce((sum, ticket) => sum + ticket.price, 0);
            
            categoryStats[event.category].count++;
            categoryStats[event.category].ticketsSold += event.tickets_sold;
            categoryStats[event.category].revenue += eventRevenue;
        });

        const chartData = {
            labels: Object.keys(categoryStats),
            datasets: [
                {
                    label: 'Ticket Sales',
                    data: Object.values(categoryStats).map(stats => stats.ticketsSold),
                    backgroundColor: ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171']
                }
            ]
        };

        res.status(200).json({
            chartData,
            detailedStats: categoryStats
        });

    } catch (error) {
        console.log("Error in getEventTypeDistribution controller:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

//@desc Get attendance analytics
//@route GET /api/analytics/attendance
//@access Event Manager
export const getAttendanceAnalytics = async (req, res) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        const events = await Event.find({ eventManagerId });

        const attendanceData = events.map(event => ({
            eventName: event.title,
            date: event.date_time,
            capacity: event.total_tickets,
            sold: event.tickets_sold,
            attendanceRate: (event.tickets_sold / event.total_tickets) * 100
        }));

        const sortedEvents = attendanceData.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-10);

        res.status(200).json({
            chartData: {
                labels: sortedEvents.map(event => {
                    const date = new Date(event.date);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                }),
                attendanceRates: sortedEvents.map(event => Math.round(event.attendanceRate))
            },
            detailedData: attendanceData
        });

    } catch (error) {
        console.log("Error in getAttendanceAnalytics controller:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

//@desc Get platform fee breakdown
//@route GET /api/analytics/platform-fees
//@access Event Manager
export const getPlatformFeeBreakdown = async (req, res) => {
    try {
        const monthlyData = await generateMonthlyFeeData(6);
        res.status(200).json(monthlyData);

    } catch (error) {
        console.log("Error in getPlatformFeeBreakdown controller:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

//@desc Get performance metrics
//@route GET /api/analytics/performance-metrics
//@access Event Manager
export const getPerformanceMetrics = async (req, res) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        
        const events = await Event.find({ eventManagerId });
        const eventIds = events.map(event => event._id);
        const tickets = await Ticket.find({ eventId: { $in: eventIds } });

        const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
        const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.numberOfTickets, 0);
        
        const averageTicketPrice = totalTickets > 0 ? totalRevenue / totalTickets : 0;

        res.status(200).json({
            averageTicketPrice: Math.round(averageTicketPrice * 100) / 100,
            conversionRate: 78, // Mock data
            repeatCustomers: 42, // Mock data
            customerLifetimeValue: 186 // Mock data
        });

    } catch (error) {
        console.log("Error in getPerformanceMetrics controller:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Helper functions
const generateChartData = async (eventIds) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const revenue = [3200, 4500, 3800, 5100, 4200, 5900, 4800, 6200, 5500, 9000];
    
    return {
        revenueChart: {
            labels: months,
            datasets: [{
                label: 'Revenue',
                data: revenue,
                backgroundColor: '#1a1a1a'
            }]
        }
    };
};

const generateRevenueTrendsData = async (period) => {
    let labels, revenue;
    
    switch (period) {
        case '30days':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            revenue = [1200, 1800, 1500, 2100];
            break;
        case '3months':
            labels = ['Month 1', 'Month 2', 'Month 3'];
            revenue = [5200, 4800, 6100];
            break;
        case '6months':
        default:
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            revenue = [3200, 4500, 3800, 5100, 4200, 5900];
    }
    
    return {
        labels,
        datasets: [{
            label: 'Revenue',
            data: revenue,
            borderColor: '#1a1a1a',
            backgroundColor: 'rgba(239, 254, 139, 0.2)',
            tension: 0.4,
            fill: true
        }]
    };
};

const generateMonthlyFeeData = async (months) => {
    const monthlyData = [];
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(currentDate.getMonth() - i);
        
        const monthName = monthDate.toLocaleString('default', { month: 'long' });
        const year = monthDate.getFullYear();
        
        const totalRevenue = [9000, 8200, 7500, 6800, 7200, 6500][i] || 5000;
        const platformFee = totalRevenue * 0.06;
        const netRevenue = totalRevenue - platformFee;
        
        monthlyData.push({
            month: `${monthName} ${year}`,
            totalRevenue,
            platformFee: Math.round(platformFee * 100) / 100,
            netRevenue: Math.round(netRevenue * 100) / 100
        });
    }
    
    return monthlyData;
};