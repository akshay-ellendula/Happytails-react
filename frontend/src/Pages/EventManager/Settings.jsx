import React from 'react';

const Settings = () => {
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
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-[#1a1a1a] mb-6">Profile Information</h2>
                    
                    <div className="space-y-6">
                        <div className="flex items-center space-x-6 mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                EM
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
                                <input type="text" value="Event Manager" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input type="email" value="admin@happytails.com" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                                <input type="text" value="Happy Tails Events" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input type="tel" value="+1 (555) 123-4567" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent" />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button className="bg-[#1a1a1a] text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-[#1a1a1a] mb-6">Security</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                            <input type="password" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input type="password" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input type="password" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent" />
                        </div>
                        
                        <div className="pt-2">
                            <button className="bg-[#1a1a1a] text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 w-full">
                                Update Password
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Account Status</h3>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <i className="fas fa-check text-green-600 text-sm"></i>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-green-800">Active</p>
                                    <p className="text-xs text-green-600">Your account is active and in good standing</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
  );
};

export default Settings;