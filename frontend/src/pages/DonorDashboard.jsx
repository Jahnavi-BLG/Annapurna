import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { CheckCircle, Clock, MapPin, Search, Truck } from 'lucide-react';

const DonorDashboard = () => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    expiryTime: '',
    pickupWindow: '',
    locationFormat: 'auto',
    manualLocation: '',
  });
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [hygieneChecked, setHygieneChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [myDonations, setMyDonations] = useState([]);

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (err) => {
          console.error(err);
          window.alert('Failed to get location automatically. Please check browser permissions or enter manually.');
        }
      );
    } else {
      window.alert('Geolocation is not supported by your browser.');
    }
  };

  useEffect(() => {
    detectLocation();
    fetchMyDonations();

    if (socket) {
      socket.on('donation_updated', (updatedDonation) => {
        if (updatedDonation.donorId === user.id || updatedDonation.donorId._id === user.id) {
          fetchMyDonations();
        }
      });
    }
    return () => socket?.off('donation_updated');
  }, [socket, user]);

  const fetchMyDonations = async () => {
    try {
      const res = await axios.get(`https://annapurna-o299.onrender.com/api/history/${user.id}`);
      setMyDonations(res.data.filter(d => d.status !== 'delivered')); // Active ones
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hygieneChecked) return window.alert('Please confirm food safety check.');

    if (formData.locationFormat === 'auto' && !coordinates.lat) {
      return window.alert('GPS Location not acquired. Please allow location access or enter address manually.');
    }
    if (formData.locationFormat === 'manual' && !formData.manualLocation.trim()) {
      return window.alert('Please enter a valid manual address.');
    }

    setLoading(true);
    try {
      const donorLat = formData.locationFormat === 'auto' ? coordinates.lat : null;
      const donorLng = formData.locationFormat === 'auto' ? coordinates.lng : null;

      await axios.post('https://annapurna-o299.onrender.com/api/donateFood', {
        ...formData,
        location: {
          lat: donorLat,
          lng: donorLng,
          address: formData.manualLocation
        },
        donorId: user.id
      });
      setSuccess(true);
      fetchMyDonations();
      setTimeout(() => setSuccess(false), 3000);
      setFormData({ ...formData, foodType: '', quantity: '', expiryTime: '', pickupWindow: '' });
      setHygieneChecked(false);
    } catch (error) {
      window.alert('Error donating food: Maybe NGOs list unavailable or server issue.');
    }
    setLoading(false);
  };

  if (user?.status === 'pending') {
    return (
      <div className="flex justify-center items-center h-64 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="text-center text-amber-600 dark:text-amber-500 p-8">
          <Clock size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Account Pending Approval</h2>
          <p>Your account is currently under review by an administrator.</p>
          <p className="text-sm mt-2 opacity-80">You'll be able to post donations once approved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle className="text-emerald-500" /> Donate Food
        </h2>

        {success && <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl mb-6 font-medium">Food donation posted successfully! Notifying nearby NGOs...</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Food Type/Description</label>
              <input required type="text" placeholder="E.g. Rice and Curry" value={formData.foodType} onChange={e => setFormData({ ...formData, foodType: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity (People)</label>
              <input required type="number" min="1" placeholder="50" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date & Time</label>
              <input required type="datetime-local" value={formData.expiryTime} onChange={e => setFormData({ ...formData, expiryTime: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pickup Window</label>
              <input type="text" placeholder="2 PM - 5 PM" value={formData.pickupWindow} onChange={e => setFormData({ ...formData, pickupWindow: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-3 border border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Location Settings</label>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400"><input type="radio" checked={formData.locationFormat === 'auto'} onChange={() => setFormData({ ...formData, locationFormat: 'auto' })} /> Auto Detect (GPS)</label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400"><input type="radio" checked={formData.locationFormat === 'manual'} onChange={() => setFormData({ ...formData, locationFormat: 'manual' })} /> Enter Manually</label>
            </div>

            {formData.locationFormat === 'auto' && (
              <div className="flex flex-col gap-2">
                <button type="button" onClick={detectLocation} className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-3 rounded w-fit transition-colors">
                  Force Detect GPS Location
                </button>
                {coordinates.lat ? (
                  <div className="text-xs text-emerald-600 flex items-center gap-1"><MapPin size={14} /> Location acquired</div>
                ) : (
                  <div className="text-xs text-red-500">Location not yet acquired. Please click above or allow permissions.</div>
                )}
              </div>
            )}

            {formData.locationFormat === 'manual' && (
              <input type="text" placeholder="Enter Full Address" value={formData.manualLocation} onChange={e => setFormData({ ...formData, manualLocation: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
            )}
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 w-5 h-5 accent-emerald-600" checked={hygieneChecked} onChange={e => setHygieneChecked(e.target.checked)} />
              <span className="text-sm text-amber-800 dark:text-amber-200">I confirm that the food is fresh, prepared hygienically, packed properly, and meets safety standards for consumption.</span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-all mt-4">
            {loading ? 'Posting...' : 'Post Donation (Takes <60s)'}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Active Donations Tracker</h3>
        <div className="space-y-4">
          {myDonations.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 italic">No active donations. Be a hero today!</p>
          ) : myDonations.map(don => (
            <div key={don._id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">{don.foodType}</h4>
                  <p className="text-sm text-slate-500">For {don.quantity} people • Exp: {new Date(don.expiryTime).toLocaleTimeString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${don.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {don.status.toUpperCase()}
                </span>
              </div>

              {/* Status Tracker UI */}
              <div className="relative pt-4">
                <div className="absolute top-6 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full z-0"></div>
                {don.status !== 'pending' && <div className="absolute top-6 left-0 w-1/2 h-1 bg-emerald-500 rounded-full z-0"></div>}
                {don.status === 'picked_up' && <div className="absolute top-6 left-0 w-full h-1 bg-emerald-500 rounded-full z-0"></div>}

                <div className="relative z-10 flex justify-between text-xs font-medium text-slate-500">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white dark:border-slate-800"><CheckCircle size={12} /></div>
                    Pending
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 transition-colors ${don.status !== 'pending' ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-600'}`}><Clock size={12} /></div>
                    Claimed
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 transition-colors ${don.status === 'picked_up' ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-600'}`}><Truck size={12} /></div>
                    Picked Up
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
