import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Loader from "./Components/Loader";
import {
    fetchEventManagerDetails,
    fetchEventManagerMetrics,
    fetchUpcomingEvents,
    fetchPastEvents,
    updateEventManager,
    deleteEventManager,
    clearSelectedEventManager,
} from "../../store/eventManagersSlice";
import "./admin-styles.css";

/* ----------------- Edit Modal ----------------- */
const EditModal = ({ isOpen, onClose, manager, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        organization: "",
        phone: "",
        profilePic: null,
    });

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

    const handleSave = () => {
        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("organization", formData.organization);
        data.append("phone", formData.phone);
        if (formData.profilePic) data.append("profilePic", formData.profilePic);
        
        onSave({ id: manager.id, formData: data });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Event Manager</h2>

                <div className="space-y-4">
                    <div className="flex justify-center mb-4">
                        <label htmlFor="profilePic" className="cursor-pointer relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                                <img
                                    src={
                                        formData.profilePic
                                            ? URL.createObjectURL(formData.profilePic)
                                            : (manager.profilePic || manager.profile_pic || manager.image)?.startsWith("data:")
                                                ? (manager.profilePic || manager.profile_pic || manager.image)
                                                : (manager.profilePic || manager.profile_pic || manager.image)?.startsWith("http")
                                                    ? (manager.profilePic || manager.profile_pic || manager.image)
                                                    : (manager.profilePic || manager.profile_pic || manager.image)
                                                        ? `data:image/jpeg;base64,${manager.profilePic || manager.profile_pic || manager.image}`
                                                        : "https://via.placeholder.com/150"
                                    }
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">
                                Change Photo
                            </div>
                            <input
                                type="file"
                                id="profilePic"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                    setFormData({ ...formData, profilePic: e.target.files[0] })
                                }
                            />
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                            required
                            minLength={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                        <input
                            type="text"
                            value={formData.organization}
                            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                            required
                            minLength={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                            required
                            pattern="^\+91[6-9][0-9]{9}$"
                            title="Enter valid Indian mobile number (+91XXXXXXXXXX)"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-all duration-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ----------------- Delete Modal ----------------- */
const DeleteModal = ({ isOpen, onClose, onDelete }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.196 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Delete Event Manager?</h3>
                <p className="text-sm text-gray-600 mb-4 text-center">
                    This will delete the manager and ALL their events & tickets. This action cannot be undone!
                </p>

                <div className="flex justify-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-all duration-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onDelete}
                        className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function EventManagerDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        selected: manager,
        metrics,
        upcomingEvents,
        pastEvents,
        loadingDetail,
        error,
    } = useSelector((state) => state.eventManagers);

    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

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

    const handleUpdate = async ({ id, formData }) => {
        const resultAction = await dispatch(updateEventManager({ id, formData }));
        if (updateEventManager.fulfilled.match(resultAction)) {
            alert("Event Manager updated successfully");
            setEditOpen(false);
            dispatch(fetchEventManagerDetails(id));
        } else {
            alert(resultAction.payload || "Update failed");
        }
    };

    const handleDelete = async () => {
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
                <Sidebar />
                <div className="flex-1 ml-64">
                    <Header title="Event Manager Details" />
                    <div className="p-6">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <Loader />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
                <Sidebar />
                <div className="flex-1 ml-64">
                    <Header title="Event Manager Details" />
                    <div className="p-6">
                        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Manager</h2>
                            <p className="text-gray-600 mb-6">Error: {error}</p>
                            <button
                                onClick={() => navigate("/admin/event-managers")}
                                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Back to Managers
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!manager) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
                <Sidebar />
                <div className="flex-1 ml-64">
                    <Header title="Event Manager Details" />
                    <div className="p-6">
                        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Manager Not Found</h2>
                            <p className="text-gray-600 mb-6">The event manager could not be found.</p>
                            <button
                                onClick={() => navigate("/admin/event-managers")}
                                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Back to Managers
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const managerCode = `#EM${String(manager.id).slice(-3).padStart(3, "0")}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
            <Sidebar />
            
            <div className="flex-1 ml-64">
                <Header title="Event Manager Details" />
                
                <main className="p-6">
                    {/* Header with Back Button */}
                    <div className="mb-8">
                        <button
                            onClick={() => navigate("/admin/event-managers")}
                            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Managers
                        </button>
                    </div>

                    {/* Manager Profile Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-6">
                                {manager.profilePic || manager.profile_pic || manager.image ? (
                                    <img
                                        src={
                                            (manager.profilePic || manager.profile_pic || manager.image).startsWith("data:")
                                                ? (manager.profilePic || manager.profile_pic || manager.image)
                                                : (manager.profilePic || manager.profile_pic || manager.image).startsWith("http")
                                                    ? (manager.profilePic || manager.profile_pic || manager.image)
                                                    : `data:image/jpeg;base64,${manager.profilePic || manager.profile_pic || manager.image}`
                                        }
                                        alt={manager.name}
                                        className="h-24 w-24 rounded-full object-cover shadow-lg"
                                    />
                                ) : (
                                    <div className="h-24 w-24 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                                        {manager.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{manager.name}</h2>
                                    <p className="text-gray-600">{manager.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditOpen(true)}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Edit Manager
                                </button>
                                <button
                                    onClick={() => setDeleteOpen(true)}
                                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Delete Manager
                                </button>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="mt-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Name</p>
                                        <p className="text-lg font-semibold text-gray-800">{manager.name}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Manager ID</p>
                                        <p className="text-lg font-semibold text-gray-800">{managerCode}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Joined Date</p>
                                        <p className="text-lg font-semibold text-gray-800">
                                            {new Date(manager.joined_date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Organization</p>
                                        <p className="text-lg font-semibold text-gray-800">{manager.organization}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Email</p>
                                        <p className="text-lg font-semibold text-gray-800">{manager.email}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Contact</p>
                                        <p className="text-lg font-semibold text-gray-800">{manager.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Performance Metrics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border-l-4 border-amber-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-sm text-gray-600 uppercase tracking-wider">Upcoming Events</h3>
                                        <p className="text-3xl font-bold text-gray-800 mt-2">{metrics?.upcoming || 0}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 text-xl">
                                        📅
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-blue-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-sm text-gray-600 uppercase tracking-wider">Weekly Events</h3>
                                        <p className="text-3xl font-bold text-gray-800 mt-2">{metrics?.weekly || 0}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                                        📊
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-l-4 border-green-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-sm text-gray-600 uppercase tracking-wider">Monthly Events</h3>
                                        <p className="text-3xl font-bold text-gray-800 mt-2">{metrics?.monthly || 0}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-xl">
                                        📈
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-l-4 border-purple-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-sm text-gray-600 uppercase tracking-wider">Total Revenue</h3>
                                        <p className="text-3xl font-bold text-gray-800 mt-2">
                                            ₹{metrics?.totalRevenue?.toLocaleString() || "0"}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                                        💰
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Breakdown */}
                        <div className="overflow-x-auto">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Monthly Breakdown</h4>
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 text-left font-semibold text-gray-700">Month</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Total Events</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Attendees</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Avg Attendance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics?.monthly_breakdown?.length > 0 ? (
                                        metrics.monthly_breakdown.map((row, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="p-3">{row.month}</td>
                                                <td className="p-3 font-semibold">{row.total_events}</td>
                                                <td className="p-3">{row.attendees}</td>
                                                <td className="p-3">{row.avg_attendance?.toFixed(1) || 0}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="p-4 text-center text-gray-500">
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Upcoming Events</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 text-left font-semibold text-gray-700">Event ID</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Event Name</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Date</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Location</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Capacity</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingEvents.length > 0 ? (
                                        upcomingEvents.map((e) => (
                                            <tr key={e.event_id} className="border-b hover:bg-blue-50">
                                                <td className="p-3 font-mono text-sm">#{e.event_id.substring(0, 8)}...</td>
                                                <td className="p-3 font-semibold">{e.event_name}</td>
                                                <td className="p-3">{new Date(e.date).toLocaleDateString()}</td>
                                                <td className="p-3">{e.location}</td>
                                                <td className="p-3">{e.tickets_sold}/{e.total_tickets}</td>
                                                <td className="p-3">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${e.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {e.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="p-4 text-center text-gray-500">
                                                No upcoming events
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Past Events */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Past Events</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 text-left font-semibold text-gray-700">Event ID</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Event Name</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Date</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Attendees</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Satisfaction</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pastEvents.length > 0 ? (
                                        pastEvents.map((e) => (
                                            <tr key={e.event_id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-mono text-sm">#{e.event_id.substring(0, 8)}...</td>
                                                <td className="p-3 font-semibold">{e.event_name}</td>
                                                <td className="p-3">{new Date(e.date).toLocaleDateString()}</td>
                                                <td className="p-3">{e.attendees}</td>
                                                <td className="p-3">
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                                                        N/A
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-4 text-center text-gray-500">
                                                No past events
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>

                <EditModal
                    isOpen={editOpen}
                    onClose={() => setEditOpen(false)}
                    manager={manager}
                    onSave={handleUpdate}
                />
                <DeleteModal
                    isOpen={deleteOpen}
                    onClose={() => setDeleteOpen(false)}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
}
