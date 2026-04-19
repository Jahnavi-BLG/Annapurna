import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Leaf, RefreshCcw } from 'lucide-react';

const History = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/history/${user.id}`);
      setHistory(res.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const updateStatus = async (donationId, newStatus) => {
    try {
      await axios.put('http://localhost:5000/api/updateStatus', {
        donationId,
        status: newStatus
      });
      fetchHistory();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  // Metrics calculation
  const totalMeals = history.filter(d => (user.role === 'donor' ? true : d.status === 'delivered')).reduce((acc, curr) => acc + curr.quantity, 0);
  const successfulPickups = history.filter(d => d.status === 'delivered').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Impact & History</h2>
        <button onClick={fetchHistory} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors">
          <RefreshCcw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-md flex items-center gap-4">
          <div className="p-4 bg-white/20 rounded-xl"><Leaf size={32} /></div>
          <div>
            <div className="text-sm text-emerald-100 font-medium">Meals Provided</div>
            <div className="text-3xl font-extrabold">{totalMeals}</div>
          </div>
        </div>
        <div className="bg-amber-500 text-white p-6 rounded-2xl shadow-md flex items-center gap-4">
          <div className="p-4 bg-white/20 rounded-xl"><Leaf size={32} /></div>
          <div>
            <div className="text-sm text-amber-100 font-medium">Waste Prevented (kg est.)</div>
            <div className="text-3xl font-extrabold">{(totalMeals * 0.4).toFixed(1)}</div>
          </div>
        </div>
        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-md flex items-center gap-4">
          <div className="p-4 bg-white/20 rounded-xl"><Leaf size={32} /></div>
          <div>
            <div className="text-sm text-blue-100 font-medium">Completed Deliveries</div>
            <div className="text-3xl font-extrabold">{successfulPickups}</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                <th className="p-4 font-semibold text-sm">Date</th>
                <th className="p-4 font-semibold text-sm">Food Details</th>
                <th className="p-4 font-semibold text-sm">{user.role === 'donor' ? 'Claimed By' : 'Donor'}</th>
                <th className="p-4 font-semibold text-sm">Status</th>
                {user.role === 'ngo' && <th className="p-4 font-semibold text-sm">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No activity history yet.</td></tr>
              ) : history.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-900 dark:text-white">{item.foodType}</p>
                    <p className="text-xs text-slate-500">{item.quantity} Servings</p>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                    {user.role === 'donor'
                      ? (item.claimedBy?.name || 'Pending')
                      : item.donorId?.name}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                      ${item.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                        item.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  {user.role === 'ngo' && (
                    <td className="p-4">
                      {item.status === 'claimed' && (
                        <button onClick={() => updateStatus(item._id, 'picked_up')} className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors mr-2">
                          Mark Picked Up
                        </button>
                      )}
                      {item.status === 'picked_up' && (
                        <button onClick={() => updateStatus(item._id, 'delivered')} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded transition-colors">
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
