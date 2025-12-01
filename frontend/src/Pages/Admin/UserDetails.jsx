import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchUserDetails,
    updateUser,
    deleteUser,
    clearUserDetails,
} from "../../store/usersSlice";
import Loader from "./Components/Loader";

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
        onSave({ name, email, phone });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Edit User</h2>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Phone</label>
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
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
            <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow">
                <h3 className="text-lg font-semibold mb-3">Delete User?</h3>
                <p className="text-sm text-gray-700 mb-4">
                    This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded"
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

    console.log("UserDetails Render:", { id, userDetails, loading, error });

    if (loading) {
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

    if (!userDetails) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-700">User not found</h2>
                    <p className="text-gray-500">The user with ID {id} could not be loaded.</p>
                    <button
                        onClick={() => navigate("/admin/users")}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Back to Users
                    </button>
                </div>
            </div>
        );
    }

    const user = userDetails;
    const userCode = `#USR${String(user.id).slice(-3).padStart(3, "0")}`;

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate("/admin/users")}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        ← Back to Users
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setEditOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Edit User
                        </button>
                        <button
                            onClick={() => setDeleteOpen(true)}
                            className="bg-red-600 text-white px-4 py-2 rounded"
                        >
                            Delete User
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white text-3xl font-bold">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold">{user.name}</h2>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-2 font-semibold w-1/3">Name:</td>
                                    <td className="py-2">{user.name}</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2 font-semibold">User ID:</td>
                                    <td className="py-2">{userCode}</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2 font-semibold">Joined Date:</td>
                                    <td className="py-2">
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString()
                                            : "N/A"}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2 font-semibold">Address:</td>
                                    <td className="py-2">{user.address || "Not provided"}</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2 font-semibold">Phone:</td>
                                    <td className="py-2">{user.phone || "Not provided"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

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
