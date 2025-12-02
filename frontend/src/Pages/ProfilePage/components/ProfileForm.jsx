import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { axiosInstance } from "../../../utils/axios";

export default function ProfileForm() {
  const [editMode, setEditMode] = useState(false);
  const { user, updateUser } = useAuth();

  // MODIFIED: Initialize state with defaults again.
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    profilePic: "/icons/profile-circle-svgrepo-com.svg",
    houseNumber: "",
    streetNo: "",
    city: "",
    pincode: "",
  });

  const [newImageFile, setNewImageFile] = useState(null);

  // ADDED THIS EFFECT: This syncs the component's state
  // with the user context whenever the user object changes (e.g., after login).
  useEffect(() => {
    console.log("ProfileForm render: user =", user);
    if (user) {
      setProfile({
        name: user.userName,
        email: user.email,
        phone: user.phoneNumber || "",
        profilePic: user.profilePic || "/icons/profile-circle-svgrepo-com.svg",
        houseNumber: user.address?.houseNumber || "",
        streetNo: user.address?.streetNo || "",
        city: user.address?.city || "",
        pincode: user.address?.pincode || "",
      });
    }
  }, [user]); // This effect runs when the component mounts AND when 'user' changes.

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
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

  // Check if any field changed
  const hasChanges = () => {
    return (
      profile.name !== (user.userName || "") ||
      profile.email !== (user.email || "") ||
      profile.phone !== (user.phoneNumber || "") ||
      profile.houseNumber !== (user.address?.houseNumber || "") ||
      profile.streetNo !== (user.address?.streetNo || "") ||
      profile.city !== (user.address?.city || "") ||
      profile.pincode !== (user.address?.pincode || "") ||
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
      formData.append("houseNumber", profile.houseNumber);
      formData.append("streetNo", profile.streetNo);
      formData.append("city", profile.city);
      formData.append("pincode", profile.pincode);
      if (newImageFile) {
        formData.append("profilePic", newImageFile);
      }

      // Let axios set Content-Type with boundary for multipart
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
    // This logic is still correct for resetting changes.
    if (user) {
      setProfile({
        name: user.userName || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
        profilePic: user.profilePic || "/icons/profile-circle-svgrepo-com.svg",
        houseNumber: user.address?.houseNumber || "",
        streetNo: user.address?.streetNo || "",
        city: user.address?.city || "",
        pincode: user.address?.pincode || "",
      });
    }
  };

  return (
    <>
      {/* Profile Picture */}
      <div className="mb-12">
        <div
          className={`relative w-32 h-32 group ${
            editMode ? "cursor-pointer" : ""
          }`}
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

      {/* Profile Fields */}
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

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <InputField
          label="Phone"
          name="phone"
          value={profile.phone}
          editMode={editMode}
          onChange={handleChange}
        />
        <InputField
          label="House Number"
          name="houseNumber"
          value={profile.houseNumber}
          editMode={editMode}
          onChange={handleChange}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <InputField
          label="Street / Area"
          name="streetNo"
          value={profile.streetNo}
          editMode={editMode}
          onChange={handleChange}
        />
        <InputField
          label="City"
          name="city"
          value={profile.city}
          editMode={editMode}
          onChange={handleChange}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <InputField
          label="Pincode"
          name="pincode"
          value={profile.pincode}
          editMode={editMode}
          onChange={handleChange}
        />
      </div>

      {/* Buttons: Edit outside, Save/Cancel inside form */}
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
          <form onSubmit={handleSave} className="flex gap-4">
            <button
              type="submit"
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
          </form>
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
          className={`w-full px-4 py-3 border-2 rounded-lg bg-primary/20 text-dark text-lg font-medium focus:outline-none focus:ring-2 ${
            readOnly
              ? "border-gray-300 bg-gray-100 cursor-not-allowed"
              : "border-dark focus:ring-dark"
          }`}
        />
      )}
    </div>
  );
}
