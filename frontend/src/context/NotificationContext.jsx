import React, { createContext, useState, useEffect, useContext } from 'react';
import { SocketContext } from './SocketContext';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch from backend on mount
  const fetchNotifications = async () => {
    if (user) {
      try {
        const res = await fetch(`https://annapurna-o299.onrender.com/api/notifications/${user.id}`);
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (socket && user) {
      const handleNewDonation = (donation) => {
        if (user.role === 'ngo') {
          // Haversine calculation could go here, but for simplicity we assume 
          // if it reaches here, the donor already decided to post it to available NGOs.
          addNotification({
            id: Date.now(),
            type: 'new_donation',
            message: `New Food Available: ${donation.quantity} servings of ${donation.foodType}!`,
            time: new Date().toISOString(),
            read: false
          });
        }
      };

      const handleDonationUpdated = (donation) => {
        // If Donor: tell them their food was claimed
        if (user.role === 'donor' && (donation.donorId === user.id || donation.donorId?._id === user.id)) {
          if (donation.status === 'claimed') {
            addNotification({
              id: Date.now(),
              type: 'donation_claimed',
              message: `Your donation of ${donation.foodType} was claimed by an NGO!`,
              time: new Date().toISOString(),
              read: false
            });
          } else if (donation.status === 'picked_up') {
            addNotification({
              id: Date.now(),
              type: 'donation_picked_up',
              message: `Your donation of ${donation.foodType} has been picked up. Thank you!`,
              time: new Date().toISOString(),
              read: false
            });
          }
        }
      };

      socket.on('new_donation', handleNewDonation);
      socket.on('donation_updated', handleDonationUpdated);

      return () => {
        socket.off('new_donation', handleNewDonation);
        socket.off('donation_updated', handleDonationUpdated);
      };
    }
  }, [socket, user]);

  const addNotification = (notif) => {
    setNotifications(prev => [notif, ...prev]);
  };

  const markAllAsRead = async () => {
    try {
      if (user) await fetch(`https://annapurna-o299.onrender.com/api/notifications/mark-read/${user.id}`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) { }
  };

  const clearNotifications = async () => {
    try {
      if (user) await fetch(`https://annapurna-o299.onrender.com/api/notifications/clear/${user.id}`, { method: 'DELETE' });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) { }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
