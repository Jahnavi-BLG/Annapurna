import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';

const ProfileDashboard = () => {
  const { user, updateProfile, changePassword, deleteAccount } = useContext(AuthContext);
  
  const [profileData, setProfileData] = useState({
    contact: '',
    address: '',
    locationFormat: 'manual'
  });
  
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '' });
  const [deletePass, setDeletePass] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  useEffect(() => {
    if (user) {
      setProfileData({
        contact: user.contact || '',
        address: user.address || '',
        locationFormat: 'manual'
      });
    }
  }, [user]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let locationData = user.location;
    
    if (profileData.locationFormat === 'auto' && navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        locationData = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch (err) {
        showMessage('error', 'Failed to get GPS location. Please ensure permissions are granted.');
        setLoading(false);
        return;
      }
    }

    const res = await updateProfile(user.id, { 
      contact: profileData.contact, 
      address: profileData.address,
      location: locationData
    });
    
    if (res.success) {
      showMessage('success', 'Profile updated successfully!');
    } else {
      showMessage('error', res.message);
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await changePassword(user.id, passData.oldPassword, passData.newPassword);
    if (res.success) {
      showMessage('success', 'Password changed successfully!');
      setPassData({ oldPassword: '', newPassword: '' });
    } else {
      showMessage('error', res.message);
    }
    setLoading(false);
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!window.confirm("Are you ABSOLUTELY sure? This will deactivate your account and trigger deletion.")) return;
    
    setLoading(true);
    const res = await deleteAccount(user.id, deletePass);
    if (res.success) {
      // The context handles logout
    } else {
      showMessage('error', res.message);
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Account Settings</h1>
      
      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30' : 'bg-red-50 text-red-700 dark:bg-red-900/30'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Edit Section */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
            <User className="text-emerald-500" /> Edit Profile
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-500 mb-1">Name (Uneditable)</label>
            <input type="text" disabled value={user.name} className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed dark:bg-slate-900 dark:border-slate-700" />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-500 mb-1">Email (Uneditable)</label>
            <input type="email" disabled value={user.email} className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed dark:bg-slate-900 dark:border-slate-700" />
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Number</label>
              <input required type="text" value={profileData.contact} onChange={e => setProfileData({...profileData, contact: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
              <input type="text" value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} placeholder="e.g. 123 Main St" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Location Update</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
                  <input type="radio" checked={profileData.locationFormat === 'manual'} onChange={() => setProfileData({...profileData, locationFormat: 'manual'})} /> Keep Current
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
                  <input type="radio" checked={profileData.locationFormat === 'auto'} onChange={() => setProfileData({...profileData, locationFormat: 'auto'})} /> Re-detect via GPS
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-all">
              {loading ? 'Saving...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        <div className="space-y-8">
          {/* Change Password Section */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
              <Lock className="text-amber-500" /> Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                <input required type="password" value={passData.oldPassword} onChange={e => setPassData({...passData, oldPassword: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <input required type="password" value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-md transition-all">
                Update Password
              </button>
            </form>
          </div>

          {/* Delete Account Section */}
          <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-2xl border border-red-100 dark:border-red-900/30">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-700 dark:text-red-500">
              <AlertTriangle className="text-red-500" /> Danger Zone
            </h2>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              Deactivating your account will hide your profile and automatically delete all your data permanently after 30 days. This action requires your password.
            </p>
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <input required type="password" placeholder="Confirm Password" value={deletePass} onChange={e => setDeletePass(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
              <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-md transition-all">
                Deactivate & Delete Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
