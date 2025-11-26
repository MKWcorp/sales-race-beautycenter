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

// ============ IN-MEMORY CACHE ============
let cachedData = null;
let cacheTimestamp = null;
let fetchPromise = null; // Track ongoing fetch
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

function isCacheValid() {
  if (!cachedData || !cacheTimestamp) return false;
  const now = Date.now();
  const age = now - cacheTimestamp;
  return age < CACHE_DURATION;
}

function setCache(data) {
  cachedData = data;
  cacheTimestamp = Date.now();
  fetchPromise = null; // Clear the promise
  console.log('✅ Cache updated at:', new Date(cacheTimestamp).toLocaleTimeString('id-ID'));
}

function getCache() {
  if (isCacheValid()) {
    const ageSeconds = Math.floor((Date.now() - cacheTimestamp) / 1000);
    console.log(`📦 Serving from cache (age: ${ageSeconds}s)`);
    return cachedData;
  }
  return null;
}

// Helper to get date in YYYY-MM-DD format for WIB (UTC+7)
function getWIBDate(date = new Date()) {
  const utcOffset = 7 * 60; // 7 hours in minutes
  const localTime = new Date(date.getTime() + (utcOffset * 60 * 1000));
  return localTime.toISOString().split('T')[0];
}

function getWIBDateObj(date = new Date()) {
  const utcOffset = 7 * 60; // 7 hours in minutes
  return new Date(date.getTime() + (utcOffset * 60 * 1000));
}

