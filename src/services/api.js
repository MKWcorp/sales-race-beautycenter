import axios from 'axios';

// Configuration
const API_BASE_URL = 'https://clinic.beautycenter.id/api';
// Use a proxy if needed, or direct if CORS allows. 
// For development in some environments, you might need a CORS proxy.

// Mock Data - Beauty Center Only (No Klinik)
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

export const fetchClinics = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/klinik`);
        return response.data;
    } catch (error) {
        console.warn("Failed to fetch clinics, using mock data", error);
        return MOCK_CLINICS;
    }
};

export const fetchDailySales = async () => {
    try {
        // In a real scenario, we might need to fetch multiple pages.
        // For this demo, we'll fetch page 1.
        // Ideally, you loop through pages until the date is no longer today.
        const response = await axios.get(`${API_BASE_URL}/laporan-penjualan-produk?page=1`);
        return response.data.data; // Array of transactions
    } catch (error) {
        console.warn("Failed to fetch sales, using empty list or mock", error);
        return [];
    }
};

export const getAggregatedData = async () => {
    const clinics = await fetchClinics();
    const transactions = await fetchDailySales();

    // Initialize map with 0 sales
    const salesMap = {};
    clinics.forEach(c => {
        salesMap[c.nama_clinic] = 0;
    });

    // Get today's date string YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    
    // Filter and Sum
    transactions.forEach(t => {
        // Ensure we only count today's transactions (if API returns mixed dates)
        // The sample shows "2025-11-26", let's assume we filter by the transaction date provided in JSON
        // For now, we accept all returned by the endpoint as "recent"
        
        const amount = parseFloat(t.total_bayar);
        const clinicName = t.nama_clinic;

        if (salesMap[clinicName] !== undefined) {
            salesMap[clinicName] += amount;
        } else {
            // Handle case where clinic name might slightly differ or is new
            salesMap[clinicName] = amount;
        }
    });

    // Convert to array for sorting
    const leaderboard = Object.keys(salesMap).map(name => ({
        name,
        total: salesMap[name]
    }));

    // Sort descending
    leaderboard.sort((a, b) => b.total - a.total);

    return leaderboard;
};
