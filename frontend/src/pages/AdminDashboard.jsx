import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, UserCheck, UserX, Clock, Database, Users, Package } from 'lucide-react';

const AdminDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'donations'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, donationsRes] = await Promise.all([
        axios.get('https://annapurna-o299.onrender.com/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('https://annapurna-o299.onrender.com/api/admin/donations', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(usersRes.data);
      setDonations(donationsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`https://annapurna-o299.onrender.com/api/admin/users/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh the list
      setUsers(users.map(u => u._id === id ? { ...u, status } : u));
    } catch (error) {
      alert('Error updating user status');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-500 font-bold text-xl">
          <ShieldCheck size={48} className="mx-auto mb-4" />
          Access Denied. Admin Privileges Required.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="text-indigo-600" size={32} />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Control Panel</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mb-8">

        {/* TABS */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors ${activeTab === 'users' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white dark:bg-slate-800' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Users size={18} /> Manage Users
          </button>
          <button
            onClick={() => setActiveTab('donations')}
            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors ${activeTab === 'donations' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white dark:bg-slate-800' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Database size={18} /> View All Data (Posts)
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading data...</div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'users' ? (
              // USERS TABLE
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 text-sm">
                    <th className="p-4 font-semibold">User Details</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Contact</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-500">No users found.</td></tr>
                  ) : users.map(u => (
                    <tr key={u._id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-sm text-slate-500">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-md uppercase ${u.role === 'ngo' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{u.contact}</td>
                      <td className="p-4">
                        {u.status === 'pending' && <span className="flex items-center gap-1 text-amber-600 text-sm font-semibold bg-amber-50 px-2 py-1 rounded-md w-max"><Clock size={14} /> Pending</span>}
                        {u.status === 'approved' && <span className="flex items-center gap-1 text-emerald-600 text-sm font-semibold bg-emerald-50 px-2 py-1 rounded-md w-max"><UserCheck size={14} /> Approved</span>}
                        {u.status === 'rejected' && <span className="flex items-center gap-1 text-red-600 text-sm font-semibold bg-red-50 px-2 py-1 rounded-md w-max"><UserX size={14} /> Rejected</span>}
                      </td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => updateStatus(u._id, 'approved')} disabled={u.status === 'approved'} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition-colors" title="Approve">
                          <UserCheck size={18} />
                        </button>
                        <button onClick={() => updateStatus(u._id, 'rejected')} disabled={u.status === 'rejected'} className="bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition-colors" title="Reject">
                          <UserX size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              // DONATIONS TABLE
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 text-sm">
                    <th className="p-4 font-semibold">Post Details</th>
                    <th className="p-4 font-semibold">Quantity</th>
                    <th className="p-4 font-semibold">Donor Info</th>
                    <th className="p-4 font-semibold">Address</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-500">No donations/posts found in database.</td></tr>
                  ) : donations.map(d => (
                    <tr key={d._id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                          <Package size={16} className="text-slate-400" /> {d.foodType}
                        </span>
                        <div className="text-xs text-slate-500 mt-1">Exp: {new Date(d.expiryTime).toLocaleString()}</div>
                      </td>
                      <td className="p-4 font-bold text-emerald-600">{d.quantity}</td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                        {d.donorId?.name || 'Anonymous'}<br />
                        <span className="text-xs text-slate-400">{d.donorId?.contact || ''}</span>
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate" title={d.location?.address}>
                        {d.location?.address || 'GPS Only'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-md uppercase ${d.status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
