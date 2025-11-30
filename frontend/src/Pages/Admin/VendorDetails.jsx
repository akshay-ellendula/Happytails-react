// frontend/src/Pages/Admin/VendorDetails.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchVendorDetails,
    fetchVendorRevenue,
    fetchVendorProducts,
    updateVendor,
    deleteVendor,
    clearSelectedVendor,
} from "../../store/vendorsSlice";
import Loader from "./Components/Loader";

/* ==========================================================
   EDIT MODAL
========================================================== */
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
            <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Edit Shop Manager</h2>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input className="w-full border p-2 rounded"
                            value={name} onChange={(e) => setName(e.target.value)} />
                        {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Contact Number</label>
                        <input className="w-full border p-2 rounded"
                            value={contact} onChange={(e) => setContact(e.target.value)} />
                        {errors.contact && <p className="text-red-600 text-sm">{errors.contact}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Store Name</label>
                        <input className="w-full border p-2 rounded"
                            value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                        {errors.storeName && <p className="text-red-600 text-sm">{errors.storeName}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Store Location</label>
                        <input className="w-full border p-2 rounded"
                            value={storeLocation} onChange={(e) => setStoreLocation(e.target.value)} />
                        {errors.storeLocation && <p className="text-red-600 text-sm">{errors.storeLocation}</p>}
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button className="px-4 py-2 bg-gray-300 rounded"
                        onClick={onClose}>
                        Cancel
                    </button>

                    <button className="px-4 py-2 bg-blue-600 text-white rounded"
                        onClick={handleSave}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ==========================================================
   DELETE MODAL
========================================================== */
const DeleteModal = ({ isOpen, onClose, onDelete }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow">
                <h3 className="text-lg font-semibold mb-3">Delete Shop Manager?</h3>
                <p className="text-sm text-gray-700 mb-4">This action cannot be undone.</p>

                <div className="flex justify-end gap-3">
                    <button className="px-4 py-2 bg-gray-300 rounded"
                        onClick={onClose}>
                        Cancel
                    </button>

                    <button className="px-4 py-2 bg-red-600 text-white rounded"
                        onClick={onDelete}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ==========================================================
   MAIN COMPONENT
========================================================== */
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
            await dispatch(fetchVendorDetails(id)).unwrap(); // Refresh details
            alert("Vendor updated successfully");
            setEditOpen(false);
        } catch (err) {
            alert(err?.message || "Update failed");
        }
    };

    const handleDelete = async () => {
        try {
            await dispatch(deleteVendor(id)).unwrap();
            alert("Vendor deleted");
            navigate("/admin/vendors");
        } catch {
            alert("Failed to delete vendor");
        }
    };

    if (loadingDetail) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-500">
                Error: {error}
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-700">Vendor not found</h2>
                    <button
                        onClick={() => navigate("/admin/vendors")}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Back to Vendors
                    </button>
                </div>
            </div>
        );
    }

    const vendorCode = `#SM${String(vendor.id || vendor._id || "").slice(-3).padStart(3, "0")}`;

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-6">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate("/admin/vendors")}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        ← Back to Shop Managers
                    </button>

                    <div className="flex gap-3">
                        <button onClick={() => setEditOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded">Edit</button>
                        <button onClick={() => setDeleteOpen(true)} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
                    </div>
                </div>

                {/* Vendor Card */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">

                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                            {vendor.store_name?.charAt(0)?.toUpperCase() || vendor.name?.charAt(0)?.toUpperCase() || "S"}
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold">{vendor.name}</h2>
                            <p className="text-sm text-gray-500">{vendor.store_name}</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Shop Manager Information</h3>
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b"><td className="py-2 font-semibold w-1/3">Name</td><td className="py-2">{vendor.name}</td></tr>
                                <tr className="border-b"><td className="py-2 font-semibold">Manager ID</td><td className="py-2">{vendorCode}</td></tr>
                                <tr className="border-b"><td className="py-2 font-semibold">Store Name</td><td className="py-2">{vendor.store_name}</td></tr>
                                <tr className="border-b"><td className="py-2 font-semibold">Store Location</td><td className="py-2">{vendor.store_location}</td></tr>
                                <tr className="border-b"><td className="py-2 font-semibold">Contact</td><td className="py-2">{vendor.contact_number}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Revenue */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-3">Revenue Details</h3>

                    {loadingRevenue ? (
                        <div className="flex justify-center p-4"><Loader /></div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                            <div className="p-4 border rounded">
                                <p className="text-sm text-gray-500">Today's Revenue</p>
                                <p className="text-xl font-semibold">${revenue?.today_revenue?.toFixed(2) || "0.00"}</p>
                            </div>

                            <div className="p-4 border rounded">
                                <p className="text-sm text-gray-500">Weekly Revenue</p>
                                <p className="text-xl font-semibold">${revenue?.weekly_revenue?.toFixed(2) || "0.00"}</p>
                            </div>

                            <div className="p-4 border rounded">
                                <p className="text-sm text-gray-500">Monthly Revenue</p>
                                <p className="text-xl font-semibold">${revenue?.monthly_revenue?.toFixed(2) || "0.00"}</p>
                            </div>

                            <div className="p-4 border rounded">
                                <p className="text-sm text-gray-500">Quarterly Revenue</p>
                                <p className="text-xl font-semibold">${revenue?.quarterly_revenue?.toFixed(2) || "0.00"}</p>
                            </div>

                        </div>
                    )}
                </div>

                {/* Products */}
                <div className="bg-white rounded-lg shadow p-6 mb-12">
                    <h3 className="text-lg font-semibold mb-3">Products</h3>

                    {loadingProducts ? (
                        <div className="flex justify-center p-4"><Loader /></div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 text-left">Product ID</th>
                                    <th className="p-2 text-left">Name</th>
                                    <th className="p-2 text-left">Price</th>
                                    <th className="p-2 text-left">Stock</th>
                                </tr>
                            </thead>

                            <tbody>
                                {Array.isArray(products) && products.length > 0 ? (
                                    products.map((p, i) => (
                                        <tr key={i} className="border-b hover:bg-gray-50">
                                            <td className="p-2">{p._id || p.id}</td>
                                            <td className="p-2">{p.name}</td>
                                            <td className="p-2">${p.price}</td>
                                            <td className="p-2">{p.stock}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td className="p-3 text-gray-600 text-center" colSpan="4">No products found</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

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
