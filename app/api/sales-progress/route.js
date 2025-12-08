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

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getWIBDateStr(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function fetchWithParams(endpoint, params) {
  let allData = [];
  let page = 1;
  let hasMorePages = true;
  const maxPages = 50;
  const maxRetries = 3;

  const queryParams = new URLSearchParams(params);

  while (hasMorePages && page <= maxPages) {
    queryParams.set('page', page.toString());
    const url = `https://clinic.beautycenter.id/api/${endpoint}?${queryParams.toString()}`;
    
    let retryCount = 0;
    let success = false;
    
    while (!success && retryCount <= maxRetries) {
      try {
        const response = await fetch(url, {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });
        
        if (response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          retryCount++;
          continue;
        }
        
        if (response.status >= 500 && response.status < 600) {
          retryCount++;
          if (retryCount <= maxRetries) {
            const waitTime = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          } else {
            break;
          }
        }
        
        if (!response.ok) {
          break;
        }
        
        const result = await response.json();
        const data = result?.data || [];
        
        if (data.length > 0) {
          allData = allData.concat(data);
          
          if (result.next_page_url) {
            page++;
            await new Promise(resolve => setTimeout(resolve, 150));
          } else {
            hasMorePages = false;
          }
        } else {
          hasMorePages = false;
        }
        
        success = true;
        
      } catch (error) {
        retryCount++;
        if (retryCount <= maxRetries) {
          const waitTime = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          break;
        }
      }
    }
    
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

export async function GET(request) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter') || 'daily';
        const date = searchParams.get('date');
        const week = searchParams.get('week');
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        
        // Fetch clinics
        const clinicsData = await fetchClinics();
        let clinics = clinicsData || MOCK_CLINICS;

        const beautyClinsOnly = Array.isArray(clinics) 
          ? clinics.filter(c => {
              const name = c.nama_clinic || c.name || '';
              const isBeautyCenter = name.includes('Beauty Center') || name.includes('Rumah Cantik');
              const isClosed = name.includes('Piyungan'); 
              return isBeautyCenter && !isClosed;
            })
          : MOCK_CLINICS;

        const totalClinics = beautyClinsOnly.length;

        // Calculate date ranges
        let startDateStr, endDateStr;
        
        switch(filter) {
          case 'daily':
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
            const targetYear = year ? parseInt(year) : new Date().getFullYear();
            const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
            const weekNum = week ? parseInt(week) : 1;
            
            const firstDay = new Date(targetYear, targetMonth, 1);
            const firstMonday = new Date(firstDay);
            const dayOfWeek = firstDay.getDay();
            const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
            firstMonday.setDate(firstDay.getDate() + daysUntilMonday);
            
            const startOfWeek = new Date(firstMonday);
            startOfWeek.setDate(firstMonday.getDate() + (weekNum - 1) * 7);
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            startDateStr = getWIBDateStr(startOfWeek);
            endDateStr = getWIBDateStr(endOfWeek);
            break;
            
          case 'monthly':
            const monthYear = year ? parseInt(year) : new Date().getFullYear();
            const monthNum = month ? parseInt(month) - 1 : new Date().getMonth();
            
            const startOfMonth = new Date(monthYear, monthNum, 1);
            const endOfMonth = new Date(monthYear, monthNum + 1, 0);
            
            startDateStr = getWIBDateStr(startOfMonth);
            endDateStr = getWIBDateStr(endOfMonth);
            break;
            
          case 'yearly':
            const targetYearNum = year ? parseInt(year) : new Date().getFullYear();
            
            const startOfYear = new Date(targetYearNum, 0, 1);
            const endOfYear = new Date(targetYearNum, 11, 31);
            
            startDateStr = getWIBDateStr(startOfYear);
            endDateStr = getWIBDateStr(endOfYear);
            break;
          default:
            const today = new Date();
            startDateStr = getWIBDateStr(today);
            endDateStr = startDateStr;
        }

        const leaderboard = [];
        let processedCount = 0;

        // Process each clinic with progress updates
        for (const clinic of beautyClinsOnly) {
          const clinicId = clinic.id;
          const clinicName = clinic.nama_clinic || clinic.name;
          
          // Send progress update
          const progress = Math.round(((processedCount + 0.5) / totalClinics) * 100);
          const progressData = {
            type: 'progress',
            clinic: clinicName,
            progress: progress,
            total: totalClinics,
            current: processedCount + 1
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(progressData)}\n\n`));

          const productParams = {
            nama_cabang: clinicId,
            dari_tanggal: startDateStr,
            sampai_tanggal: endDateStr
          };
          
          const treatmentParams = {
            klinik: clinicId,
            dari_tanggal: startDateStr,
            sampai_tanggal: endDateStr
          };

          let products = [];
          let treatments = [];
          
          try {
            products = await fetchWithParams('laporan-penjualan-produk', productParams);
          } catch (error) {
            console.error(`Products fetch failed for ${clinicName}:`, error.message);
          }
          
          await new Promise(resolve => setTimeout(resolve, 200));
          
          try {
            treatments = await fetchWithParams('laporan-penjualan-perawatan', treatmentParams);
          } catch (error) {
            console.error(`Treatments fetch failed for ${clinicName}:`, error.message);
          }

          let totalAmount = 0;
          let productAmount = 0;
          let treatmentAmount = 0;

          products.forEach(p => {
            const amount = parseFloat(p.total_bayar || 0);
            totalAmount += amount;
            productAmount += amount;
          });

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

          processedCount++;
        }

        // Sort by total descending
        leaderboard.sort((a, b) => b.total - a.total);

        // Send completion
        const completeData = {
          type: 'complete',
          data: leaderboard
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(completeData)}\n\n`));
        controller.close();

      } catch (error) {
        console.error('Error in streaming API:', error);
        const errorData = {
          type: 'error',
          message: error.message
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
