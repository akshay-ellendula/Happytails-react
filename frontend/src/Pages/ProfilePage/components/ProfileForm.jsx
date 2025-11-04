import React, { useState } from "react";

export default function ProfileForm() {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "",
    address: "",
    profilePic: "/icons/profile-circle-svgrepo-com.svg",
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () =>
        setProfile({ ...profile, profilePic: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (profile.phone && !/^[6-9]\d{9}$/.test(profile.phone)) {
      alert("Please enter a valid 10-digit Indian phone number.");
      return;
    }

    // Example backend call
    console.log("Profile updated:", profile);
    alert("Profile updated successfully!");
    setEditMode(false);
  };

  return (
    <form onSubmit={handleSave}>
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
        <p className="text-sm text-gray-600 mt-3">Click to change profile picture</p>
      </div>

      {/* Profile Fields */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <InputField label="Name" name="name" value={profile.name} editMode={editMode} onChange={handleChange} />
        <InputField label="Email" name="email" value={profile.email} editMode={false} readOnly />
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <InputField label="Phone" name="phone" value={profile.phone} editMode={editMode} onChange={handleChange} />
        <InputField label="Address" name="address" value={profile.address} editMode={editMode} onChange={handleChange} />
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        {!editMode ? (
          <button
            type="button"
            onClick={() => setEditMode(true)}
            className="bg-dark text-primary px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              type="submit"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </form>
  );
}

function InputField({ label, name, value, onChange, editMode, readOnly = false }) {
  return (
    <div>
      <label className="block text-dark text-base font-medium mb-2">{label}:</label>
      {!editMode ? (
        <span className="block text-dark text-xl font-bold">
          {value || `Enter ${label}`}
        </span>
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          className={`w-full px-4 py-3 border-2 rounded-lg bg-primary/20 text-dark text-lg font-medium focus:outline-none focus:ring-2 ${
            readOnly ? "border-gray-300 bg-gray-100 cursor-not-allowed" : "border-dark focus:ring-dark"
          }`}
        />
      )}
    </div>
  );
}
