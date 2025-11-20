import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../utils/axios'; // Adjust path
import { Loader2, Save, Lock } from 'lucide-react';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile State
  const [profileData, setProfileData] = useState({
    userName: '',
    email: '',
    companyName: '',
    phoneNumber: '',
    profilePic: '' // Assuming you might handle this later
  });

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
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordInput = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await axiosInstance.put('/eventManagers/profile/me', profileData);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      return alert("New passwords do not match");
    }
    if (passwords.newPassword.length < 6) {
      return alert("Password must be at least 6 characters");
    }

    try {
      await axiosInstance.put('/eventManagers/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      alert("Password changed successfully!");
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error("Error changing password:", error);
      alert(error.response?.data?.message || "Failed to change password");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin w-8 h-8 text-gray-500"/></div>;

  return (
    <>
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
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                                {profileData.profilePic ? (
                                    <img src={profileData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                ) : "EM"}
                            </div>
                            <div>
                                <button className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 text-sm">
                                    Change Avatar
                                </button>
                                <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">User Name</label>
                                <input name="userName" value={profileData.userName} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input name="email" type="email" value={profileData.email} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                                <input name="companyName" value={profileData.companyName} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input name="phoneNumber" type="tel" value={profileData.phoneNumber} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={saveProfile}
                                disabled={saving}
                                className="bg-[#1a1a1a] text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 flex items-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-[#1a1a1a] mb-6">Security</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                            <input name="currentPassword" type="password" value={passwords.currentPassword} onChange={handlePasswordInput} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input name="newPassword" type="password" value={passwords.newPassword} onChange={handlePasswordInput} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input name="confirmPassword" type="password" value={passwords.confirmPassword} onChange={handlePasswordInput} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                        </div>
                        
                        <div className="pt-2">
                            <button onClick={updatePassword} className="bg-[#1a1a1a] text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 w-full flex items-center justify-center gap-2">
                                <Lock className="w-4 h-4" /> Update Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
  );
};

export default Settings;