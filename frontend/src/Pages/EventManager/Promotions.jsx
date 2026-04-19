import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../utils/axios';
import { Mail, Send, Users, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Promotions = () => {
    const [audience, setAudience] = useState('all'); // 'all' or 'event'
    const [selectedEventId, setSelectedEventId] = useState('');
    const [events, setEvents] = useState([]);
    
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Manager's upcoming events for the dropdown
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Pass status=upcoming and high limit so all upcoming events appear
                const res = await axiosInstance.get('/events/my-events', {
                    params: { status: 'upcoming', limit: 100 }
                });
                if (res.data && res.data.events) {
                    setEvents(res.data.events);
                }
            } catch (err) {
                console.error("Failed to fetch events:", err);
            }
        };
        fetchEvents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (audience === 'event' && !selectedEventId) {
            toast.error("Please select an event");
            return;
        }

        if (!subject.trim() || !message.trim()) {
            toast.error("Subject and message are required");
            return;
        }

        setIsSubmitting(true);
        const sendPromise = axiosInstance.post('/events/promotions/send', {
            audience,
            eventId: selectedEventId,
            subject,
            message
        });

        toast.promise(sendPromise, {
            loading: 'Preparing and dispatching promotional emails...',
            success: 'Promotions sent successfully!',
            error: 'Failed to send promotions'
        });

        try {
            await sendPromise;
            // Clear form on success
            setSubject('');
            setMessage('');
        } catch (error) {
            console.error("Error sending promotions:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 p-6 md:p-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#f2c737] border-4 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
                    <Mail className="w-8 h-8 text-black" strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-[#1a1a1a] uppercase tracking-wide">
                        Promotions
                    </h1>
                    <p className="text-gray-600 font-bold mt-1">Broadcast announcements to your audiences</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border-4 border-black rounded-3xl p-8 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                
                <div className="space-y-8">
                    {/* Audience Selection */}
                    <div className="space-y-4">
                        <label className="text-xl font-black text-black uppercase tracking-wider flex items-center gap-2">
                            <Users className="w-6 h-6 text-[#f2c737]" />
                            Target Audience
                        </label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setAudience('all')}
                                className={`p-6 border-4 border-black rounded-2xl text-left transition-all ${
                                    audience === 'all' 
                                    ? 'bg-[#effe8b] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' 
                                    : 'bg-gray-50 hover:bg-gray-100 opacity-60 hover:opacity-100'
                                }`}
                            >
                                <Users className="w-8 h-8 mb-3 text-black" />
                                <h3 className="text-xl font-black text-black mb-1">All Customers</h3>
                                <p className="text-sm font-bold text-gray-600">Blast to everyone on the platform</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setAudience('event')}
                                className={`p-6 border-4 border-black rounded-2xl text-left transition-all ${
                                    audience === 'event' 
                                    ? 'bg-[#effe8b] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' 
                                    : 'bg-gray-50 hover:bg-gray-100 opacity-60 hover:opacity-100'
                                }`}
                            >
                                <Calendar className="w-8 h-8 mb-3 text-black" />
                                <h3 className="text-xl font-black text-black mb-1">Event Attendees</h3>
                                <p className="text-sm font-bold text-gray-600">Target people from a specific event</p>
                            </button>
                        </div>
                    </div>

                    {/* Conditional Event Dropdown */}
                    {audience === 'event' && (
                        <div className="bg-gray-50 border-4 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <label className="block text-sm font-black text-black uppercase mb-3">
                                Select Event
                            </label>
                            <select 
                                value={selectedEventId}
                                onChange={(e) => setSelectedEventId(e.target.value)}
                                className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 font-bold text-gray-800 outline-none focus:ring-4 focus:ring-[#f2c737]/50 transition-shadow appearance-none cursor-pointer"
                                required
                            >
                                <option value="" disabled>-- Choose an Event --</option>
                                {events.map(ev => (
                                    <option key={ev.id} value={ev.id}>
                                        {ev.title} ({new Date(ev.date_time).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                            {events.length === 0 && (
                                <p className="text-red-500 font-bold mt-2 text-sm flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" /> You don't have any events yet.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Email Content */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xl font-black text-black uppercase tracking-wider">
                                Email Subject
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g. Huge Weekend Sale 🐾 Grab your tickets!"
                                required
                                className="w-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl px-6 py-4 text-lg font-bold placeholder:text-gray-400 outline-none focus:ring-4 focus:ring-[#f2c737]/50 transition-shadow"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xl font-black text-black uppercase tracking-wider flex items-center justify-between">
                                <span>Message Body</span>
                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border-2 border-black">HTML Support ❌ Plain Text Only</span>
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write your promotional message here... It will automatically be wrapped in our beautiful HappyTails HTML template!"
                                rows={8}
                                required
                                className="w-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl px-6 py-5 font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:ring-4 focus:ring-[#f2c737]/50 transition-shadow resize-y"
                            ></textarea>
                            <p className="text-sm font-bold text-gray-500 mt-2">
                                * Your message will be beautifully wrapped in the HappyTails premium Gold & Black email template.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 border-t-4 border-black">
                        <button
                            type="submit"
                            disabled={isSubmitting || (audience === 'event' && !selectedEventId)}
                            className="w-full md:w-auto bg-[#f2c737] hover:bg-[#effe8b] text-black border-4 border-black font-black uppercase tracking-widest px-8 py-5 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                                    Sending Broadcast...
                                </>
                            ) : (
                                <>
                                    <Send className="w-6 h-6" strokeWidth={3} />
                                    Blast Email Now
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Promotions;
