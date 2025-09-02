// src/services/dataService.js

const API_PREFIX = '/api/v1';

function getAuthHeaders() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refreshToken found. กรุณา login ใหม่ก่อนใช้งาน');
  }
  return {
    'Authorization': `Bearer ${refreshToken}`,
    'Content-Type': 'application/json',
  };
}

async function apiGet(endpoint) {
  const url = `${API_PREFIX}${endpoint}`;
  console.log(`👉 GET ${url}`);
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${endpoint} failed: ${res.status} – ${text}`);
  }
  return res.json();
}

async function apiPost(endpoint, body) {
  const url = `${API_PREFIX}${endpoint}`;
  console.log(`👉 POST ${url}`, body);
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${endpoint} failed: ${res.status} – ${text}`);
  }
  return res.json();
}

async function apiDelete(endpoint) {
  const url = `${API_PREFIX}${endpoint}`;
  console.log(`👉 DELETE ${url}`);
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DELETE ${endpoint} failed: ${res.status} – ${text}`);
  }
  try {
    return await res.json();
  } catch {
    return true;
  }
}

/** ดึงผลลัพธ์จาก Data Service ตาม queue */
function fetchResultsByQueue(queue) {
  return apiGet(`/data/results?queue=${encodeURIComponent(queue)}`);
}

/** ลบผลลัพธ์ตาม id */
function deleteResultById(id) {
  return apiDelete(`/data/results/${encodeURIComponent(id)}`);
}

/**
 * ดึงข้อมูล Summary จาก interface‐results ตามเงื่อนไข
 * GET /api/data/interface-results?ins_lot=…&material=…&batch=…&plant=…&sample_no=…
 */
function fetchInterfaceSummary({ ins_lot, material, batch, plant, sample_no }) {
  const qs = new URLSearchParams({ ins_lot, material, batch, plant, sample_no }).toString();
  return apiGet(`/data/interface-results?${qs}`);
}

/** ดึงข้อมูล Interface Results ทั้งหมด (ไม่กรอง) */
function fetchInterfaceResults() {
  return apiGet(`/data/interface-results`);
}

/** ลบ record ใน interface‐results ตาม id */
function deleteInterfaceResult(id) {
  return apiDelete(`/data/interface-results/${encodeURIComponent(id)}`);
}

/** สร้าง record ใหม่ใน interface‐results */
function postInterfaceResult(body) {
  return apiPost('/data/interface-results', body);
}

export {
  fetchResultsByQueue,
  deleteResultById,
  fetchInterfaceSummary,
  fetchInterfaceResults,    // เพิ่มตัวนี้
  deleteInterfaceResult,
  postInterfaceResult,
};
