import { NextResponse } from 'next/server';

// Mock Beauty Center Only (No Klinik DRW)
const MOCK_CLINICS = [
  { id: 2, nama_clinic: "Beauty Center Bantul" },
  { id: 3, nama_clinic: "Beauty Center Godean" },
  { id: 4, nama_clinic: "Beauty Center Kaliurang" },
  { id: 5, nama_clinic: "Beauty Center Kotagede" },
  { id: 6, nama_clinic: "Beauty Center Maguwoharjo" },
  { id: 7, nama_clinic: "Beauty Center Muntilan" },
  { id: 8, nama_clinic: "Beauty Center Parangtritis" },
  { id: 10, nama_clinic: "Beauty Center Prambanan" },
  { id: 11, nama_clinic: "Beauty Center Wates" },
  { id: 14, nama_clinic: "Rumah Cantik Rajawali" },
];

async function fetchFromAPI(endpoint) {
  try {
    const response = await fetch(`https://clinic.beautycenter.id/api/${endpoint}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

export async function GET() {
  try {
    // Fetch from correct API endpoints
    const [clinicsData, salesData] = await Promise.all([
      fetchFromAPI('klinik'),
      fetchFromAPI('laporan-penjualan-produk')
    ]);

    let clinics = clinicsData || MOCK_CLINICS;
    let salesTransactions = salesData?.data || [];

    // Filter only Beauty Centers (exclude Klinik DRW and closed centers)
    const beautyClinsOnly = Array.isArray(clinics) 
      ? clinics.filter(c => {
          const name = c.nama_clinic || c.name || '';
          const isBeautyCenter = name.includes('Beauty Center') || name.includes('Rumah Cantik');
          const isClosed = name.includes('Piyungan'); // Beauty Center Piyungan sudah tutup
          return isBeautyCenter && !isClosed;
        })
      : MOCK_CLINICS;

    // Get today's date and calculate week/month start dates
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Start of current week (Monday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const weekStartStr = startOfWeek.toISOString().split('T')[0];
    
    // Start of current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStartStr = startOfMonth.toISOString().split('T')[0];

    // Aggregate sales by clinic
    const clinicSales = {};
    const clinicWeeklySales = {};
    const clinicMonthlySales = {};
    
    salesTransactions.forEach(transaction => {
      const transDate = transaction.tanggal_transaksi || transaction.tanggal || '';
      const dateOnly = transDate.split(' ')[0];
      const clinicName = transaction.nama_clinic;
      const amount = parseFloat(transaction.total_bayar || transaction.total || 0);
      
      // Daily (today only)
      if (dateOnly === todayStr) {
        if (!clinicSales[clinicName]) clinicSales[clinicName] = 0;
        clinicSales[clinicName] += amount;
      }
      
      // Weekly (this week)
      if (dateOnly >= weekStartStr && dateOnly <= todayStr) {
        if (!clinicWeeklySales[clinicName]) clinicWeeklySales[clinicName] = 0;
        clinicWeeklySales[clinicName] += amount;
      }
      
      // Monthly (this month)
      if (dateOnly >= monthStartStr && dateOnly <= todayStr) {
        if (!clinicMonthlySales[clinicName]) clinicMonthlySales[clinicName] = 0;
        clinicMonthlySales[clinicName] += amount;
      }
    });

    // Build leaderboard
    const leaderboard = beautyClinsOnly.map(clinic => {
      const name = clinic.nama_clinic || clinic.name;
      return {
        id: clinic.id,
        name: name,
        total: clinicSales[name] || 0,
        weeklyTotal: clinicWeeklySales[name] || 0,
        monthlyTotal: clinicMonthlySales[name] || 0
      };
    });

    // Sort by daily total descending
    leaderboard.sort((a, b) => b.total - a.total);

    return NextResponse.json(leaderboard);
    
  } catch (error) {
    console.error('Error in API route:', error);
    
    // Return mock data with random values for demo
    const mockLeaderboard = MOCK_CLINICS.map(clinic => ({
      id: clinic.id,
      name: clinic.nama_clinic,
      total: Math.floor(Math.random() * 3000000) + 1000000,
      weeklyTotal: Math.floor(Math.random() * 15000000) + 7000000,
      monthlyTotal: Math.floor(Math.random() * 50000000) + 30000000
    })).sort((a, b) => b.total - a.total);
    
    return NextResponse.json(mockLeaderboard);
  }
}
