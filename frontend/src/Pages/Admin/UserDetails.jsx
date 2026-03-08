import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Loader from "./Components/Loader";
import {
    fetchUserDetails,
    updateUser,
    deleteUser,
    clearUserDetails,
} from "../../store/usersSlice";
import "./admin-styles.css";

/* ----------------- Edit Modal ----------------- */
const EditModal = ({ isOpen, onClose, user, onSave }) => {
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "");

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone || "");
        }
    }, [user]);

    const handleSave = () => {
        onSave({
            userName: name,
            phoneNumber: phone,
            name,
            email,
            phone
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Edit User</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
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
                <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Delete User?</h3>
                <p className="text-sm text-gray-600 mb-4 text-center">
                    This action cannot be undone. All user data will be permanently deleted.
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

export default function UserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userDetails, loading, error } = useSelector((state) => state.users);

    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchUserDetails(id));

        return () => {
            dispatch(clearUserDetails());
        };
    }, [dispatch, id]);

    const handleUpdate = async (data) => {
        await dispatch(updateUser({ id, data }));
        setEditOpen(false);
    };

    const handleDelete = async () => {
        await dispatch(deleteUser(id));
        setDeleteOpen(false);
        navigate("/admin/users");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
                <Sidebar />
                <div className="flex-1 ml-64">
                    <Header title="User Details" />
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
                    <Header title="User Details" />
                    <div className="p-6">
                        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading User</h2>
                            <p className="text-gray-600 mb-6">Error: {error}</p>
                            <button
                                onClick={() => navigate("/admin/users")}
                                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Back to Users
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!userDetails) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
                <Sidebar />
                <div className="flex-1 ml-64">
                    <Header title="User Details" />
                    <div className="p-6">
                        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">User Not Found</h2>
                            <p className="text-gray-600 mb-6">The user with ID {id} could not be loaded.</p>
                            <button
                                onClick={() => navigate("/admin/users")}
                                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Back to Users
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const user = userDetails;
    const userCode = `#USR${String(user.id).slice(-3).padStart(3, "0")}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
            <Sidebar />

            <div className="flex-1 ml-64">
                <Header title="User Details" />

                <main className="p-6">
                    {/* Header with Back Button */}
                    <div className="mb-8">
                        <button
                            onClick={() => navigate("/admin/users")}
                            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Users
                        </button>
                    </div>

                    {/* User Profile Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-6">
                                <div className="h-24 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{user.name}</h2>
                                    <p className="text-gray-600">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditOpen(true)}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Edit User
                                </button>
                                <button
                                    onClick={() => setDeleteOpen(true)}
                                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Delete User
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
                                        <p className="text-lg font-semibold text-gray-800">{user.name}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">User ID</p>
                                        <p className="text-lg font-semibold text-gray-800">{userCode}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Email</p>
                                        <p className="text-lg font-semibold text-gray-800">{user.email}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Phone</p>
                                        <p className="text-lg font-semibold text-gray-800">{user.phone || "Not provided"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Stats */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">User Activity</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-l-4 border-yellow-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-sm text-gray-600 uppercase tracking-wider">Total Orders</h3>
                                        <p className="text-3xl font-bold text-gray-800 mt-2">{user.orders?.length || 0}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl">
                                        🛒
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-blue-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-sm text-gray-600 uppercase tracking-wider">Events Attended</h3>
                                        <p className="text-3xl font-bold text-gray-800 mt-2">{user.events?.length || 0}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                                        🎫
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-l-4 border-green-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-sm text-gray-600 uppercase tracking-wider">Total Spent</h3>
                                        <p className="text-3xl font-bold text-gray-800 mt-2">
                                            {/* Calculate total spent from orders (parsing the price string) */}
                                            {(() => {
                                                const total = (user.orders || []).reduce((acc, order) => {
                                                    const price = parseFloat(order.price.replace(/[^0-9.-]+/g, ""));
                                                    return acc + (isNaN(price) ? 0 : price);
                                                }, 0);
                                                return `$${total.toFixed(2)}`;
                                            })()}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-xl">
                                        💰
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Order History</h3>
                        {user.orders && user.orders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-sm text-gray-500 border-b border-gray-200">
                                            <th className="py-3 px-4">Product</th>
                                            <th className="py-3 px-4">Date</th>
                                            <th className="py-3 px-4">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-700">
                                        {user.orders.map((order, index) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 font-medium">{order.productName}</td>
                                                <td className="py-3 px-4">{order.purchaseDate}</td>
                                                <td className="py-3 px-4">{order.price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No recent orders.</p>
                        )}
                    </div>

                    {/* Events Table */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Events Participated</h3>
                        {user.events && user.events.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-sm text-gray-500 border-b border-gray-200">
                                            <th className="py-3 px-4">Event</th>
                                            <th className="py-3 px-4">Location</th>
                                            <th className="py-3 px-4">Date</th>
                                            <th className="py-3 px-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-700">
                                        {user.events.map((event, index) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 font-medium">{event.eventName}</td>
                                                <td className="py-3 px-4">{event.location}</td>
                                                <td className="py-3 px-4">{event.date}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                                        ${event.status === 'Attended' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
                                                    `}>
                                                        {event.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No events participated.</p>
                        )}
                    </div>
                </main>

                <EditModal
                    isOpen={editOpen}
                    onClose={() => setEditOpen(false)}
                    user={user}
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