import React, { useState, useEffect, useRef } from 'react';
import { axiosInstance } from '../../utils/axios'; 
import { Loader2, Save, Lock, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  
  // Profile State
  const [profileData, setProfileData] = useState({
    userName: '',
    email: '',
    companyName: '',
    phoneNumber: '',
    profilePic: '' 
  });

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Password State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get('/eventManagers/profile/me');
      setProfileData({
        userName: res.data.userName || '',
        email: res.data.email || '',
        companyName: res.data.companyName || '',
        phoneNumber: res.data.phoneNumber || '',
        profilePic: res.data.profilePic || ''
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordInput = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // Trigger hidden file input click
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  // Handle file selection and preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB Limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file)); // Create local preview URL
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      
      // 1. Append all text fields to FormData
      // Note: We must append them even if they haven't changed, 
      // because the backend expects them in req.body (parsed from formData)
      formData.append('userName', profileData.userName || '');
      formData.append('email', profileData.email || '');
      formData.append('companyName', profileData.companyName || '');
      formData.append('phoneNumber', profileData.phoneNumber || '');
      
      // 2. Append profilePic only if a new file is selected
      if (selectedFile) {
        formData.append('profilePic', selectedFile);
      }

      // 3. Send as multipart/form-data
      // Axios will automatically set the Content-Type to multipart/form-data 
      // with the correct boundary when passing a FormData object
      const response = await axiosInstance.put('/eventManagers/profile/me', formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        // Update local state with returned data (usually contains new Cloudinary URL)
        if (response.data.eventManager) {
            setProfileData(prev => ({
                ...prev,
                userName: response.data.eventManager.userName,
                email: response.data.eventManager.email,
                companyName: response.data.eventManager.companyName,
                phoneNumber: response.data.eventManager.phoneNumber,
                profilePic: response.data.eventManager.profilePic
            }));
            setSelectedFile(null);
            setImagePreview(null);
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
        return toast.error("Please fill in all password fields");
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (passwords.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      const response = await axiosInstance.put('/eventManagers/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      
      if (response.data.success) {
        toast.success("Password changed successfully!");
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin w-8 h-8 text-gray-500"/></div>;

  return (
    <div className="relative z-10">
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">Account Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>
        </div>
      </header>

      <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Section */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-[#1a1a1a] mb-6">Profile Information</h2>
                    
                    <div className="space-y-6">
                        <div className="flex items-center space-x-6 mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden ring-2 ring-offset-2 ring-gray-100">
                                {/* Show Preview if available, else show existing profilePic, else show Initials */}
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : profileData.profilePic ? (
                                    <img src={profileData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    "EM"
                                )}
                            </div>
                            <div>
                                {/* Hidden File Input */}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                    accept="image/*"
                                />
                                <button 
                                    type="button"
                                    onClick={handleAvatarClick}
                                    className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm flex items-center gap-2"
                                >
                                    <Camera className="w-4 h-4" />
                                    Change Avatar
                                </button>
                                <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size of 5MB.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">User Name</label>
                                <input 
                                    name="userName" 
                                    value={profileData.userName} 
                                    onChange={handleProfileChange} 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent transition-all" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input 
                                    name="email" 
                                    type="email" 
                                    value={profileData.email} 
                                    onChange={handleProfileChange} 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent transition-all" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                                <input 
                                    name="companyName" 
                                    value={profileData.companyName} 
                                    onChange={handleProfileChange} 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent transition-all" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input 
                                    name="phoneNumber" 
                                    type="tel" 
                                    value={profileData.phoneNumber} 
                                    onChange={handleProfileChange} 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent transition-all" 
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                type="button"
                                onClick={saveProfile}
                                disabled={saving}
                                className="bg-[#1a1a1a] text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
                    <h2 className="text-xl font-bold text-[#1a1a1a] mb-6">Security</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                            <input 
                                name="currentPassword" 
                                type="password" 
                                value={passwords.currentPassword} 
                                onChange={handlePasswordInput} 
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent transition-all" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input 
                                name="newPassword" 
                                type="password" 
                                value={passwords.newPassword} 
                                onChange={handlePasswordInput} 
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent transition-all" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input 
                                name="confirmPassword" 
                                type="password" 
                                value={passwords.confirmPassword} 
                                onChange={handlePasswordInput} 
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent transition-all" 
                            />
                        </div>
                        
                        <div className="pt-2">
                            <button 
                                type="button"
                                onClick={updatePassword} 
                                className="bg-[#1a1a1a] text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors w-full flex items-center justify-center gap-2"
                            >
                                <Lock className="w-4 h-4" /> Update Password
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Account Status</h3>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <i className="fas fa-check text-green-600 text-sm">✓</i>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-green-800">Active</p>
                                    <p className="text-xs text-green-600">Your account is active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Settings;