import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, AlertCircle } from 'lucide-react';
import { getAggregatedData } from './services/api';

// Components
const RaceRow = ({ rank, data, maxTotal, target }) => {
  const percentage = maxTotal > 0 ? (data.total / maxTotal) * 100 : 0;
  const isGreenZone = data.total >= target;
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3 relative"
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-xl
          ${rank === 1 ? 'bg-yellow-500 text-black' : 
            rank === 2 ? 'bg-gray-300 text-black' : 
            rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-300'}`}>
          {rank}
        </div>

        {/* Bar Container */}
        <div className="flex-1 relative h-14 bg-slate-800 rounded-lg overflow-hidden flex items-center px-4">
          
          {/* Progress Bar Background */}
          <motion.div 
            className={`absolute left-0 top-0 bottom-0 opacity-30 ${isGreenZone ? 'bg-green-500' : 'bg-red-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          
          {/* Progress Bar Active Line (The "Car") */}
          <motion.div 
            className={`absolute left-0 bottom-0 h-1 ${isGreenZone ? 'bg-green-400' : 'bg-red-400'}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Clinic Name */}
          <div className="relative z-10 flex-1">
            <h3 className="font-bold text-lg truncate">{data.name}</h3>
          </div>

          {/* Total Sales */}
          <div className="relative z-10 text-right">
            <span className="text-2xl font-mono font-bold">
              Rp {data.total.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Status Icon */}
          <div className="relative z-10 ml-4">
            {isGreenZone ? 
              <TrendingUp className="text-green-400 w-6 h-6" /> : 
              <AlertCircle className="text-red-400 w-6 h-6" />
            }
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function App() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Configuration
  const TARGET_SALES = 5000000; // Example target: 5 Million IDR for Green Zone

  const fetchData = async () => {
    // setLoading(true); // Don't show loading on refresh to keep it smooth
    const data = await getAggregatedData();
    setLeaderboard(data);
    setLoading(false);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    fetchData();
    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const maxTotal = leaderboard.length > 0 ? Math.max(...leaderboard.map(i => i.total), TARGET_SALES * 1.2) : 0;

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            Realtime Sales Race
          </h1>
          <p className="text-slate-400 mt-1">
            Live Performance Monitor • {leaderboard.length} Clinics
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Last Update</div>
          <div className="text-xl font-mono">{lastUpdated.toLocaleTimeString()}</div>
        </div>
      </header>

      {/* Main Race Track */}
      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((clinic, index) => (
              <RaceRow 
                key={clinic.name} 
                rank={index + 1} 
                data={clinic} 
                maxTotal={maxTotal}
                target={TARGET_SALES}
              />
            ))}
          </div>
        )}
      </main>

      {/* Legend / Footer */}
      <footer className="fixed bottom-8 right-8 flex gap-6 bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="font-bold">On Target ({'>'} Rp {TARGET_SALES.toLocaleString()})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="font-bold">Below Target</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
