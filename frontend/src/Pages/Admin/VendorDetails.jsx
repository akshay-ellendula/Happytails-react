import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Loader from "./Components/Loader";
import {
    fetchVendorDetails,
    fetchVendorRevenue,
    fetchVendorProducts,
    updateVendor,
    deleteVendor,
    clearSelectedVendor,
} from "../../store/vendorsSlice";
import "./admin-styles.css";

/* ----------------- Edit Modal ----------------- */
const EditModal = ({ isOpen, onClose, vendor, onSave }) => {
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [storeName, setStoreName] = useState("");
    const [storeLocation, setStoreLocation] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (vendor) {
            setName(vendor.name || "");
            setContact(vendor.contact_number || "");
            setStoreName(vendor.store_name || "");
            setStoreLocation(vendor.store_location || "");
        }
    }, [vendor]);

    const validate = () => {
        const e = {};
        if (!name || name.trim().length < 2) e.name = "Enter valid name";
        if (contact && !/^(?:\+91[6-9][0-9]{9}|[6-9][0-9]{9})$/.test(contact)) e.contact = "Enter valid phone";
        if (!storeName) e.storeName = "Store name required";
        if (!storeLocation) e.storeLocation = "Store location required";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        onSave({
            name,
            contact_number: contact,
            store_name: storeName,
            store_location: storeLocation,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Shop Manager</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                        <input
                            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                        />
                        {errors.contact && <p className="text-red-600 text-sm mt-1">{errors.contact}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                        <input
                            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                        />
                        {errors.storeName && <p className="text-red-600 text-sm mt-1">{errors.storeName}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Store Location</label>
                        <input
                            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                            value={storeLocation}
                            onChange={(e) => setStoreLocation(e.target.value)}
                        />
                        {errors.storeLocation && <p className="text-red-600 text-sm mt-1">{errors.storeLocation}</p>}
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
                <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Delete Shop Manager?</h3>
                <p className="text-sm text-gray-600 mb-4 text-center">
                    This action cannot be undone. All vendor data will be permanently deleted.
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

export default function VendorDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        selected: vendor,
        revenue,
        products,
        loadingDetail,
        loadingRevenue,
        loadingProducts,
        error
    } = useSelector((state) => state.vendors);

    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchVendorDetails(id));
        dispatch(fetchVendorRevenue(id));
        dispatch(fetchVendorProducts(id));

        return () => {
            dispatch(clearSelectedVendor());
        };
    }, [dispatch, id]);

    const handleUpdate = async (data) => {
        try {
            await dispatch(updateVendor({ id, data })).unwrap();
            await dispatch(fetchVendorDetails(id)).unwrap();
            alert("Shop Manager updated successfully");
            setEditOpen(false);
        } catch (err) {
            alert(err?.message || "Update failed");
        }
    };

    const handleDelete = async () => {
        try {
            await dispatch(deleteVendor(id)).unwrap();
            alert("Shop Manager deleted");
            navigate("/admin/vendors");
        } catch {
            alert("Failed to delete vendor");
        }
    };

    if (loadingDetail) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
                <Sidebar />
                <div className="flex-1 ml-64">
                    <Header title="Shop Manager Details" />
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
                    <Header title="Shop Manager Details" />
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
                                onClick={() => navigate("/admin/vendors")}
                                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Back to Shop Managers
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
                <Sidebar />
                <div className="flex-1 ml-64">
                    <Header title="Shop Manager Details" />
                    <div className="p-6">
                        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Manager Not Found</h2>
                            <p className="text-gray-600 mb-6">The shop manager could not be found.</p>
                            <button
                                onClick={() => navigate("/admin/vendors")}
                                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Back to Shop Managers
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const vendorCode = `#SM${String(vendor.id || vendor._id || "").slice(-3).padStart(3, "0")}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
            <Sidebar />
            
            <div className="flex-1 ml-64">
                <Header title="Shop Manager Details" />
                
                <main className="p-6">
                    {/* Header with Back Button */}
                    <div className="mb-8">
                        <button
                            onClick={() => navigate("/admin/vendors")}
                            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Shop Managers
                        </button>
                    </div>

                    {/* Vendor Profile Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-6">
                                <div className="h-24 w-24 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                                    {vendor.store_name?.charAt(0)?.toUpperCase() || vendor.name?.charAt(0)?.toUpperCase() || "S"}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{vendor.name}</h2>
                                    <p className="text-gray-600">{vendor.store_name}</p>
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
                            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Shop Manager Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Name</p>
                                        <p className="text-lg font-semibold text-gray-800">{vendor.name}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Manager ID</p>
                                        <p className="text-lg font-semibold text-gray-800">{vendorCode}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Store Name</p>
                                        <p className="text-lg font-semibold text-gray-800">{vendor.store_name}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Store Location</p>
                                        <p className="text-lg font-semibold text-gray-800">{vendor.store_location}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Contact Number</p>
                                        <p className="text-lg font-semibold text-gray-800">{vendor.contact_number}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Status</p>
                                        <p className="text-lg font-semibold text-gray-800">
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                                Active
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Details */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Revenue Details</h3>
                        
                        {loadingRevenue ? (
                            <div className="flex justify-center p-8"><Loader /></div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-l-4 border-green-500">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-sm text-gray-600 uppercase tracking-wider">Today's Revenue</h3>
                                            <p className="text-3xl font-bold text-gray-800 mt-2">
                                                ₹{revenue?.today_revenue?.toFixed(2) || "0.00"}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-xl">
                                            💰
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-blue-500">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-sm text-gray-600 uppercase tracking-wider">Weekly Revenue</h3>
                                            <p className="text-3xl font-bold text-gray-800 mt-2">
                                                ₹{revenue?.weekly_revenue?.toFixed(2) || "0.00"}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                                            📊
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-l-4 border-purple-500">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-sm text-gray-600 uppercase tracking-wider">Monthly Revenue</h3>
                                            <p className="text-3xl font-bold text-gray-800 mt-2">
                                                ₹{revenue?.monthly_revenue?.toFixed(2) || "0.00"}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                                            📈
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border-l-4 border-amber-500">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-sm text-gray-600 uppercase tracking-wider">Quarterly Revenue</h3>
                                            <p className="text-3xl font-bold text-gray-800 mt-2">
                                                ₹{revenue?.quarterly_revenue?.toFixed(2) || "0.00"}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 text-xl">
                                            📅
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Products */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Products</h3>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                                {Array.isArray(products) ? products.length : 0} Products
                            </span>
                        </div>

                        {loadingProducts ? (
                            <div className="flex justify-center p-8"><Loader /></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-3 text-left font-semibold text-gray-700">Product ID</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Name</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Price</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Stock</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(products) && products.length > 0 ? (
                                            products.map((p, i) => (
                                                <tr key={i} className="border-b hover:bg-gray-50">
                                                    <td className="p-3 font-mono text-sm">{p.product_id}</td>
                                                    <td className="p-3 font-semibold">{p.product_name}</td>
                                                    <td className="p-3">₹{p.price}</td>
                                                    <td className="p-3">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${p.stock > 10 ? 'bg-green-100 text-green-800' : p.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                            {p.stock} units
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${p.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-gray-500">
                                                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-gray-600">No products found for this shop manager</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>

                <EditModal
                    isOpen={editOpen}
                    onClose={() => setEditOpen(false)}
                    vendor={vendor}
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