async function fetchWithParams(endpoint, params) {
  let allData = [];
  let page = 1;
  let hasMorePages = true;
  const maxPages = 50; // Safety limit for monthly data

  // Construct base query params
  const queryParams = new URLSearchParams(params);

  while (hasMorePages && page <= maxPages) {
    // Update page parameter
    queryParams.set('page', page.toString());
    const url = `https://clinic.beautycenter.id/api/${endpoint}?${queryParams.toString()}`;
    
    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      });
      
      if (response.status === 429) {
        console.log(`⚠️ Rate limit hit for ${endpoint} page ${page}, waiting 3s...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Retry the same page
        continue;
      }
      
      if (!response.ok) {
        console.error(`API Error ${response.status} for ${url}`);
        break;
      }
      
      const result = await response.json();
      const data = result?.data || [];
      
      if (data.length > 0) {
        allData = allData.concat(data);
        
        if (result.next_page_url) {
          page++;
          // Minimal delay since rate limit is now 500/min
          await new Promise(resolve => setTimeout(resolve, 150));
        } else {
          hasMorePages = false;
        }
      } else {
        hasMorePages = false;
      }
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      break;
    }
  }

  return allData;
}

async function fetchClinics() {
  try {
    const response = await fetch('https://clinic.beautycenter.id/api/klinik', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching clinics:', error);
    return MOCK_CLINICS;
  }
}

export async function GET() {
  try {
    // Check cache first
    const cached = getCache();
    if (cached) {
      return NextResponse.json(cached);
    }

    // If already fetching, wait for that promise
    if (fetchPromise) {
      console.log('⏳ Fetch in progress, waiting for result...');
      const result = await fetchPromise;
      return NextResponse.json(result);
    }

    console.log('🔄 Cache expired or empty, fetching fresh data...');

    // Create new fetch promise
    fetchPromise = fetchLeaderboardData();
    const leaderboard = await fetchPromise;

    // Store in cache
    setCache(leaderboard);

    return NextResponse.json(leaderboard);

  } catch (error) {
    console.error('Error in API route:', error);
    fetchPromise = null; // Clear promise on error
    // If error but cache exists, return stale cache
    if (cachedData) {
      console.log('⚠️ Error occurred, serving stale cache');
      return NextResponse.json(cachedData);
    }
    return NextResponse.json([]);
  }
}

async function fetchLeaderboardData() {
  try {
    const clinicsData = await fetchClinics();
    let clinics = clinicsData || MOCK_CLINICS;

    // Filter only Beauty Centers
    const beautyClinsOnly = Array.isArray(clinics) 
      ? clinics.filter(c => {
          const name = c.nama_clinic || c.name || '';
          const isBeautyCenter = name.includes('Beauty Center') || name.includes('Rumah Cantik');
          const isClosed = name.includes('Piyungan'); 
          return isBeautyCenter && !isClosed;
        })
      : MOCK_CLINICS;

    // 2. Calculate Date Ranges (WIB)
    const todayObj = getWIBDateObj();
    const todayStr = todayObj.toISOString().split('T')[0]; // YYYY-MM-DD

    // Start of Month
    const startOfMonthObj = new Date(todayObj.getFullYear(), todayObj.getMonth(), 1);
    const startOfMonthStr = startOfMonthObj.toISOString().split('T')[0];

    // Start of Week (Monday)
    const startOfWeekObj = new Date(todayObj);
    const dayOfWeek = todayObj.getDay(); // 0 = Sunday
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; 
    startOfWeekObj.setDate(todayObj.getDate() + diff);
    const startOfWeekStr = startOfWeekObj.toISOString().split('T')[0];

    console.log(`Fetching data from ${startOfMonthStr} to ${todayStr}`);

    // 3. Fetch Data for each clinic
    // We fetch "This Month" data, which includes "Today" and "This Week"
    const leaderboard = [];

    for (const clinic of beautyClinsOnly) {
      const clinicId = clinic.id;
      const clinicName = clinic.nama_clinic || clinic.name;
      
      console.log(`📍 Processing ${clinicName} (ID: ${clinicId})...`);

      // Fetch Products
      const productParams = {
        nama_cabang: clinicId,
        dari_tanggal: startOfMonthStr,
        sampai_tanggal: todayStr
      };
      
      // Fetch Treatments
      const treatmentParams = {
        klinik: clinicId,
        dari_tanggal: startOfMonthStr,
        sampai_tanggal: todayStr
      };

      // Fetch SEQUENTIALLY to avoid rate limiting
      const products = await fetchWithParams('laporan-penjualan-produk', productParams);
      // Minimal delay since rate limit is now 500/min
      await new Promise(resolve => setTimeout(resolve, 200));
      const treatments = await fetchWithParams('laporan-penjualan-perawatan', treatmentParams);

      // Aggregate Data
      let dailyTotal = 0;
      let weeklyTotal = 0;
      let monthlyTotal = 0;
      
      let dailyProduct = 0;
      let weeklyProduct = 0;
      let monthlyProduct = 0;
      
      let dailyTreatment = 0;
      let weeklyTreatment = 0;
      let monthlyTreatment = 0;

      // Process Products
      products.forEach(p => {
        const date = (p.created_at || p.tanggal_transaksi || '').split(' ')[0];
        const amount = parseFloat(p.total_bayar || 0);
        
        if (date >= startOfMonthStr && date <= todayStr) {
          monthlyProduct += amount;
          monthlyTotal += amount;
        }
        if (date >= startOfWeekStr && date <= todayStr) {
          weeklyProduct += amount;
          weeklyTotal += amount;
        }
        if (date === todayStr) {
          dailyProduct += amount;
          dailyTotal += amount;
        }
      });

      // Process Treatments
      treatments.forEach(t => {
        const date = (t.created_at || '').split(' ')[0]; // Treatment date format check needed? Assuming YYYY-MM-DD
        const amount = parseFloat(t.total_pembayaran || 0); // Note: total_pembayaran for treatments

        if (date >= startOfMonthStr && date <= todayStr) {
          monthlyTreatment += amount;
          monthlyTotal += amount;
        }
        if (date >= startOfWeekStr && date <= todayStr) {
          weeklyTreatment += amount;
          weeklyTotal += amount;
        }
        if (date === todayStr) {
          dailyTreatment += amount;
          dailyTotal += amount;
        }
      });

      leaderboard.push({
        id: clinicId,
        name: clinicName,
        total: dailyTotal,
        weeklyTotal: weeklyTotal,
        monthlyTotal: monthlyTotal,
        productTotal: dailyProduct,
        weeklyProductTotal: weeklyProduct,
        monthlyProductTotal: monthlyProduct,
        treatmentTotal: dailyTreatment,
        weeklyTreatmentTotal: weeklyTreatment,
        monthlyTreatmentTotal: monthlyTreatment
      });
    }

    // Sort by Monthly Total Descending
    leaderboard.sort((a, b) => b.monthlyTotal - a.monthlyTotal);

    return leaderboard;

  } catch (error) {
    console.error('Error in fetchLeaderboardData:', error);
    throw error;
  }
}