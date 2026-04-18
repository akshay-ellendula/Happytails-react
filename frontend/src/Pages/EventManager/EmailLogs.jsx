import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../utils/axios';
import { Mail, Calendar, Users, ChevronDown, ChevronUp } from 'lucide-react';

const EmailLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedLog, setExpandedLog] = useState(null);
    
    // Pagination & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await axiosInstance.get('/review/manager/analytics');
                setLogs(response.data.emailLogs || []);
            } catch (err) {
                console.error("Failed to fetch email logs:", err);
                setError("Could not load email logs at this time.");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const toggleExpand = (id) => {
        if (expandedLog === id) {
            setExpandedLog(null);
        } else {
            setExpandedLog(id);
        }
    };

    // Filter Logic
    const filteredLogs = logs.filter(log => 
        log.eventTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination Logic
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    // Reset pagination when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-[#f2c737]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 md:p-8">
                <div className="bg-red-100 border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-red-700 font-bold text-lg">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-4xl font-black text-[#1a1a1a] uppercase tracking-wide flex items-center gap-3">
                    <Mail className="w-10 h-10 text-[#f2c737]" strokeWidth={3} />
                    Email Logs
                </h1>
                <div className="bg-[#effe8b] font-bold px-4 py-2 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    Batches Tracked: {logs.length}
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <input 
                    type="text" 
                    placeholder="🔍 Search log batches by Event Title..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-2 border-black px-4 py-3 font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                />
            </div>

            {filteredLogs.length === 0 ? (
                <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-12 text-center mt-6">
                    <div className="w-20 h-20 bg-[#f2c737] border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Mail className="w-10 h-10" />
                    </div>
                    <p className="text-2xl font-bold text-[#1a1a1a]">No emails have been sent yet!</p>
                    <p className="text-gray-600 mt-2 font-medium">As review requests are sent via automation, they will appear grouped here.</p>
                </div>
            ) : (
                <div className="grid gap-6 mt-8">
                    {currentLogs.map((log) => (
                        <div key={log.id} className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden transition-all duration-300">
                            {/* Header / Summary row */}
                            <div 
                                className="p-6 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-gray-50 group"
                                onClick={() => toggleExpand(log.id)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Calendar className="w-5 h-5 text-gray-500" />
                                        <span className="font-bold text-gray-600 text-sm tracking-widest uppercase">
                                            {new Date(log.sentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 className="font-black text-2xl text-[#1a1a1a] flex flex-wrap gap-2 items-center">
                                        {log.eventTitle}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-6 mt-4 md:mt-0">
                                    <div className="flex items-center gap-2 bg-[#effe8b] px-4 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <Users className="w-5 h-5" />
                                        <span className="font-black text-lg">{log.emailsSent} Sent</span>
                                    </div>
                                    <div className="w-10 h-10 bg-[#f2c737] border-2 border-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        {expandedLog === log.id ? <ChevronUp strokeWidth={3} /> : <ChevronDown strokeWidth={3} />}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details list */}
                            {expandedLog === log.id && (
                                <div className="border-t-2 border-black p-6 bg-gray-50">
                                    <h4 className="font-bold text-lg mb-4 text-[#1a1a1a] uppercase bg-white inline-block px-3 py-1 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Recipient Status</h4>
                                    <div className="overflow-x-auto rounded-xl border-2 border-black bg-white">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-[#f2c737] border-b-2 border-black text-black">
                                                    <th className="p-3 font-black uppercase text-sm border-r-2 border-black">Ticket ID</th>
                                                    <th className="p-3 font-black uppercase text-sm border-r-2 border-black">Name</th>
                                                    <th className="p-3 font-black uppercase text-sm border-r-2 border-black">Email</th>
                                                    <th className="p-3 font-black uppercase text-sm text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {log.recipients.map((rec, i) => (
                                                    <tr key={i} className={`border-b-2 border-black ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-yellow-50`}>
                                                        <td className="p-3 font-bold text-gray-700 border-r-2 border-black text-sm">{rec.ticketId || "N/A"}</td>
                                                        <td className="p-3 font-semibold text-gray-900 border-r-2 border-black">{rec.customerName}</td>
                                                        <td className="p-3 text-gray-600 border-r-2 border-black">{rec.customerEmail}</td>
                                                        <td className="p-3 text-center">
                                                            {rec.hasReviewed ? (
                                                                <span className="inline-block bg-green-200 text-green-800 border-2 border-green-800 text-xs font-bold px-2 py-1 rounded-full uppercase">Reviewed</span>
                                                            ) : (
                                                                <span className="inline-block bg-yellow-200 text-yellow-800 border-2 border-yellow-800 text-xs font-bold px-2 py-1 rounded-full uppercase">Pending</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-4">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="bg-white border-2 border-black px-4 py-2 font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>
                            <span className="font-bold">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="bg-[#f2c737] border-2 border-black px-4 py-2 font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmailLogs;
