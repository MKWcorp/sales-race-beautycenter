'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
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
const RaceRow = ({ rank, data, filter }) => {
  const target = getDailyTarget(data.name);
  const weeklyTarget = getWeeklyTarget(data.name);
  const monthlyTarget = getMonthlyTarget(data.name);
  
  // Get target based on filter
  let currentTarget = target;
  if (filter === 'weekly') currentTarget = weeklyTarget;
  else if (filter === 'monthly') currentTarget = monthlyTarget;
  else if (filter === 'yearly') currentTarget = monthlyTarget * 12; // Approximate yearly target
  
  // Calculate achievement
  const achievement = currentTarget > 0 ? Math.round((data.total / currentTarget) * 100) : 0;
  
  // Bar length based on achievement (0-100%)
  const percent = Math.min(achievement, 100);
  
  // Bar color based on achievement
  // Green: >=80%, Yellow: 70-79%, Red: <70%
  let barColor = 'red'; // default
  if (achievement >= 80) {
    barColor = 'green';
  } else if (achievement >= 70) {
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
    <div className="flex items-center gap-1.5 md:gap-2 px-1 md:px-2 w-full">
      {/* Rank Badge */}
      <div className={`w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-lg font-black text-sm md:text-lg shrink-0 relative ${getRankStyle()}`}>
        {rank === 1 && <Crown className="w-3 h-3 md:w-4 md:h-4 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />}
        {rank}
      </div>

      {/* Main Bar - Full Width */}
      <div className={`flex-1 min-h-[80px] md:h-20 rounded-lg relative overflow-hidden flex items-center px-2 md:px-4 py-2 md:py-0 transition-all duration-300
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
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-2 md:gap-3">
          {/* Clinic Info */}
          <div className="flex-shrink-0 w-full md:w-[200px]">
            <p className="font-black text-sm md:text-base text-white drop-shadow-md truncate leading-tight">{data.name}</p>
            <p className="text-amber-400 text-[10px] md:text-xs font-semibold mt-0.5 md:mt-1">👤 {pic}</p>
          </div>

          {/* Main Stats - Single column based on filter */}
          <div className="flex flex-col items-start md:items-center shrink-0 w-full md:w-[220px]">
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
              {achievement >= 80 ? (
                <span className="text-xl md:text-2xl drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">👍</span>
              ) : achievement >= 70 ? (
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
              ) : (
                <Skull className="w-4 h-4 md:w-5 md:h-5 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              )}
              <div className="text-right flex-1 md:flex-initial">
                <p className={`text-xs md:text-sm font-bold leading-tight ${
                  achievement >= 80 ? 'text-green-400' : 
                  achievement >= 70 ? 'text-yellow-400' : 
                  'text-red-400'
                }`}>
                  {formatRupiah(data.total)}
                </p>
                <p className="text-[9px] md:text-[10px] text-slate-500 leading-tight">
                  /{formatRupiah(currentTarget)}
                </p>
              </div>
              {/* Achievement Badge - Mobile */}
              <div className="md:hidden">
                <div className={`px-2.5 py-1 rounded text-xs font-black shadow-md
                  ${achievement >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 
                    achievement >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black' : 
                    'bg-gradient-to-r from-red-500 to-red-600 text-white'}`}>
                  {achievement}%
                </div>
              </div>
            </div>
            {/* Product & Treatment breakdown */}
            <div className="flex gap-2 md:gap-3 mt-1 w-full md:w-auto justify-start">
              <div className="flex items-center gap-1">
                <ShoppingBag className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-400" />
                <span className="text-[8px] md:text-[9px] text-blue-400 font-bold">
                  {formatRupiah(data.productTotal || 0)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-400" />
                <span className="text-[8px] md:text-[9px] text-purple-400 font-bold">
                  {formatRupiah(data.treatmentTotal || 0)}
                </span>
              </div>
            </div>
            <span className="text-[8px] md:text-[9px] text-slate-400 font-semibold mt-0.5 md:mt-1 uppercase">
              {filter === 'daily' && 'HARI INI'}
              {filter === 'weekly' && 'MINGGU INI'}
              {filter === 'monthly' && 'BULAN INI'}
              {filter === 'yearly' && 'TAHUN INI'}
            </span>
          </div>

          {/* Achievement Badge - Desktop */}
          <div className="hidden md:flex flex-col gap-1 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-slate-400 font-bold w-20 uppercase">
                {filter === 'daily' && 'Harian:'}
                {filter === 'weekly' && 'Mingguan:'}
                {filter === 'monthly' && 'Bulanan:'}
                {filter === 'yearly' && 'Tahunan:'}
              </span>
              <div className={`px-3 py-1 rounded text-sm md:text-base font-black shadow-md
                ${achievement >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 
                  achievement >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black' : 
                  'bg-gradient-to-r from-red-500 to-red-600 text-white'}`}>
                {achievement}%
              </div>
            </div>
          </div>

          {/* Status Icon - Desktop only */}
          <div className="hidden md:block shrink-0">
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
  const [filter, setFilter] = useState('daily'); // daily, weekly, monthly, yearly
  
  // Loading progress
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentClinic, setCurrentClinic] = useState('');
  const [totalClinics, setTotalClinics] = useState(0);
  
  // Date/Period selectors
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // For daily
  const [selectedWeek, setSelectedWeek] = useState(1); // Week 1-4
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // 2022-current

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadingProgress(0);
    setCurrentClinic('');
    setError(false);
    
    try {
      let url = `/api/sales-progress?filter=${filter}`;
      
      // Add period parameters based on filter
      if (filter === 'daily') {
        url += `&date=${selectedDate}`;
      } else if (filter === 'weekly') {
        url += `&week=${selectedWeek}&month=${selectedMonth}&year=${selectedYear}`;
      } else if (filter === 'monthly') {
        url += `&month=${selectedMonth}&year=${selectedYear}`;
      } else if (filter === 'yearly') {
        url += `&year=${selectedYear}`;
      }
      
      console.log('Fetching URL:', url);
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('API request failed');
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'progress') {
              setCurrentClinic(data.clinic);
              setLoadingProgress(data.progress);
              setTotalClinics(data.total);
            } else if (data.type === 'complete') {
              setLeaderboard(data.data);
              setLoading(false);
              setLastUpdated(new Date());
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      setError(true);
    }
  }, [filter, selectedDate, selectedWeek, selectedMonth, selectedYear]);
  
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1800000); // 30 minutes
    return () => clearInterval(interval);
  }, [fetchData]);

  // Sort leaderboard by achievement percentage (highest first)
  const sortedLeaderboard = useMemo(() => {
    if (loading || leaderboard.length === 0) return [];
    
    return [...leaderboard].sort((a, b) => {
      // Calculate target for each clinic based on current filter
      const targetA = filter === 'daily' ? getDailyTarget(a.name) :
                      filter === 'weekly' ? getWeeklyTarget(a.name) :
                      filter === 'monthly' ? getMonthlyTarget(a.name) :
                      getMonthlyTarget(a.name) * 12; // yearly
      
      const targetB = filter === 'daily' ? getDailyTarget(b.name) :
                      filter === 'weekly' ? getWeeklyTarget(b.name) :
                      filter === 'monthly' ? getMonthlyTarget(b.name) :
                      getMonthlyTarget(b.name) * 12; // yearly
      
      // Calculate achievement percentage
      const achievementA = targetA > 0 ? (a.total / targetA) * 100 : 0;
      const achievementB = targetB > 0 ? (b.total / targetB) * 100 : 0;
      
      // Sort by achievement percentage (highest first)
      return achievementB - achievementA;
    });
  }, [leaderboard, loading, filter]);

  const totalRevenue = loading ? 0 : sortedLeaderboard.reduce((s, c) => s + c.total, 0);
  
  // On target count based on achievement >= 80% (green)
  const onTargetCount = loading ? 0 : sortedLeaderboard.filter(c => {
    const target = filter === 'daily' ? getDailyTarget(c.name) :
                   filter === 'weekly' ? getWeeklyTarget(c.name) :
                   filter === 'monthly' ? getMonthlyTarget(c.name) :
                   getMonthlyTarget(c.name) * 12; // yearly
    const achievement = target > 0 ? Math.round((c.total / target) * 100) : 0;
    return achievement >= 80;
  }).length;
  
  const remaining = getRemainingDays();
  
  // Get current period (month name)
  const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col relative overflow-x-hidden m-0 p-0">
      
      {/* Background Battle Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.03) 35px, rgba(255,255,255,.03) 70px)',
        }} />
      </div>

      {/* HEADER - COMPACT SINGLE ROW */}
      <header className="shrink-0 flex items-center gap-2 px-2 md:px-3 lg:px-4 py-1.5 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm border-b-2 border-orange-500/30 relative z-10 shadow-lg shadow-black/50 overflow-x-auto">
        {/* Icon + Title */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-7 h-7 bg-gradient-to-br from-orange-500 via-red-600 to-orange-700 rounded-lg flex items-center justify-center shadow-lg shadow-orange-600/50 animate-pulse">
            <Swords className="w-4 h-4 text-white drop-shadow-lg" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[10px] md:text-xs lg:text-sm font-black bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-clip-text text-transparent whitespace-nowrap">
              BATTLE BUSINESS GAME
            </h1>
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-0.5 shrink-0">
          <button
            onClick={() => setFilter('daily')}
            className={`px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold transition-all ${
              filter === 'daily' 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/50' 
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
            }`}
          >
            HARIAN
          </button>
          <button
            onClick={() => setFilter('weekly')}
            className={`px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold transition-all ${
              filter === 'weekly' 
                ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/50' 
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
            }`}
          >
            MINGGUAN
          </button>
          <button
            onClick={() => setFilter('monthly')}
            className={`px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold transition-all ${
              filter === 'monthly' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50' 
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
            }`}
          >
            BULANAN
          </button>
          <button
            onClick={() => setFilter('yearly')}
            className={`px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold transition-all ${
              filter === 'yearly' 
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/50' 
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
            }`}
          >
            TAHUNAN
          </button>
        </div>

        {/* Period Selector - Inline */}
        <div className="flex items-center gap-1.5 shrink-0">
          {filter === 'daily' && (
            <>
              <span className="text-[9px] text-slate-400">Tgl:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-1.5 py-0.5 rounded bg-slate-700/50 text-white text-[9px] border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </>
          )}
          
          {filter === 'weekly' && (
            <>
              <span className="text-[9px] text-slate-400">Minggu:</span>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                className="px-1.5 py-0.5 rounded bg-slate-700/50 text-white text-[9px] border border-slate-600 focus:border-purple-500 focus:outline-none"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-1.5 py-0.5 rounded bg-slate-700/50 text-white text-[9px] border border-slate-600 focus:border-purple-500 focus:outline-none"
              >
                <option value="1">Jan</option>
                <option value="2">Feb</option>
                <option value="3">Mar</option>
                <option value="4">Apr</option>
                <option value="5">Mei</option>
                <option value="6">Jun</option>
                <option value="7">Jul</option>
                <option value="8">Agu</option>
                <option value="9">Sep</option>
                <option value="10">Okt</option>
                <option value="11">Nov</option>
                <option value="12">Des</option>
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-1.5 py-0.5 rounded bg-slate-700/50 text-white text-[9px] border border-slate-600 focus:border-purple-500 focus:outline-none"
              >
                {[2022, 2023, 2024, 2025].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </>
          )}
          
          {filter === 'monthly' && (
            <>
              <span className="text-[9px] text-slate-400">Bulan:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-1.5 py-0.5 rounded bg-slate-700/50 text-white text-[9px] border border-slate-600 focus:border-green-500 focus:outline-none"
              >
                <option value="1">Jan</option>
                <option value="2">Feb</option>
                <option value="3">Mar</option>
                <option value="4">Apr</option>
                <option value="5">Mei</option>
                <option value="6">Jun</option>
                <option value="7">Jul</option>
                <option value="8">Agu</option>
                <option value="9">Sep</option>
                <option value="10">Okt</option>
                <option value="11">Nov</option>
                <option value="12">Des</option>
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-1.5 py-0.5 rounded bg-slate-700/50 text-white text-[9px] border border-slate-600 focus:border-green-500 focus:outline-none"
              >
                {[2022, 2023, 2024, 2025].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </>
          )}
          
          {filter === 'yearly' && (
            <>
              <span className="text-[9px] text-slate-400">Tahun:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-1.5 py-0.5 rounded bg-slate-700/50 text-white text-[9px] border border-slate-600 focus:border-amber-500 focus:outline-none"
              >
                {[2022, 2023, 2024, 2025].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* Stats - Inline */}
        {!loading && (
          <div className="flex items-center gap-1 shrink-0 ml-auto">
            {/* Sisa Hari */}
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-500/20 border border-orange-500/50 rounded text-[8px]">
              <Flame className="w-2.5 h-2.5 text-orange-400" />
              <span className="font-bold text-orange-300">{remaining}</span>
            </div>

            {/* Total Revenue */}
            <div className={`flex items-center gap-0.5 px-1.5 py-0.5 border rounded text-[8px] ${
              filter === 'daily' ? 'bg-blue-500/20 border-blue-500/50' :
              filter === 'weekly' ? 'bg-purple-500/20 border-purple-500/50' :
              filter === 'monthly' ? 'bg-green-500/20 border-green-500/50' :
              'bg-amber-500/20 border-amber-500/50'
            }`}>
              <span className={`font-bold ${
                filter === 'daily' ? 'text-blue-300' :
                filter === 'weekly' ? 'text-purple-300' :
                filter === 'monthly' ? 'text-green-300' :
                'text-amber-300'
              }`}>
                Rp {formatRupiah(totalRevenue)}
              </span>
            </div>

            {/* On Target */}
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/50 rounded text-[8px]">
              <span className="font-bold text-amber-300">{onTargetCount}/{leaderboard.length}</span>
            </div>

            {/* Live Time */}
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-violet-500/20 border border-violet-500/50 rounded text-[8px]">
              <Clock className="w-2.5 h-2.5 text-violet-400 animate-pulse" />
              <span className="font-mono font-bold text-green-400">
                {lastUpdated.toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'})}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* LEADERBOARD */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col py-2 gap-1 relative z-10 px-2">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-2xl px-4">
              {/* Progress Bar */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                    <Swords className="w-6 h-6 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-white mb-1">Memuat Data Sales...</h3>
                    {currentClinic && (
                      <p className="text-sm text-slate-400">
                        📍 Fetching: <span className="text-orange-400 font-semibold">{currentClinic}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full h-4 bg-slate-900/50 rounded-full overflow-hidden border border-slate-700/50">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 transition-all duration-300 ease-out relative"
                      style={{ width: `${loadingProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-slate-400 font-semibold">
                      {Math.round(loadingProgress)}% Complete
                    </span>
                    {totalClinics > 0 && (
                      <span className="text-slate-400 font-semibold">
                        {Math.ceil((loadingProgress / 100) * totalClinics)} / {totalClinics} Klinik
                      </span>
                    )}
                  </div>
                </div>
              </div>
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
          sortedLeaderboard.map((clinic, i) => (
            <RaceRow 
              key={clinic.name} 
              rank={i+1} 
              data={clinic}
              filter={filter}
            />
          ))
        )}
      </main>

      {/* FOOTER */}
      <footer className="h-auto md:h-8 shrink-0 flex flex-col md:flex-row items-center justify-between px-2 md:px-4 py-2 md:py-0 gap-2 md:gap-0 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm border-t-2 border-orange-500/30 relative z-10 shadow-lg shadow-black/50">
        <div className="flex flex-wrap gap-2 md:gap-6 text-[8px] md:text-[11px] text-slate-300 font-semibold justify-center md:justify-start">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-br from-green-400 to-green-600 rounded shadow-lg shadow-green-500/50" />
            ≥80%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded shadow-lg shadow-yellow-500/50" />
            70-79%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-br from-red-400 to-red-600 rounded shadow-lg shadow-red-500/50" />
            &lt;70%
          </span>
          <span className="flex items-center gap-1">
            <ShoppingBag className="w-2 h-2 md:w-3 md:h-3 text-blue-400" />
            Produk
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-2 h-2 md:w-3 md:h-3 text-purple-400" />
            Treatment
          </span>
        </div>
        <p className="text-[8px] md:text-[11px] text-amber-400 font-bold flex items-center gap-1 md:gap-2">
          <Trophy className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 drop-shadow-lg" /> 
          <span className="text-slate-300 hidden md:inline">Hadiah:</span> Uang Tunai • SK • Naik Level 🎁
        </p>
      </footer>
    </div>
  );
}

export default Dashboard;
