import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Moon, Sun, Utensils, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xl">
              <Utensils size={28} />
              Annapurna
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <Link to={user.role === 'admin' ? '/admin' : user.role === 'donor' ? '/donor' : '/ngo'} className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400">Dashboard</Link>
                {user.role !== 'admin' && <Link to="/history" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400">History</Link>}
                <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{user.name}</span>
                  <button onClick={handleLogout} className="text-red-500 hover:text-red-600 p-1">
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/auth" className="px-4 py-2 rounded-md text-emerald-600 dark:text-emerald-400 font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors">Login</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
