// src/Pages/Admin/EventManagerDetails.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchEventManagerDetails,
    fetchEventManagerMetrics,
    fetchUpcomingEvents,
    fetchPastEvents,
    updateEventManager,
    deleteEventManager,
    clearSelectedEventManager,
} from "../../store/eventManagersSlice";
import { Loader2 } from "lucide-react";

const EventManagerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux State
    const {
        selected: manager,
        metrics,
        upcomingEvents,
        pastEvents,
        loadingDetail,
        error,
    } = useSelector((state) => state.eventManagers);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        organization: "",
        phone: "",
        profilePic: null,
    });

    // Fetch Data on Mount
    useEffect(() => {
        if (id) {
            dispatch(fetchEventManagerDetails(id));
            dispatch(fetchEventManagerMetrics(id));
            dispatch(fetchUpcomingEvents(id));
            dispatch(fetchPastEvents(id));
        }

        return () => {
            dispatch(clearSelectedEventManager());
        };
    }, [dispatch, id]);

    // Update local form data when manager details are loaded
    useEffect(() => {
        if (manager) {
            setFormData({
                name: manager.name || "",
                email: manager.email || "",
                organization: manager.organization || "",
                phone: manager.phone || "",
                profilePic: null,
            });
        }
    }, [manager]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("organization", formData.organization);
        data.append("phone", formData.phone);
        if (formData.profilePic) data.append("profilePic", formData.profilePic);

        const resultAction = await dispatch(updateEventManager({ id, formData: data }));
        if (updateEventManager.fulfilled.match(resultAction)) {
            alert("Event Manager updated successfully");
            setIsEditing(false);
            dispatch(fetchEventManagerDetails(id));
        } else {
            alert(resultAction.payload || "Update failed");
        }
    };

    const handleDelete = async () => {
        if (
            !window.confirm(
                "Delete this Event Manager and ALL their events & tickets? This cannot be undone!"
            )
        )
            return;

        const resultAction = await dispatch(deleteEventManager(id));
        if (deleteEventManager.fulfilled.match(resultAction)) {
            alert("Event Manager deleted successfully");
            navigate("/admin/event-managers");
        } else {
            alert(resultAction.payload || "Failed to delete manager");
        }
    };

    if (loadingDetail) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 text-center">
                <p className="text-red-500 text-xl mb-4">Error: {error}</p>
                <button
                    onClick={() => navigate("/admin/event-managers")}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Back to List
                </button>
            </div>
        );
    }

    if (!manager) return <div className="p-10 text-center text-2xl">Manager not found</div>;

    // Edit View
    if (isEditing) {
        return (
            <div className="max-w-5xl mx-auto p-5 bg-gray-100 min-h-screen font-sans text-gray-800">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-[#6495ed] border-b pb-2 mb-4">
                        Edit Manager Information
                    </h3>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="flex justify-center mb-6">
                            <label htmlFor="pic" className="cursor-pointer relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
                                    <img
                                        src={
                                            formData.profilePic
                                                ? URL.createObjectURL(formData.profilePic)
                                                : manager.profilePic?.startsWith("data:")
                                                    ? manager.profilePic
                                                    : manager.profilePic
                                                        ? `data:image/jpeg;base64,${manager.profilePic}`
                                                        : "https://via.placeholder.com/150"
                                        }
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">
                                    Change
                                </div>
                                <input
                                    type="file"
                                    id="pic"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                        setFormData({ ...formData, profilePic: e.target.files[0] })
                                    }
                                />
                            </label>
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Name:</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded focus:border-green-500 outline-none"
                                required
                                minLength={2}
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Email:</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded focus:border-green-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Organization:</label>
                            <input
                                type="text"
                                value={formData.organization}
                                onChange={(e) =>
                                    setFormData({ ...formData, organization: e.target.value })
                                }
                                className="w-full p-2 border border-gray-300 rounded focus:border-green-500 outline-none"
                                required
                                minLength={3}
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Phone:</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded focus:border-green-500 outline-none"
                                required
                                pattern="^\+91[6-9][0-9]{9}$"
                                title="Enter valid Indian mobile number (+91XXXXXXXXXX)"
                            />
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button
                                type="submit"
                                className="bg-[#8fbc8f] text-white px-4 py-2 rounded hover:opacity-90"
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // View Mode
    return (
        <div className="max-w-5xl mx-auto p-5 bg-gray-100 min-h-screen font-sans text-gray-800">
            {/* Header */}
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-300">
                <button
                    onClick={() => navigate("/admin/event-managers")}
                    className="bg-[#8fbc8f] text-white px-4 py-2 rounded hover:opacity-90 text-sm font-medium flex items-center gap-1"
                >
                    ← Back to Managers
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-[#4682b4] text-white px-4 py-2 rounded hover:opacity-90 text-sm font-medium"
                    >
                        Edit Manager
                    </button>
                    <button
                        onClick={handleDelete}
                        className="bg-[#dc3545] text-white px-4 py-2 rounded hover:opacity-90 text-sm font-medium"
                    >
                        Delete Manager
                    </button>
                </div>
            </div>

            {/* Manager Profile */}
            <div className="bg-white rounded-lg shadow p-5 mb-5 flex items-center">
                <div className="mr-5">
                    {manager.profilePic ? (
                        <img
                            src={
                                manager.profilePic.startsWith("data:")
                                    ? manager.profilePic
                                    : `data:image/jpeg;base64,${manager.profilePic}`
                            }
                            alt={manager.name}
                            className="w-20 h-20 rounded-full object-cover bg-[#6495ed]"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-[#6495ed] text-white flex items-center justify-center text-3xl font-bold">
                            {manager.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-1">{manager.name}</h2>
                    <p className="text-gray-500">{manager.email}</p>
                </div>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-5 mb-5">
                <h3 className="text-lg font-semibold text-[#6495ed] border-b border-gray-100 pb-2 mb-4">
                    Basic Information
                </h3>
                <table className="w-full border-collapse">
                    <tbody>
                        <tr>
                            <td className="py-2 px-1 font-semibold w-1/3 border-b border-gray-100">Manager ID:</td>
                            <td className="py-2 px-1 border-b border-gray-100 text-gray-600">#{manager.id}</td>
                        </tr>
                        <tr>
                            <td className="py-2 px-1 font-semibold w-1/3 border-b border-gray-100">Joined Date:</td>
                            <td className="py-2 px-1 border-b border-gray-100 text-gray-600">
                                {new Date(manager.joined_date).toLocaleDateString()}
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2 px-1 font-semibold w-1/3 border-b border-gray-100">Organization:</td>
                            <td className="py-2 px-1 border-b border-gray-100 text-gray-600">
                                {manager.organization}
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2 px-1 font-semibold w-1/3 border-b border-gray-100">Contact:</td>
                            <td className="py-2 px-1 border-b border-gray-100 text-gray-600">
                                {manager.phone}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Event Performance Metrics */}
            <div className="bg-white rounded-lg shadow p-5 mb-5">
                <h3 className="text-lg font-semibold text-[#6495ed] border-b border-gray-100 pb-2 mb-4">
                    Event Performance Metrics
                </h3>

                {/* Cards */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 bg-white rounded-lg shadow p-4 text-center border border-gray-100">
                        <div className="text-2xl font-bold text-[#6495ed] mb-2">{metrics?.upcoming || 0}</div>
                        <div className="text-sm text-gray-500">Upcoming Events</div>
                    </div>
                    <div className="flex-1 bg-white rounded-lg shadow p-4 text-center border border-gray-100">
                        <div className="text-2xl font-bold text-[#6495ed] mb-2">{metrics?.weekly || 0}</div>
                        <div className="text-sm text-gray-500">This Week's Events</div>
                    </div>
                    <div className="flex-1 bg-white rounded-lg shadow p-4 text-center border border-gray-100">
                        <div className="text-2xl font-bold text-[#6495ed] mb-2">{metrics?.monthly || 0}</div>
                        <div className="text-sm text-gray-500">Monthly Events</div>
                    </div>
                    <div className="flex-1 bg-white rounded-lg shadow p-4 text-center border border-gray-100">
                        <div className="text-2xl font-bold text-[#6495ed] mb-2">
                            ₹{metrics?.totalRevenue?.toLocaleString() || "0.00"}
                        </div>
                        <div className="text-sm text-gray-500">Total Revenue</div>
                    </div>
                </div>

                {/* Breakdown Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse mt-2">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="p-2 font-semibold text-sm">Month</th>
                                <th className="p-2 font-semibold text-sm">Total Events</th>
                                <th className="p-2 font-semibold text-sm">Attendees</th>
                                <th className="p-2 font-semibold text-sm">Avg Attendance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {metrics?.monthly_breakdown?.length > 0 ? (
                                metrics.monthly_breakdown.map((row, index) => (
                                    <tr key={index}>
                                        <td className="p-2 border-b border-gray-100 text-sm">{row.month}</td>
                                        <td className="p-2 border-b border-gray-100 text-sm">{row.total_events}</td>
                                        <td className="p-2 border-b border-gray-100 text-sm">{row.attendees}</td>
                                        <td className="p-2 border-b border-gray-100 text-sm">{row.avg_attendance?.toFixed(1) || 0}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-4 text-center text-gray-500 text-sm">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow p-5 mb-5">
                <h3 className="text-lg font-semibold text-[#6495ed] border-b border-gray-100 pb-2 mb-4">
                    Upcoming Events
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="p-2 font-semibold text-sm">Event ID</th>
                                <th className="p-2 font-semibold text-sm">Event Name</th>
                                <th className="p-2 font-semibold text-sm">Date</th>
                                <th className="p-2 font-semibold text-sm">Location</th>
                                <th className="p-2 font-semibold text-sm">Capacity</th>
                                <th className="p-2 font-semibold text-sm">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map((e) => (
                                    <tr key={e.event_id} className="hover:bg-blue-50 cursor-pointer">
                                        <td className="p-2 border-b border-gray-100 text-sm">#{e.event_id.substring(0, 8)}...</td>
                                        <td className="p-2 border-b border-gray-100 text-sm">{e.event_name}</td>
                                        <td className="p-2 border-b border-gray-100 text-sm">{new Date(e.date).toLocaleDateString()}</td>
                                        <td className="p-2 border-b border-gray-100 text-sm">{e.location}</td>
                                        <td className="p-2 border-b border-gray-100 text-sm">{e.tickets_sold}/{e.total_tickets}</td>
                                        <td className="p-2 border-b border-gray-100 text-sm">
                                            <span className={e.status === 'Available' ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                                                {e.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-4 text-center text-gray-500 text-sm">No upcoming events</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Past Events */}
            <div className="bg-white rounded-lg shadow p-5 mb-5">
                <h3 className="text-lg font-semibold text-[#6495ed] border-b border-gray-100 pb-2 mb-4">
                    Past Events
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="p-2 font-semibold text-sm">Event ID</th>
                                <th className="p-2 font-semibold text-sm">Event Name</th>
                                <th className="p-2 font-semibold text-sm">Date</th>
                                <th className="p-2 font-semibold text-sm">Attendees</th>
                                <th className="p-2 font-semibold text-sm">Satisfaction</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pastEvents.length > 0 ? (
                                pastEvents.map((e) => (
                                    <tr key={e.event_id} className="hover:bg-blue-50 cursor-pointer">
                                        <td className="p-2 border-b border-gray-100 text-sm">#{e.event_id.substring(0, 8)}...</td>
                                        <td className="p-2 border-b border-gray-100 text-sm">{e.event_name}</td>
                                        <td className="p-2 border-b border-gray-100 text-sm">{new Date(e.date).toLocaleDateString()}</td>
                                        <td className="p-2 border-b border-gray-100 text-sm">{e.attendees}</td>
                                        <td className="p-2 border-b border-gray-100 text-sm">N/A</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-4 text-center text-gray-500 text-sm">No past events</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EventManagerDetails;