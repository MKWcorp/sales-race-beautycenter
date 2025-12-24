import React, { useEffect, useState } from 'react';
import { Trophy, TrendingUp, AlertCircle, Zap, Target, Clock, Flame, Swords, Crown } from 'lucide-react';
import { getAggregatedData } from './services/api';

// PIC Data
const PIC_DATA = {
  "Beauty Center Kaliurang": "Pak Eri", "Kaliurang": "Pak Eri",
  "Beauty Center Parangtritis": "Bu Hani", "Beauty Center Prawirotaman": "Bu Hani",
  "Beauty Center Godean": "Bu Vera", "Godean": "Bu Vera",
  "Beauty Center Kotagede": "Pak Inu", "Kota gede": "Pak Inu",
  "Beauty Center Prambanan": "Bu Ida", "Prambanan": "Bu Ida",
  "Beauty Center Bantul": "Mas Ihsan", "bantul": "Mas Ihsan",
  "Beauty Center Maguwoharjo": "Bu Desy", "Maguwoharjo tajem": "Bu Desy",
  "Rumah Cantik Rajawali": "Pak Andri", "Rumah cantik Rajawali": "Pak Andri",
  "Beauty Center Muntilan": "Bu Ning", "Muntilan": "Bu Ning",
  "Beauty Center Wates": "TBD", "Wates": "TBD",
  "Klinik DRW Skincare Magelang": "Klinik", "Clinic magelang": "Klinik",
  "Klinik DRW Skincare Purworejo": "Klinik", "clinic purworejo": "Klinik",
  "Klinik DRW Skincare Kutoarjo": "Klinik", "Cinic Kuotarjo": "Klinik",
};

// Target Bulanan DESEMBER 2025
const MONTHLY_TARGETS = {
  "Klinik DRW Skincare Magelang": 124350000, "Clinic magelang": 124350000,
  "Klinik DRW Skincare Purworejo": 321828000, "clinic purworejo": 321828000,
  "Klinik DRW Skincare Kutoarjo": 321828000, "Cinic Kuotarjo": 321828000,
  "Rumah Cantik Rajawali": 32650080, "Rumah cantik Rajawali": 32650080,
  "Beauty Center Kaliurang": 64560000, "Kaliurang": 64560000,
  "Beauty Center Parangtritis": 76597680, "Beauty Center Prawirotaman": 76597680,
  "Beauty Center Maguwoharjo": 77970480, "Maguwoharjo tajem": 77970480,
  "Beauty Center Kotagede": 69834960, "Kota gede": 69834960,
  "Beauty Center Bantul": 73374040, "bantul": 73374040,
  "Beauty Center Prambanan": 66057600, "Prambanan": 66057600,
  "Beauty Center Godean": 74609760, "Godean": 74609760,
  "Beauty Center Muntilan": 61705400, "Muntilan": 61705400,
  "Beauty Center Wates": 69240000, "Wates": 69240000,
};

const PROGRAM_END = new Date('2026-03-01');
const getDaysInMonth = () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
const getDailyTarget = (name) => Math.round((MONTHLY_TARGETS[name] || 50000000) / getDaysInMonth());
const getPIC = (name) => PIC_DATA[name] || "TBD";
const getRemainingDays = () => Math.max(0, Math.ceil((PROGRAM_END - new Date()) / 86400000));

