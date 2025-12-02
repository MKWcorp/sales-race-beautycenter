'use client';

import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, AlertCircle, Zap, Target, Clock, Flame, Swords, Crown, CheckCircle, Skull, ShoppingBag, Sparkles } from 'lucide-react';

// PIC Data - Beauty Center Only
const PIC_DATA = {
  "Beauty Center Kaliurang": "Pak Eri", "Kaliurang": "Pak Eri",
  "Beauty Center Parangtritis": "Bu Hani", "Jl paris Prawirotaman": "Bu Hani",
  "Beauty Center Godean": "Bu Vera", "Godean": "Bu Vera",
  "Beauty Center Kotagede": "Pak Inu", "Kota gede": "Pak Inu",
  "Beauty Center Prambanan": "Bu Ida", "Prambanan": "Bu Ida",
  "Beauty Center Bantul": "Mas Ihsan", "bantul": "Mas Ihsan",
  "Beauty Center Maguwoharjo": "Bu Desy", "Maguwoharjo tajem": "Bu Desy",
  "Rumah Cantik Rajawali": "Pak Andri", "Rumah cantik Rajawali": "Pak Andri",
  "Beauty Center Muntilan": "Bu Ning", "Muntilan": "Bu Ning",
  "Beauty Center Wates": "TBD", "Wates": "TBD",
};

// Target Bulanan NOVEMBER 2025 - Beauty Center Only
const MONTHLY_TARGETS = {
  "Beauty Center Kaliurang": 64560000, "Kaliurang": 64560000,
  "Beauty Center Parangtritis": 76597680, "Jl paris Prawirotaman": 76597680,
  "Beauty Center Godean": 74609760, "Godean": 74609760,
  "Beauty Center Kotagede": 69834960, "Kota gede": 69834960,
  "Beauty Center Prambanan": 66057600, "Prambanan": 66057600,
  "Beauty Center Bantul": 73374040, "bantul": 73374040,
  "Beauty Center Maguwoharjo": 77970480, "Maguwoharjo tajem": 77970480,
  "Rumah Cantik Rajawali": 32650080, "Rumah cantik Rajawali": 32650080,
  "Beauty Center Muntilan": 61705400, "Muntilan": 61705400,
  "Beauty Center Wates": 69240000, "Wates": 69240000,
};

const PROGRAM_END = new Date('2026-03-01');
// November 2025 = 30 hari
const DAYS_IN_NOVEMBER = 30;
const getDailyTarget = (name) => Math.round((MONTHLY_TARGETS[name] || 50000000) / DAYS_IN_NOVEMBER);
const getWeeklyTarget = (name) => getDailyTarget(name) * 7;
const getMonthlyTarget = (name) => MONTHLY_TARGETS[name] || 50000000;
const getPIC = (name) => PIC_DATA[name] || "TBD";
const getRemainingDays = () => Math.max(0, Math.ceil((PROGRAM_END - new Date()) / 86400000));

// Format Rupiah normal tanpa sensor
const formatRupiah = (amount) => {
  if (!amount || amount === 0) return '0';
  return amount.toLocaleString('id-ID');
};

