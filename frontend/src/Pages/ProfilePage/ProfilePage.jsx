import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { axiosInstance } from "../../utils/axios";

export default function ProfileForm() {
  const [editMode, setEditMode] = useState(false);
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    profilePic: "/icons/profile-circle-svgrepo-com.svg",
    addresses: [],
  });

  const [newImageFile, setNewImageFile] = useState(null);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [newAddress, setNewAddress] = useState({
    houseNumber: "",
    streetNo: "",
    city: "",
    pincode: "",
    isDefault: false,
  });

  useEffect(() => {
    console.log("ProfileForm render: user =", user);
    if (user) {
      setProfile({
        name: user.userName || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
        profilePic: user.profilePic || "/icons/profile-circle-svgrepo-com.svg",
        addresses: user.addresses || [],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onload = () =>
        setProfile({ ...profile, profilePic: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const saveAddress = () => {
    let updatedAddresses = [...profile.addresses];
    if (editingAddressIndex !== null) {
      updatedAddresses[editingAddressIndex] = newAddress;
    } else {
      updatedAddresses.push(newAddress);
    }

    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map((addr, idx) => ({
        ...addr,
        isDefault: idx === (editingAddressIndex ?? updatedAddresses.length - 1),
      }));
    }

    setProfile({ ...profile, addresses: updatedAddresses });
    resetAddressForm();
  };

  const deleteAddress = (index) => {
    const updatedAddresses = profile.addresses.filter((_, i) => i !== index);
    setProfile({ ...profile, addresses: updatedAddresses });
  };

  const editAddress = (index) => {
    setEditingAddressIndex(index);
    setNewAddress(profile.addresses[index]);
  };

  const resetAddressForm = () => {
    setEditingAddressIndex(null);
    setNewAddress({
      houseNumber: "",
      streetNo: "",
      city: "",
      pincode: "",
      isDefault: false,
    });
  };

  const hasChanges = () => {
    return (
      profile.name !== (user.userName || "") ||
      profile.email !== (user.email || "") ||
      profile.phone !== (user.phoneNumber || "") ||
      JSON.stringify(profile.addresses) !== JSON.stringify(user.addresses || []) ||
      newImageFile !== null
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!hasChanges()) {
      alert("No changes to save.");
      setEditMode(false);
      setNewImageFile(null);
      return;
    }

    if (profile.phone && !/^[6-9]\d{9}$/.test(profile.phone)) {
      alert("Please enter a valid 10-digit Indian phone number.");
      return;
    }

    const customerId = user?.customerId || user?._id || user?.id;
    if (!user || !customerId) {
      console.warn("ProfileForm: Missing user or customerId", user);
      alert("Could not find user ID. Please log in again.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userName", profile.name);
      formData.append("email", profile.email);
      formData.append("phoneNumber", profile.phone);
      formData.append("addresses", JSON.stringify(profile.addresses));
      if (newImageFile) {
        formData.append("profilePic", newImageFile);
      }

      const response = await axiosInstance.put(
        `/public/${customerId}`,
        formData
      );

      if (response.data.success) {
        alert("Profile updated successfully!");
        updateUser(response.data.user);
        setEditMode(false);
        setNewImageFile(null);
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert(
        "An error occurred: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setNewImageFile(null);
    resetAddressForm();
    if (user) {
      setProfile({
        name: user.userName || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
        profilePic: user.profilePic || "/icons/profile-circle-svgrepo-com.svg",
        addresses: user.addresses || [],
      });
    }
  };

  return (
    <>
      {/* Profile Picture */}
      <div className="mb-12">
        <div
          className={`relative w-32 h-32 group ${editMode ? "cursor-pointer" : ""}`}
        >
          <div className="w-32 h-32 rounded-full border-4 border-dark overflow-hidden">
            <img
              src={profile.profilePic}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          {editMode && (
            <>
              <div className="absolute inset-0 flex items-center justify-center bg-dark/50 rounded-full border-4 border-dashed border-dark">
                <svg
                  className="w-12 h-12 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </>
          )}
        </div>
        {editMode && (
          <p className="text-sm text-gray-600 mt-3">
            Click to change profile picture
          </p>
        )}
      </div>

      {/* Name and Email */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <InputField
          label="Name"
          name="name"
          value={profile.name}
          editMode={editMode}
          onChange={handleChange}
        />
        <InputField
          label="Email"
          name="email"
          value={profile.email}
          editMode={editMode}
          onChange={handleChange}
        />
      </div>

      {/* Phone */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <InputField
          label="Phone"
          name="phone"
          value={profile.phone}
          editMode={editMode}
          onChange={handleChange}
        />
      </div>

      {/* Addresses Section */}
      <div className="mb-12">
        <label className="block text-dark text-base font-medium mb-2">
          Addresses:
        </label>

        {profile.addresses.map((addr, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <p>
              {addr.houseNumber}, {addr.streetNo}, {addr.city}, {addr.pincode}
              {addr.isDefault && " (Default)"}
            </p>
            {editMode && (
              <div className="mt-2 space-x-4">
                <button
                  type="button"
                  onClick={() => editAddress(index)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteAddress(index)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}

        {editMode && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">
              {editingAddressIndex !== null ? "Edit Address" : "Add New Address"}
            </h4>
            <InputField
              label="House Number"
              name="houseNumber"
              value={newAddress.houseNumber}
              editMode={true}
              onChange={handleAddressChange}
            />
            <InputField
              label="Street / Area"
              name="streetNo"
              value={newAddress.streetNo}
              editMode={true}
              onChange={handleAddressChange}
            />
            <InputField
              label="City"
              name="city"
              value={newAddress.city}
              editMode={true}
              onChange={handleAddressChange}
            />
            <InputField
              label="Pincode"
              name="pincode"
              value={newAddress.pincode}
              editMode={true}
              onChange={handleAddressChange}
            />
            <label className="flex items-center mt-3">
              <input
                type="checkbox"
                checked={newAddress.isDefault}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, isDefault: e.target.checked })
                }
                className="mr-2"
              />
              Set as Default
            </label>
            <div className="mt-4 space-x-4">
              <button
                type="button"
                onClick={saveAddress}
                className="bg-green-600 text-white px-6 py-2 rounded"
              >
                {editingAddressIndex !== null ? "Update" : "Add"} Address
              </button>
              {editingAddressIndex !== null && (
                <button
                  type="button"
                  onClick={resetAddressForm}
                  className="bg-gray-500 text-white px-6 py-2 rounded"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        {!editMode ? (
          <button
            type="button"
            onClick={() => setEditMode(true)}
            className="bg-dark bg-black text-white text-primary px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSave}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  editMode,
  readOnly = false,
}) {
  return (
    <div>
      <label className="block text-dark text-base font-medium mb-2">
        {label}:
      </label>
      {!editMode ? (
        <span className="block text-dark text-xl font-bold">
          {value || `Enter ${label}`}
        </span>
      ) : (
        <input
          type={name === "phone" || name === "pincode" ? "tel" : "text"}
          name={name}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          className={`w-full px-4 py-3 border-2 rounded-lg bg-primary/20 text-dark text-lg font-medium focus:outline-none focus:ring-2 focus:ring-dark focus:ring-opacity-50 transition-all placeholder-gray-400 ${
            readOnly ? "cursor-not-allowed bg-gray-100" : ""
          }`}
        />
      )}
    </div>
  );
}