// Row Component - Battle Theme
const RaceRow = ({ rank, data, maxTotal }) => {
  const target = getDailyTarget(data.name);
  const percent = maxTotal > 0 ? Math.min((data.total / maxTotal) * 100, 100) : 0;
  const achievement = target > 0 ? Math.round((data.total / target) * 100) : 0;
  const isOnTarget = data.total >= target;
  const pic = getPIC(data.name);

  const getRankStyle = () => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/50';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-black shadow-lg shadow-gray-400/50';
    if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg shadow-amber-600/50';
    return 'bg-slate-700 text-slate-300';
  };

  return (
    <div className="flex items-center gap-3 px-4">
      {/* Rank Badge */}
      <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-black text-base shrink-0 relative ${getRankStyle()}`}>
        {rank === 1 && <Crown className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />}
        {rank}
      </div>

      {/* Main Bar */}
      <div className={`flex-1 h-12 rounded-lg relative overflow-hidden flex items-center px-4 transition-all duration-300
        ${isOnTarget ? 'bg-gradient-to-r from-slate-800 to-slate-900 ring-2 ring-green-500/70 shadow-lg shadow-green-500/20' : 'bg-gradient-to-r from-slate-800 to-slate-900 ring-2 ring-red-500/70 shadow-lg shadow-red-500/20'}`}>
        
        {/* Animated Fill */}
        <div 
          className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out ${isOnTarget ? 'bg-gradient-to-r from-green-600/40 via-green-500/30 to-green-600/20' : 'bg-gradient-to-r from-red-600/40 via-red-500/30 to-red-600/20'}`}
          style={{ width: `${percent}%` }}
        />
        
        {/* Glowing Bottom Accent */}
        <div 
          className={`absolute bottom-0 left-0 h-1.5 transition-all duration-1000 ease-out ${isOnTarget ? 'bg-gradient-to-r from-green-400 to-green-600 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gradient-to-r from-red-400 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}
          style={{ width: `${percent}%` }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between w-full gap-3">
          {/* Clinic Info */}
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm text-white drop-shadow-md truncate leading-tight">{data.name}</p>
            <p className="text-amber-400 text-[11px] font-semibold mt-0.5">👤 {pic}</p>
          </div>

          {/* Achievement Badge */}
          <div className={`px-3 py-1 rounded-md text-xs font-black shrink-0 shadow-lg
            ${achievement >= 100 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/50' : 
              achievement >= 75 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-yellow-500/50' : 
              'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/50'}`}>
            {achievement}%
          </div>

          {/* Revenue */}
          <div className="font-mono font-black text-sm text-white drop-shadow-md w-24 text-right shrink-0">
            Rp {(data.total/1000000).toFixed(1)}jt
          </div>

          {/* Status Icon */}
          <div className="shrink-0">
            {isOnTarget ? 
              <TrendingUp className="w-5 h-5 text-green-400 drop-shadow-[0_0_6px_rgba(34,197,94,0.8)]" /> : 
              <AlertCircle className="w-5 h-5 text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
            }
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    const data = await getAggregatedData();
    setLeaderboard(data);
    setLoading(false);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const maxTotal = leaderboard.length > 0 ? Math.max(...leaderboard.map(i => i.total)) * 1.1 : 1;
  const totalRevenue = leaderboard.reduce((s, c) => s + c.total, 0);
  const onTargetCount = leaderboard.filter(c => c.total >= getDailyTarget(c.name)).length;
  const remaining = getRemainingDays();

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col relative overflow-hidden">
      
      {/* Background Battle Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.03) 35px, rgba(255,255,255,.03) 70px)',
        }} />
      </div>

      {/* HEADER */}
      <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm border-b-2 border-orange-500/30 relative z-10 shadow-lg shadow-black/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-600 to-orange-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/50 animate-pulse">
            <Swords className="w-7 h-7 text-white drop-shadow-lg" />
          </div>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
              BATTLE BUSINESS GAME
            </h1>
            <p className="text-[11px] text-slate-400 font-semibold">🏆 Program 90 Hari Challenge • Supervisor: Bu Putri</p>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Sisa Hari */}
          <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-sm border border-orange-500/50 rounded-lg px-3 py-1.5 shadow-lg">
            <p className="text-[10px] text-orange-400 font-black flex items-center gap-1">
              <Flame className="w-3 h-3" /> SISA HARI
            </p>
            <p className="text-xl font-black text-orange-300 drop-shadow-lg">{remaining}</p>
          </div>

          {/* Hari Ini */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/50 rounded-lg px-3 py-1.5 shadow-lg">
            <p className="text-[10px] text-green-400 font-black flex items-center gap-1">
              <Zap className="w-3 h-3" /> HARI INI
            </p>
            <p className="text-base font-black text-green-300 drop-shadow-lg">Rp {(totalRevenue/1000000).toFixed(0)}jt</p>
          </div>

          {/* On Target */}
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-sm border border-blue-500/50 rounded-lg px-3 py-1.5 shadow-lg">
            <p className="text-[10px] text-blue-400 font-black flex items-center gap-1">
              <Target className="w-3 h-3" /> ON TARGET
            </p>
            <p className="text-xl font-black text-blue-300 drop-shadow-lg">{onTargetCount}<span className="text-sm text-blue-400/70">/{leaderboard.length}</span></p>
          </div>

          {/* Live Time */}
          <div className="bg-gradient-to-br from-violet-500/20 to-purple-600/20 backdrop-blur-sm border border-violet-500/50 rounded-lg px-3 py-1.5 shadow-lg">
            <p className="text-[10px] text-violet-400 font-black flex items-center gap-1">
              <Clock className="w-3 h-3 animate-pulse" /> LIVE
            </p>
            <p className="text-base font-mono font-black text-green-400 drop-shadow-lg">
              {lastUpdated.toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'})}
            </p>
          </div>
        </div>
      </header>

      {/* LEADERBOARD */}
      <main className="flex-1 overflow-hidden flex flex-col py-3 gap-1.5 relative z-10">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              <Swords className="w-8 h-8 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        ) : (
          leaderboard.map((clinic, i) => (
            <RaceRow key={clinic.name} rank={i+1} data={clinic} maxTotal={maxTotal} />
          ))
        )}
      </main>

      {/* FOOTER */}
      <footer className="h-10 shrink-0 flex items-center justify-between px-6 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm border-t-2 border-orange-500/30 relative z-10 shadow-lg shadow-black/50">
        <div className="flex gap-6 text-[11px] text-slate-300 font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded shadow-lg shadow-green-500/50" />
            On Target
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-gradient-to-br from-red-400 to-red-600 rounded shadow-lg shadow-red-500/50" />
            Below Target
          </span>
        </div>
        <p className="text-[11px] text-amber-400 font-bold flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400 drop-shadow-lg" /> 
          <span className="text-slate-300">Hadiah:</span> Uang Tunai • SK Performa • Naik Level 🎁
        </p>
      </footer>
    </div>
  );
}

export default App;
