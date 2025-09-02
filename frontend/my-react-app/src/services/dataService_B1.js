// services/dataService.js

// เพราะเราใช้ Vite proxy ให้ mapping /api → /api/v1 แทน CORS
const API_PREFIX = '/api';

/** เตรียม headers พร้อม token */
function getAuthHeaders() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refreshToken found. กรุณา login ใหม่ก่อนใช้งาน');
  return {
    'Authorization': `Bearer ${refreshToken}`,
    'Content-Type': 'application/json'
  };
}

/** ฟังก์ชันช่วย GET ผ่าน proxy */
async function apiGet(endpoint) {
  const url = `${API_PREFIX}${endpoint}`;
  console.log(`👉 GET ${url}`);
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${endpoint} failed: ${res.status} – ${text}`);
  }
  return res.json();
}

/**
 * ดึงผลลัพธ์จาก Data Service ตาม queue:
 * GET /api/v1/data/results?queue={queue}
 */
function fetchResultsByQueue(queue) {
  return apiGet(`/data/results?queue=${encodeURIComponent(queue)}`);
}

/**
 * (ถ้าต้องการ) ดึงสถิติจากหน้า interface:
 * GET /api/v1/data/interface-results?ins_lot=…&material=…&batch=…&plant=…&sample_no=…
 */
function fetchInterfaceStats({ ins_lot, material, batch, plant, sample_no }) {
  const qs = new URLSearchParams({ ins_lot, material, batch, plant, sample_no }).toString();
  return apiGet(`/data/interface-results?${qs}`);
}

export {
  fetchResultsByQueue,
  fetchInterfaceStats
};
