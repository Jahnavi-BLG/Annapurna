import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Truck, Clock } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6 mt-12 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">
          Zero Hunger, Zero Waste
        </h1>
        <p className="mt-4 text-xl text-slate-600 dark:text-slate-300 mb-10">
          Connect your surplus food with those who need it instantly. A real-time redistribution network empowering NGOs and Donors.
        </p>
        
        <div className="flex justify-center gap-4 mb-20 animate-fade-in-up">
          <Link to="/auth?role=donor" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            Donate Food
          </Link>
          <Link to="/auth?role=ngo" className="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl font-bold text-lg shadow-sm hover:shadow-md transition-all">
            Find Food (NGO)
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-16">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <Clock size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Instant Alerts</h3>
            <p className="text-slate-600 dark:text-slate-400">NGOs are notified within seconds when food becomes available nearby.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <Truck size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Live Tracking</h3>
            <p className="text-slate-600 dark:text-slate-400">Donors can track the pickup status of their donations in real-time.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <Heart size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Impact Analytics</h3>
            <p className="text-slate-600 dark:text-slate-400">Track how many meals you've served and your environmental footprint.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