// Row Component
const RaceRow = ({ rank, data }) => {
  const target = getDailyTarget(data.name);
  const weeklyTarget = getWeeklyTarget(data.name);
  const monthlyTarget = getMonthlyTarget(data.name);
    // Use 100% as target (not 70%)
  const dailyThreshold = target;
  const weeklyThreshold = weeklyTarget;
  const monthlyThreshold = monthlyTarget;
  
  // Calculate achievements
  const dailyAchievement = target > 0 ? Math.round((data.total / target) * 100) : 0;
  const weeklyAchievement = weeklyTarget > 0 ? Math.round((data.weeklyTotal / weeklyTarget) * 100) : 0;
  const monthlyAchievement = monthlyTarget > 0 ? Math.round((data.monthlyTotal / monthlyTarget) * 100) : 0;
  
  // Bar length based on DAILY achievement (0-100%)
  // If daily = 0, bar kosong. If daily = 100% target, bar penuh.
  const percent = Math.min(dailyAchievement, 100);
  
  // Bar color based on DAILY achievement only
  // Green: >=80%, Yellow: 70-79%, Red: <70%
  let barColor = 'red'; // default
  if (dailyAchievement >= 80) {
    barColor = 'green';
  } else if (dailyAchievement >= 70) {
    barColor = 'yellow';
  }
  
  const isOnTarget = barColor !== 'red'; // For ring border (green/yellow vs red)
  const pic = getPIC(data.name);

  const getRankStyle = () => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/50';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-black shadow-lg shadow-gray-400/50';
    if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg shadow-amber-600/50';
    return 'bg-slate-700 text-slate-300';
  };

  return (
    <div className="flex items-center gap-2 px-2 w-full">
      {/* Rank Badge */}
      <div className={`w-12 h-12 flex items-center justify-center rounded-lg font-black text-lg shrink-0 relative ${getRankStyle()}`}>
        {rank === 1 && <Crown className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />}
        {rank}
      </div>

      {/* Main Bar - Full Width */}
      <div className={`flex-1 h-20 rounded-lg relative overflow-hidden flex items-center px-4 transition-all duration-300
        ${barColor === 'green' ? 'bg-gradient-to-r from-slate-800 to-slate-900 ring-2 ring-green-500/70 shadow-lg shadow-green-500/20' : 
          barColor === 'yellow' ? 'bg-gradient-to-r from-slate-800 to-slate-900 ring-2 ring-yellow-500/70 shadow-lg shadow-yellow-500/20' :
          'bg-gradient-to-r from-slate-800 to-slate-900 ring-2 ring-red-500/70 shadow-lg shadow-red-500/20'}`}>
        
        {/* Animated Fill */}
        <div 
          className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out 
            ${barColor === 'green' ? 'bg-gradient-to-r from-green-600/40 via-green-500/30 to-green-600/20' : 
              barColor === 'yellow' ? 'bg-gradient-to-r from-yellow-600/40 via-yellow-500/30 to-yellow-600/20' :
              'bg-gradient-to-r from-red-600/40 via-red-500/30 to-red-600/20'}`}
          style={{ width: `${percent}%` }}
        />
        
        {/* Glowing Bottom Accent */}
        <div 
          className={`absolute bottom-0 left-0 h-2 transition-all duration-1000 ease-out 
            ${barColor === 'green' ? 'bg-gradient-to-r from-green-400 to-green-600 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
              barColor === 'yellow' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-[0_0_10px_rgba(234,179,8,0.5)]' :
              'bg-gradient-to-r from-red-400 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}
          style={{ width: `${percent}%` }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between w-full gap-3">
          {/* Clinic Info */}
          <div className="flex-shrink-0 w-[200px]">
            <p className="font-black text-base text-white drop-shadow-md truncate leading-tight">{data.name}</p>
            <p className="text-amber-400 text-xs font-semibold mt-1">👤 {pic}</p>
          </div>

          {/* Daily Target */}
          <div className="flex flex-col items-center shrink-0 w-[200px]">
            <div className="flex items-center gap-2">
              {dailyAchievement >= 80 ? (
                <span className="text-2xl drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">👍</span>
              ) : dailyAchievement >= 70 ? (
                <CheckCircle className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
              ) : (
                <Skull className="w-5 h-5 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              )}
              <div className="text-right">
                <p className={`text-sm font-bold leading-tight ${
                  dailyAchievement >= 80 ? 'text-green-400' : 
                  dailyAchievement >= 70 ? 'text-yellow-400' : 
                  'text-red-400'
                }`}>
                  {formatRupiah(data.total)}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  /{formatRupiah(dailyThreshold)}
                </p>
              </div>
            </div>
            {/* Product & Treatment breakdown for Daily */}
            <div className="flex gap-3 mt-1">
              <div className="flex items-center gap-1">
                <ShoppingBag className="w-3 h-3 text-blue-400" />
                <span className="text-[9px] text-blue-400 font-bold">
                  {formatRupiah(data.productTotal || 0)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-[9px] text-purple-400 font-bold">
                  {formatRupiah(data.treatmentTotal || 0)}
                </span>
              </div>
            </div>
            <span className="text-[9px] text-slate-400 font-semibold mt-1">HARI INI</span>
          </div>

          {/* Weekly Target */}
          <div className="flex flex-col items-center shrink-0 w-[200px]">
            <div className="flex items-center gap-2">
              {weeklyAchievement >= 80 ? (
                <span className="text-2xl drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">👍</span>
              ) : weeklyAchievement >= 70 ? (
                <CheckCircle className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
              ) : (
                <Skull className="w-5 h-5 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              )}
              <div className="text-right">
                <p className={`text-sm font-bold leading-tight ${
                  weeklyAchievement >= 80 ? 'text-green-400' : 
                  weeklyAchievement >= 70 ? 'text-yellow-400' : 
                  'text-red-400'
                }`}>
                  {formatRupiah(data.weeklyTotal)}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  /{formatRupiah(weeklyThreshold)}
                </p>
              </div>
            </div>
            {/* Product & Treatment breakdown for Weekly */}
            <div className="flex gap-3 mt-1">
              <div className="flex items-center gap-1">
                <ShoppingBag className="w-3 h-3 text-blue-400" />
                <span className="text-[9px] text-blue-400 font-bold">
                  {formatRupiah(data.weeklyProductTotal || 0)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-[9px] text-purple-400 font-bold">
                  {formatRupiah(data.weeklyTreatmentTotal || 0)}
                </span>
              </div>
            </div>
            <span className="text-[9px] text-slate-400 font-semibold mt-1">MINGGU INI</span>
          </div>

          {/* Monthly Target */}
          <div className="flex flex-col items-center shrink-0 w-[200px]">
            <div className="flex items-center gap-2">
              {monthlyAchievement >= 80 ? (
                <span className="text-2xl drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">👍</span>
              ) : monthlyAchievement >= 70 ? (
                <CheckCircle className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
              ) : (
                <Skull className="w-5 h-5 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              )}
              <div className="text-right">
                <p className={`text-sm font-bold leading-tight ${
                  monthlyAchievement >= 80 ? 'text-green-400' : 
                  monthlyAchievement >= 70 ? 'text-yellow-400' : 
                  'text-red-400'
                }`}>
                  {formatRupiah(data.monthlyTotal)}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  /{formatRupiah(monthlyThreshold)}
                </p>
              </div>
            </div>
            {/* Product & Treatment breakdown for Monthly */}
            <div className="flex gap-3 mt-1">
              <div className="flex items-center gap-1">
                <ShoppingBag className="w-3 h-3 text-blue-400" />
                <span className="text-[9px] text-blue-400 font-bold">
                  {formatRupiah(data.monthlyProductTotal || 0)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-[9px] text-purple-400 font-bold">
                  {formatRupiah(data.monthlyTreatmentTotal || 0)}
                </span>
              </div>
            </div>
            <span className="text-[9px] text-slate-400 font-semibold mt-1">BULAN INI</span>
          </div>

          {/* Achievement Badges - 3 columns */}
          <div className="flex flex-col gap-1 shrink-0">
            {/* Daily Achievement */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-400 font-bold w-14">Harian:</span>
              <div className={`px-2 py-0.5 rounded text-[10px] font-black shadow-md
                ${dailyAchievement >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 
                  dailyAchievement >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black' : 
                  'bg-gradient-to-r from-red-500 to-red-600 text-white'}`}>
                {dailyAchievement}%
              </div>
            </div>
            {/* Weekly Achievement */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-400 font-bold w-14">Mingguan:</span>
              <div className={`px-2 py-0.5 rounded text-[10px] font-black shadow-md
                ${weeklyAchievement >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 
                  weeklyAchievement >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black' : 
                  'bg-gradient-to-r from-red-500 to-red-600 text-white'}`}>
                {weeklyAchievement}%
              </div>
            </div>
            {/* Monthly Achievement */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-400 font-bold w-14">Bulanan:</span>
              <div className={`px-2 py-0.5 rounded text-[10px] font-black shadow-md
                ${monthlyAchievement >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 
                  monthlyAchievement >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black' : 
                  'bg-gradient-to-r from-red-500 to-red-600 text-white'}`}>
                {monthlyAchievement}%
              </div>
            </div>
          </div>

          {/* Status Icon */}
          <div className="shrink-0">
            {barColor === 'green' ? 
              <TrendingUp className="w-6 h-6 text-green-400 drop-shadow-[0_0_6px_rgba(34,197,94,0.8)]" /> : 
              barColor === 'yellow' ?
              <TrendingUp className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_6px_rgba(234,179,8,0.8)]" /> :
              <AlertCircle className="w-6 h-6 text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
            }
          </div>
        </div>
      </div>
    </div>
  );
};

function Dashboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    try {
      const res = await fetch('/api/sales');
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      setLeaderboard(data);
      setLoading(false);
      setError(false);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      setError(true);
    }
  };
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalDailyRevenue = leaderboard.reduce((s, c) => s + c.total, 0);
  const totalWeeklyRevenue = leaderboard.reduce((s, c) => s + c.weeklyTotal, 0);
  const totalMonthlyRevenue = leaderboard.reduce((s, c) => s + c.monthlyTotal, 0);
  
  // On target count based on monthly achievement >= 80% (green)
  const onTargetCount = leaderboard.filter(c => {
    const monthlyTarget = getMonthlyTarget(c.name);
    const monthlyAchievement = monthlyTarget > 0 ? Math.round((c.monthlyTotal / monthlyTarget) * 100) : 0;
    return monthlyAchievement >= 80;
  }).length;
  
  const remaining = getRemainingDays();
  
  // Get current period (month name)
  const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col relative overflow-hidden m-0 p-0">
      
      {/* Background Battle Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.03) 35px, rgba(255,255,255,.03) 70px)',
        }} />
      </div>

      {/* HEADER */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm border-b-2 border-orange-500/30 relative z-10 shadow-lg shadow-black/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-600 to-orange-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/50 animate-pulse">
            <Swords className="w-7 h-7 text-white drop-shadow-lg" />
          </div>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
              BATTLE BUSINESS GAME
            </h1>
            <p className="text-[11px] text-slate-400 font-semibold">🏆 Program 90 Hari Challenge • Supervisor: Bu Putri • Periode: {currentMonth}</p>
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
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-sm border border-blue-500/50 rounded-lg px-3 py-1.5 shadow-lg">
            <p className="text-[10px] text-blue-400 font-black flex items-center gap-1">
              <Zap className="w-3 h-3" /> HARI INI
            </p>
            <p className="text-sm font-black text-blue-300 drop-shadow-lg">Rp {formatRupiah(totalDailyRevenue)}</p>
          </div>

          {/* Minggu Ini */}
          <div className="bg-gradient-to-br from-purple-500/20 to-violet-600/20 backdrop-blur-sm border border-purple-500/50 rounded-lg px-3 py-1.5 shadow-lg">
            <p className="text-[10px] text-purple-400 font-black flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> MINGGU INI
            </p>
            <p className="text-sm font-black text-purple-300 drop-shadow-lg">Rp {formatRupiah(totalWeeklyRevenue)}</p>
          </div>

          {/* Bulan Ini */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/50 rounded-lg px-3 py-1.5 shadow-lg">
            <p className="text-[10px] text-green-400 font-black flex items-center gap-1">
              <Target className="w-3 h-3" /> BULAN INI
            </p>
            <p className="text-sm font-black text-green-300 drop-shadow-lg">Rp {formatRupiah(totalMonthlyRevenue)}</p>
          </div>

          {/* On Target */}
          <div className="bg-gradient-to-br from-amber-500/20 to-yellow-600/20 backdrop-blur-sm border border-amber-500/50 rounded-lg px-3 py-1.5 shadow-lg">
            <p className="text-[10px] text-amber-400 font-black flex items-center gap-1">
              👍 TARGET HIJAU
            </p>
            <p className="text-xl font-black text-amber-300 drop-shadow-lg">{onTargetCount}<span className="text-sm text-amber-400/70">/{leaderboard.length}</span></p>
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
      <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col py-2 gap-1 relative z-10 px-2">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              <Swords className="w-8 h-8 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-black text-red-400 mb-2">GAGAL AMBIL DATA</h2>
              <p className="text-slate-400 mb-4">Tidak dapat terhubung ke server</p>
              <button 
                onClick={fetchData}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-bold hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
              >
                🔄 Coba Lagi
              </button>
            </div>
          </div>        ) : (
          leaderboard.map((clinic, i) => (
            <RaceRow 
              key={clinic.name} 
              rank={i+1} 
              data={clinic}
            />
          ))
        )}
      </main>

      {/* FOOTER */}      <footer className="h-8 shrink-0 flex items-center justify-between px-4 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm border-t-2 border-orange-500/30 relative z-10 shadow-lg shadow-black/50">
        <div className="flex gap-6 text-[11px] text-slate-300 font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded shadow-lg shadow-green-500/50" />
            ≥80% Target Harian
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded shadow-lg shadow-yellow-500/50" />
            70-79% Target Harian
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-gradient-to-br from-red-400 to-red-600 rounded shadow-lg shadow-red-500/50" />
            &lt;70% Target Harian
          </span>
          <span className="flex items-center gap-1.5">
            <ShoppingBag className="w-3 h-3 text-blue-400" />
            Produk
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Treatment
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

export default Dashboard;
