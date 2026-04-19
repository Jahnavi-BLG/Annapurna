import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Set default auth header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    // Optionally fetch user profile with token here to verify
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', userData);
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateProfile = async (id, data) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/auth/profile/${id}`, data);
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Profile update failed' };
    }
  };

  const changePassword = async (id, oldPassword, newPassword) => {
    try {
      await axios.put(`http://localhost:5000/api/auth/change-password/${id}`, { oldPassword, newPassword });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Password change failed' };
    }
  };

  const deleteAccount = async (id, password) => {
    try {
      await axios.put(`http://localhost:5000/api/auth/deactivate-account/${id}`, { password });
      logout();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Account deletion failed' };
    }
  };

  const forgotPassword = async (email, contact, newPassword) => {
    try {
      await axios.post(`http://localhost:5000/api/auth/forgot-password`, { email, contact, newPassword });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to reset password' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, changePassword, deleteAccount, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
