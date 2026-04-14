import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { MapPin, Navigation, Package, Clock, CheckCircle, X, Info } from 'lucide-react';

const NGODashboard = () => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [donations, setDonations] = useState([]);
  const [claimingId, setClaimingId] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [sortByDistance, setSortByDistance] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (err) => console.log(err)
      );
    }
  }, []);

  useEffect(() => {
    fetchDonations();

    if (socket) {
      socket.on('new_donation', (donation) => {
        setDonations(prev => [donation, ...prev]);
      });
      socket.on('donation_updated', (updatedDonation) => {
        if (updatedDonation.status !== 'pending') {
          setDonations(prev => prev.filter(d => d._id !== updatedDonation._id));
        }
      });
    }

    return () => {
      socket?.off('new_donation');
      socket?.off('donation_updated');
    };
  }, [socket]);

  const fetchDonations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/donations?status=pending');
      setDonations(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const claimFood = async (donationId, e) => {
    if (e) e.stopPropagation();
    setClaimingId(donationId);
    try {
      await axios.post('http://localhost:5000/api/claimFood', {
        donationId,
        ngoId: user.id
      });
      setSelectedDonation(null);
      // the socket will remove it from the list for everyone
    } catch (error) {
      alert('Failed to claim food. It might have been claimed by someone else.');
      fetchDonations();
    }
    setClaimingId(null);
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const sortedDonations = [...donations].sort((a, b) => {
    if (!sortByDistance || !coordinates.lat) return 0;
    const distA = getDistance(coordinates.lat, coordinates.lng, a.location?.lat, a.location?.lng);
    const distB = getDistance(coordinates.lat, coordinates.lng, b.location?.lat, b.location?.lng);
    return distA - distB;
  });

  if (user?.status === 'pending') {
    return (
      <div className="flex justify-center items-center h-64 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="text-center text-amber-600 dark:text-amber-500 p-8">
          <Clock size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Account Pending Approval</h2>
          <p>Your account is currently under review by an administrator.</p>
          <p className="text-sm mt-2 opacity-80">You'll be able to claim food donations once approved.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Available Food Near You</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setSortByDistance(!sortByDistance)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${sortByDistance ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'}`}
          >
            <Navigation size={16} /> {sortByDistance ? 'Sorted by Distance' : 'Sort by Distance'}
          </button>
        </div>
      </div>

      {donations.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <Package size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No Food Available Right Now</h3>
          <p className="text-slate-500 mt-2">We'll notify you the moment a donor posts food nearby.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDonations.map(don => (
            <div 
              key={don._id} 
              onClick={() => setSelectedDonation(don)}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col pt-1 cursor-pointer hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all transform hover:-translate-y-1"
            >
              <div className="h-2 w-full bg-emerald-500"></div>
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{don.foodType}</h3>
                  <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold px-3 py-1 rounded-full text-sm">
                    {don.quantity} People
                  </span>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock size={16} className="text-slate-400" />
                    <span>Exp: <strong>{new Date(don.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin size={16} className="shrink-0 text-slate-400" />
                    <span className="truncate">
                      {don.location?.address || 'Location Hidden'}
                      {coordinates.lat && don.location?.lat && (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 ml-1">
                          ({getDistance(coordinates.lat, coordinates.lng, don.location.lat, don.location.lng).toFixed(1)} km)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Package size={16} className="text-slate-400" />
                    <span>Donor: {don.donorId?.name || 'Anonymous'}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <button 
                  onClick={(e) => claimFood(don._id, e)}
                  disabled={claimingId === don._id}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2"
                >
                  {claimingId === don._id ? 'Claiming...' : <><CheckCircle size={20} /> Claim Pickup</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDonation && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedDonation(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedDonation.foodType}</h3>
                <button onClick={() => setSelectedDonation(null)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4 mb-8">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl text-emerald-800 dark:text-emerald-300">
                  <strong>Quantity:</strong> Serves {selectedDonation.quantity} people
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide mb-1">Donor Information</h4>
                  <p className="text-slate-900 dark:text-white">{selectedDonation.donorId?.name || 'Anonymous'}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Contact: {selectedDonation.donorId?.contact || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide mb-1">Pickup Details</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm flex gap-2 items-start"><MapPin size={16} className="mt-0.5 shrink-0" /> {selectedDonation.location?.address || 'GPS Coordinates Provided'}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm flex gap-2 items-center mt-2"><Clock size={16} /> Window: {selectedDonation.pickupWindow || 'Anytime before expiry'}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm flex gap-2 items-center mt-2"><Info size={16} /> Expires: {new Date(selectedDonation.expiryTime).toLocaleString()}</p>
                </div>
              </div>
              <button 
                onClick={(e) => claimFood(selectedDonation._id, e)}
                disabled={claimingId === selectedDonation._id}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2"
              >
                {claimingId === selectedDonation._id ? 'Claiming...' : <><CheckCircle size={20} /> Confirm Claim & Pickup</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NGODashboard;
