import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { axiosInstance } from "../../utils/axios";

export default function ProfilePage() {
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
    name: "",
    houseNumber: "",
    streetNo: "",
    city: "",
    pincode: "",
    isDefault: false,
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("ProfilePage render: user =", user);
    console.log("User addresses:", user?.addresses);
    
    if (user) {
      // Ensure addresses have names - if not, add default names
      const formattedAddresses = (user.addresses || []).map((addr, index) => ({
        name: addr.name || `Address ${index + 1}`,
        houseNumber: addr.houseNumber || "",
        streetNo: addr.streetNo || "",
        city: addr.city || "",
        pincode: addr.pincode || "",
        isDefault: addr.isDefault || false,
      }));

      setProfile({
        name: user.userName || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
        profilePic: user.profilePic || "/icons/profile-circle-svgrepo-com.svg",
        addresses: formattedAddresses,
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
    // Validate required fields
    const addressName = newAddress.name.trim() || 
                       (editingAddressIndex !== null ? 
                        profile.addresses[editingAddressIndex]?.name : 
                        `Address ${profile.addresses.length + 1}`);
    
    if (!newAddress.houseNumber.trim() || !newAddress.streetNo.trim() || 
        !newAddress.city.trim() || !newAddress.pincode.trim()) {
      alert("Please fill in all address fields");
      return;
    }

    let updatedAddresses = [...profile.addresses];
    const addressToSave = {
      ...newAddress,
      name: addressName, // Ensure name is always set
    };

    if (editingAddressIndex !== null) {
      updatedAddresses[editingAddressIndex] = addressToSave;
    } else {
      updatedAddresses.push(addressToSave);
    }

    // Handle default address logic
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map((addr, idx) => ({
        ...addr,
        isDefault: idx === (editingAddressIndex ?? updatedAddresses.length - 1),
      }));
    }

    console.log("Saving addresses:", updatedAddresses);
    setProfile({ ...profile, addresses: updatedAddresses });
    resetAddressForm();
  };

  const deleteAddress = (index) => {
    const updatedAddresses = profile.addresses.filter((_, i) => i !== index);
    setProfile({ ...profile, addresses: updatedAddresses });
  };

  const editAddress = (index) => {
    const address = profile.addresses[index];
    setEditingAddressIndex(index);
    setNewAddress({
      name: address.name || "",
      houseNumber: address.houseNumber || "",
      streetNo: address.streetNo || "",
      city: address.city || "",
      pincode: address.pincode || "",
      isDefault: address.isDefault || false,
    });
    setShowAddressForm(true);
  };

  const resetAddressForm = () => {
    setEditingAddressIndex(null);
    setNewAddress({
      name: "",
      houseNumber: "",
      streetNo: "",
      city: "",
      pincode: "",
      isDefault: false,
    });
    setShowAddressForm(false);
  };

  const handleAddNewAddress = () => {
    setEditingAddressIndex(null);
    // Suggest a default name based on existing addresses
    const addressCount = profile.addresses.length;
    const defaultNames = ["Home", "Office", "Work", "Parents", "Other"];
    const suggestedName = addressCount < defaultNames.length 
      ? defaultNames[addressCount] 
      : `Address ${addressCount + 1}`;
    
    setNewAddress({
      name: suggestedName,
      houseNumber: "",
      streetNo: "",
      city: "",
      pincode: "",
      isDefault: false,
    });
    setShowAddressForm(true);
  };

  const hasChanges = () => {
    const userAddresses = user?.addresses || [];
    
    // Compare addresses with proper field checking
    const addressesChanged = !arraysEqual(profile.addresses, userAddresses);
    
    return (
      profile.name !== (user?.userName || "") ||
      profile.email !== (user?.email || "") ||
      profile.phone !== (user?.phoneNumber || "") ||
      addressesChanged ||
      newImageFile !== null
    );
  };

  // Helper function to compare address arrays
  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    
    return a.every((addrA, index) => {
      const addrB = b[index];
      return (
        (addrA.name || "") === (addrB?.name || "") &&
        (addrA.houseNumber || "") === (addrB?.houseNumber || "") &&
        (addrA.streetNo || "") === (addrB?.streetNo || "") &&
        (addrA.city || "") === (addrB?.city || "") &&
        (addrA.pincode || "") === (addrB?.pincode || "") &&
        (addrA.isDefault || false) === (addrB?.isDefault || false)
      );
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!hasChanges()) {
      alert("No changes to save.");
      setEditMode(false);
      setNewImageFile(null);
      setShowAddressForm(false);
      setLoading(false);
      return;
    }

    if (profile.phone && !/^[6-9]\d{9}$/.test(profile.phone)) {
      alert("Please enter a valid 10-digit Indian phone number.");
      setLoading(false);
      return;
    }

    const customerId = user?.customerId || user?._id || user?.id;
    if (!user || !customerId) {
      console.warn("ProfilePage: Missing user or customerId", user);
      alert("Could not find user ID. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      console.log("Sending to API - Addresses:", profile.addresses);
      
      const formData = new FormData();
      formData.append("userName", profile.name);
      formData.append("email", profile.email);
      formData.append("phoneNumber", profile.phone);
      
      // Ensure all addresses have names before sending
      const addressesToSend = profile.addresses.map((addr, index) => ({
        name: addr.name || `Address ${index + 1}`,
        houseNumber: addr.houseNumber,
        streetNo: addr.streetNo,
        city: addr.city,
        pincode: addr.pincode,
        isDefault: addr.isDefault || false,
      }));
      
      formData.append("addresses", JSON.stringify(addressesToSend));
      
      if (newImageFile) {
        formData.append("profilePic", newImageFile);
      }

      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ', pair[1]);
      }

      const response = await axiosInstance.put(
        `/public/${customerId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      console.log("API Response:", response.data);

      if (response.data.success) {
        alert("Profile updated successfully!");
        
        // Update user context with the response data
        if (response.data.user) {
          // Ensure addresses in response have names
          const updatedUser = {
            ...response.data.user,
            addresses: response.data.user.addresses?.map((addr, index) => ({
              ...addr,
              name: addr.name || `Address ${index + 1}`,
            })) || [],
          };
          updateUser(updatedUser);
        }
        
        setEditMode(false);
        setNewImageFile(null);
        setShowAddressForm(false);
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      console.error("Error details:", error.response?.data);
      alert(
        "An error occurred: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setNewImageFile(null);
    setShowAddressForm(false);
    resetAddressForm();
    if (user) {
      // Reset to original user data
      const formattedAddresses = (user.addresses || []).map((addr, index) => ({
        name: addr.name || `Address ${index + 1}`,
        houseNumber: addr.houseNumber || "",
        streetNo: addr.streetNo || "",
        city: addr.city || "",
        pincode: addr.pincode || "",
        isDefault: addr.isDefault || false,
      }));

      setProfile({
        name: user.userName || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
        profilePic: user.profilePic || "/icons/profile-circle-svgrepo-com.svg",
        addresses: formattedAddresses,
      });
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information and addresses</p>
      </div>

      {/* Profile Picture */}
      <div className="mb-12">
        <div
          className={`relative w-32 h-32 group ${editMode ? "cursor-pointer" : ""}`}
        >
          <div className="w-32 h-32 rounded-full border-4 border-gray-800 overflow-hidden">
            <img
              src={profile.profilePic}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          {editMode && (
            <>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full border-4 border-dashed border-gray-800">
                <svg
                  className="w-12 h-12 text-white"
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

      {/* Basic Information */}
      <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
        
        <div className="grid md:grid-cols-2 gap-8 mb-6">
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
            readOnly={true}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <InputField
            label="Phone"
            name="phone"
            value={profile.phone}
            editMode={editMode}
            onChange={handleChange}
            placeholder="10-digit Indian number"
          />
        </div>
      </div>

      {/* Addresses Section */}
      <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
          {editMode && !showAddressForm && (
            <button
              type="button"
              onClick={handleAddNewAddress}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Address
            </button>
          )}
        </div>

        {profile.addresses.length === 0 && !showAddressForm ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-lg">No addresses saved yet.</p>
            {editMode && (
              <p className="mt-2">Click "Add New Address" to add your first address</p>
            )}
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {profile.addresses.map((addr, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-gray-900">
                          {addr.name}
                        </span>
                        {addr.isDefault && (
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-700 space-y-1">
                      <p className="font-medium">{addr.houseNumber}, {addr.streetNo}</p>
                      <p>{addr.city}, {addr.pincode}</p>
                    </div>
                  </div>
                  {editMode && (
                    <div className="flex gap-4 ml-6">
                      <button
                        type="button"
                        onClick={() => editAddress(index)}
                        className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded hover:bg-blue-50 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this address?")) {
                            deleteAddress(index);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded hover:bg-red-50 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Address Form */}
        {editMode && showAddressForm && (
          <div className="mt-8 p-6 border-2 border-blue-300 rounded-xl bg-blue-50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingAddressIndex !== null ? "Edit Address" : "Add New Address"}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Address Name *
                  <span className="text-gray-500 text-xs ml-2">(e.g., Home, Office, Work)</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={newAddress.name}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                  placeholder="Enter a name for this address"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  House Number / Flat No *
                </label>
                <input
                  type="text"
                  name="houseNumber"
                  value={newAddress.houseNumber}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                  placeholder="e.g., 123, Building A, Flat 301"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Street / Area *
                </label>
                <input
                  type="text"
                  name="streetNo"
                  value={newAddress.streetNo}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                  placeholder="e.g., Main Street, Downtown"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={newAddress.city}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                  placeholder="e.g., Mumbai"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Pincode *
                </label>
                <input
                  type="tel"
                  name="pincode"
                  value={newAddress.pincode}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                  placeholder="e.g., 400001"
                  maxLength="6"
                />
              </div>
            </div>
            
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="isDefault"
                checked={newAddress.isDefault}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, isDefault: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isDefault" className="ml-2 text-gray-700 font-medium">
                Set as default address
                <span className="text-gray-500 text-sm ml-2">(This will be your primary delivery address)</span>
              </label>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={saveAddress}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {editingAddressIndex !== null ? "Update Address" : "Save Address"}
              </button>
              <button
                type="button"
                onClick={resetAddressForm}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        {!editMode ? (
          <button
            type="button"
            onClick={() => setEditMode(true)}
            className="bg-black text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-400 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </>
        )}
      </div>
    </form>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  editMode,
  readOnly = false,
  placeholder = "",
}) {
  return (
    <div>
      <label className="block text-gray-700 text-base font-medium mb-2">
        {label}:
      </label>
      {!editMode ? (
        <div className="text-gray-900 text-lg font-semibold py-2 border-b border-gray-100">
          {value || <span className="text-gray-400">{`No ${label.toLowerCase()} set`}</span>}
        </div>
      ) : (
        <input
          type={name === "phone" || name === "pincode" ? "tel" : "text"}
          name={name}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
            readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white"
          }`}
        />
      )}
    </div>
  );
}