import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Auth = () => {
  const { login, register, forgotPassword } = useContext(AuthContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') || 'donor';

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: initialRole,
    contact: '',
    locationFormat: 'manual',
    manualAddress: '',
    location: { lat: null, lng: null },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({ email: '', contact: '', newPassword: '' });
  const [resetSuccess, setResetSuccess] = useState('');

  // Ask for location on mount or when switching to NGO
  useEffect(() => {
    if (!isLogin && formData.role === 'ngo' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: { lat: position.coords.latitude, lng: position.coords.longitude }
          }));
        },
        (err) => console.log('Geolocation optional:', err)
      );
    }
  }, [isLogin, formData.role]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleForgotChange = (e) => {
    setForgotPasswordData({ ...forgotPasswordData, [e.target.name]: e.target.value });
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetSuccess('');
    setLoading(true);

    const res = await forgotPassword(forgotPasswordData.email, forgotPasswordData.contact, forgotPasswordData.newPassword);

    if (res.success) {
      setResetSuccess('Password reset successful! Please login.');
      setTimeout(() => {
        setIsForgotPassword(false);
        setResetSuccess('');
        setForgotPasswordData({ email: '', contact: '', newPassword: '' });
      }, 3000);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let res;
    // Inject the final address payload for NGOs
    const finalData = { ...formData };
    if (!isLogin && finalData.role === 'ngo') {
      if (finalData.locationFormat === 'manual') {
        finalData.address = finalData.manualAddress;
      }
    }

    if (isLogin) {
      res = await login(finalData.email, finalData.password);
    } else {
      res = await register(finalData);
    }

    if (!res.success) {
      setError(res.message);
    }
    setLoading(false);
  };

  if (isForgotPassword) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-900 dark:text-white">Reset Password</h2>
        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {resetSuccess && <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg mb-4 text-sm">{resetSuccess}</div>}
        <form onSubmit={handleForgotSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input type="email" name="email" value={forgotPasswordData.email} required onChange={handleForgotChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Registered Contact Number</label>
            <input type="text" name="contact" value={forgotPasswordData.contact} required onChange={handleForgotChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
            <input type="password" name="newPassword" value={forgotPasswordData.newPassword} required onChange={handleForgotChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-all">
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => setIsForgotPassword(false)} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-center mb-6 text-slate-900 dark:text-white">
        {isLogin ? 'Welcome Back' : 'Create an Account'}
      </h2>

      {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Organization / Full Name</label>
              <input type="text" name="name" required={!isLogin} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Number</label>
              <input type="text" name="contact" required={!isLogin} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">I am a...</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                <option value="donor">Food Donor</option>
                <option value="ngo">NGO / Recipient</option>
              </select>
            </div>

            {formData.role === 'ngo' && (
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm space-y-3">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">NGO Location Details</label>
                <p className="text-slate-500 text-xs">Help donors find you either by precise GPS or manual address.</p>

                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
                    <input type="radio" checked={formData.locationFormat === 'manual'} onChange={() => setFormData({ ...formData, locationFormat: 'manual' })} /> Enter Manually
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
                    <input type="radio" checked={formData.locationFormat === 'auto'} onChange={() => setFormData({ ...formData, locationFormat: 'auto' })} /> Auto Detect (GPS)
                  </label>
                </div>

                {formData.locationFormat === 'manual' ? (
                  <input
                    type="text"
                    placeholder="Enter Full NGO Address"
                    value={formData.manualAddress}
                    onChange={e => setFormData({ ...formData, manualAddress: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => setFormData(prev => ({ ...prev, location: { lat: position.coords.latitude, lng: position.coords.longitude } })),
                            (err) => alert('GPS disabled or blocked. Please allow location permissions in your browser.')
                          );
                        } else {
                          alert('Geolocation is not supported by your browser.');
                        }
                      }}
                      className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 py-2 rounded-lg transition-colors font-medium flex justify-center items-center gap-2"
                    >
                      Detect Current GPS Location
                    </button>
                    {formData.location?.lat && (
                      <div className="mt-2 text-emerald-600 dark:text-emerald-400 font-bold text-center text-xs">
                        ✓ GPS Coordinates Saved Successfully!
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input type="email" name="email" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex justify-between">
              Password
              {isLogin && (
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs hover:underline">
                  Forgot Password?
                </button>
              )}
            </label>
            <input type="password" name="password" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
          </div>
        </>

        <button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-all">
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button onClick={() => setIsLogin(!isLogin)} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </div>
  );
};

export default Auth;
