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

// ============ IN-MEMORY CACHE (per filter) ============
const cache = {
  daily: { data: null, timestamp: null, promise: null },
  weekly: { data: null, timestamp: null, promise: null },
  monthly: { data: null, timestamp: null, promise: null },
  yearly: { data: null, timestamp: null, promise: null }
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

function isCacheValid(filter) {
  const filterCache = cache[filter];
  if (!filterCache.data || !filterCache.timestamp) return false;
  const now = Date.now();
  const age = now - filterCache.timestamp;
  return age < CACHE_DURATION;
}

function setCache(filter, data) {
  cache[filter].data = data;
  cache[filter].timestamp = Date.now();
  cache[filter].promise = null; // Clear the promise
  console.log(`✅ Cache updated for ${filter} at:`, new Date(cache[filter].timestamp).toLocaleTimeString('id-ID'));
}

function getCache(filter) {
  if (isCacheValid(filter)) {
    const ageSeconds = Math.floor((Date.now() - cache[filter].timestamp) / 1000);
    console.log(`📦 Serving ${filter} from cache (age: ${ageSeconds}s)`);
    return cache[filter].data;
  }
  return null;
}

// Helper to get date in YYYY-MM-DD format for WIB (UTC+7)
function getWIBDate(date = new Date()) {
  const utcOffset = 7 * 60; // 7 hours in minutes
  const localTime = new Date(date.getTime() + (utcOffset * 60 * 1000));
  return localTime.toISOString().split('T')[0];
}

function getWIBDateStr(date = new Date()) {
  // Get local date parts to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function fetchWithParams(endpoint, params) {
  let allData = [];
  let page = 1;
  let hasMorePages = true;
  const maxPages = 50; // Safety limit for monthly data
  const maxRetries = 3; // Max retry attempts for 500 errors

  // Construct base query params
  const queryParams = new URLSearchParams(params);

  while (hasMorePages && page <= maxPages) {
    // Update page parameter
    queryParams.set('page', page.toString());
    const url = `https://clinic.beautycenter.id/api/${endpoint}?${queryParams.toString()}`;
    
    let retryCount = 0;
    let success = false;
    
    // Retry loop for this page
    while (!success && retryCount <= maxRetries) {
      try {
        const response = await fetch(url, {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });
        
        // Handle rate limiting
        if (response.status === 429) {
          console.log(`⚠️ Rate limit hit for ${endpoint} page ${page}, waiting 3s...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          retryCount++;
          continue;
        }
        
        // Handle server errors (500, 502, 503, 504) with retry
        if (response.status >= 500 && response.status < 600) {
          retryCount++;
          if (retryCount <= maxRetries) {
            const waitTime = Math.min(1000 * Math.pow(2, retryCount - 1), 5000); // Exponential backoff, max 5s
            console.log(`⚠️ API Error ${response.status} for ${endpoint} page ${page}, retry ${retryCount}/${maxRetries} in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          } else {
            console.error(`❌ API Error ${response.status} for ${url} after ${maxRetries} retries, skipping...`);
            break; // Give up on this page
          }
        }
        
        // Handle other non-OK responses
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
        
        success = true; // Mark as successful
        
      } catch (error) {
        retryCount++;
        if (retryCount <= maxRetries) {
          const waitTime = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
          console.error(`⚠️ Network error for ${url}, retry ${retryCount}/${maxRetries} in ${waitTime}ms...`, error.message);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          console.error(`❌ Error fetching ${url} after ${maxRetries} retries:`, error);
          break;
        }
      }
    }
    
    // If we failed all retries, move to next page or stop
    if (!success) {
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

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    // Get filter and period parameters from query params
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'daily';
    const date = searchParams.get('date'); // For daily
    const week = searchParams.get('week'); // For weekly
    const month = searchParams.get('month'); // For monthly
    const year = searchParams.get('year'); // For weekly/monthly/yearly
    
    console.log(`📊 Fetching data with filter: ${filter}`, { date, week, month, year });
    
    // Create cache key with period params
    const cacheKey = `${filter}-${date || ''}-${week || ''}-${month || ''}-${year || ''}`;
    
    // Check cache first for this specific filter + period
    const cached = getCache(filter);
    if (cached && cached.cacheKey === cacheKey) {
      return NextResponse.json(cached.data);
    }

    // If already fetching this filter, wait for that promise
    if (cache[filter].promise) {
      console.log(`⏳ Fetch in progress for ${filter}, waiting for result...`);
      const result = await cache[filter].promise;
      return NextResponse.json(result.data);
    }

    console.log(`🔄 Cache expired or empty for ${filter}, fetching fresh data...`);

    // Create new fetch promise with filter and period params
    cache[filter].promise = fetchLeaderboardData(filter, { date, week, month, year });
    const leaderboard = await cache[filter].promise;

    // Store in cache for this filter with cache key
    setCache(filter, { data: leaderboard, cacheKey });

    return NextResponse.json(leaderboard);

  } catch (error) {
    console.error('Error in API route:', error);
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'daily';
    cache[filter].promise = null; // Clear promise on error
    
    // If error but cache exists for this filter, return stale cache
    if (cache[filter].data) {
      console.log(`⚠️ Error occurred, serving stale cache for ${filter}`);
      return NextResponse.json(cache[filter].data);
    }
    return NextResponse.json([]);
  }
}

async function fetchLeaderboardData(filter = 'daily', params = {}) {
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

    // 2. Calculate Date Ranges based on filter and params
    let startDateStr, endDateStr;
    const { date, week, month, year } = params;
    
    switch(filter) {
      case 'daily':
        // Use specific date if provided, otherwise today
        if (date) {
          startDateStr = date;
          endDateStr = date;
        } else {
          const today = new Date();
          startDateStr = getWIBDateStr(today);
          endDateStr = startDateStr;
        }
        break;
        
      case 'weekly':
        // Calculate week range based on week number (1-4) and year
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
        const weekNum = week ? parseInt(week) : 1;
        
        // Get first day of month
        const firstDay = new Date(targetYear, targetMonth, 1);
        const firstMonday = new Date(firstDay);
        const dayOfWeek = firstDay.getDay();
        const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
        firstMonday.setDate(firstDay.getDate() + daysUntilMonday);
        
        // Calculate start of target week
        const startOfWeek = new Date(firstMonday);
        startOfWeek.setDate(firstMonday.getDate() + (weekNum - 1) * 7);
        
        // Calculate end of week (7 days later)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        startDateStr = getWIBDateStr(startOfWeek);
        endDateStr = getWIBDateStr(endOfWeek);
        break;
        
      case 'monthly':
        // Use specific month/year if provided
        const monthYear = year ? parseInt(year) : new Date().getFullYear();
        const monthNum = month ? parseInt(month) - 1 : new Date().getMonth();
        
        const startOfMonth = new Date(monthYear, monthNum, 1);
        const endOfMonth = new Date(monthYear, monthNum + 1, 0); // Last day of month
        
        startDateStr = getWIBDateStr(startOfMonth);
        endDateStr = getWIBDateStr(endOfMonth);
        break;
        
      case 'yearly':
        // Use specific year if provided
        const targetYearNum = year ? parseInt(year) : new Date().getFullYear();
        
        const startOfYear = new Date(targetYearNum, 0, 1);
        const endOfYear = new Date(targetYearNum, 11, 31);
        
        startDateStr = getWIBDateStr(startOfYear);
        endDateStr = getWIBDateStr(endOfYear);
        break;
      default:
        startDateStr = todayStr;
        endDateStr = todayStr;
    }

    console.log(`📅 Filter: ${filter} | Date range: ${startDateStr} to ${endDateStr}`);

    // 3. Fetch Data for each clinic
    // We fetch "This Month" data, which includes "Today" and "This Week"
    const leaderboard = [];

    for (const clinic of beautyClinsOnly) {
      const clinicId = clinic.id;
      const clinicName = clinic.nama_clinic || clinic.name;
      
      console.log(`📍 Processing ${clinicName} (ID: ${clinicId})...`);

      // Fetch Products with error handling
      const productParams = {
        nama_cabang: clinicId,
        dari_tanggal: startDateStr,
        sampai_tanggal: endDateStr
      };
      
      // Fetch Treatments (uses different parameter: klinik instead of nama_cabang)
      const treatmentParams = {
        klinik: clinicId,
        dari_tanggal: startDateStr,
        sampai_tanggal: endDateStr
      };

      // Fetch SEQUENTIALLY with error handling
      let products = [];
      let treatments = [];
      
      try {
        products = await fetchWithParams('laporan-penjualan-produk', productParams);
        console.log(`   ✓ Products: ${products.length} records`);
      } catch (error) {
        console.error(`   ✗ Products fetch failed for ${clinicName}:`, error.message);
      }
      
      // Minimal delay since rate limit is now 500/min
      await new Promise(resolve => setTimeout(resolve, 200));
      
      try {
        treatments = await fetchWithParams('laporan-penjualan-perawatan', treatmentParams);
        console.log(`   ✓ Treatments: ${treatments.length} records`);
      } catch (error) {
        console.error(`   ✗ Treatments fetch failed for ${clinicName}:`, error.message);
      }

      // Aggregate Data based on filter
      let totalAmount = 0;
      let productAmount = 0;
      let treatmentAmount = 0;

      // Process Products
      products.forEach(p => {
        const amount = parseFloat(p.total_bayar || 0);
        totalAmount += amount;
        productAmount += amount;
      });

      // Process Treatments
      treatments.forEach(t => {
        const amount = parseFloat(t.total_pembayaran || 0);
        totalAmount += amount;
        treatmentAmount += amount;
      });

      leaderboard.push({
        id: clinicId,
        name: clinicName,
        total: totalAmount,
        productTotal: productAmount,
        treatmentTotal: treatmentAmount
      });
    }

    // Sort by Total Descending
    leaderboard.sort((a, b) => b.total - a.total);

    return leaderboard;

  } catch (error) {
    console.error('Error in fetchLeaderboardData:', error);
    throw error;
  }
}