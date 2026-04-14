import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import DonorDashboard from './pages/DonorDashboard';
import NGODashboard from './pages/NGODashboard';
import History from './pages/History';
import AdminDashboard from './pages/AdminDashboard';
import { AuthContext } from './context/AuthContext';
import { SocketContext } from './context/SocketContext';

function App() {
  const { user, loading } = useContext(AuthContext);
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (socket) {
      socket.on('new_donation', (donation) => {
        // We could use a toast notification here
        if (user && user.role === 'ngo') {
          alert(`New food donation available: ${donation.foodType} for ${donation.quantity} people near you!`);
        }
      });
      return () => {
        socket.off('new_donation');
      };
    }
  }, [socket, user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900 dark:text-white">Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={!user ? <Auth /> : <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'donor' ? '/donor' : '/ngo'} />} />
            <Route path="/donor" element={user && user.role === 'donor' ? <DonorDashboard /> : <Navigate to="/auth" />} />
            <Route path="/ngo" element={user && user.role === 'ngo' ? <NGODashboard /> : <Navigate to="/auth" />} />
            <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/auth" />} />
            <Route path="/history" element={user ? <History /> : <Navigate to="/auth" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
