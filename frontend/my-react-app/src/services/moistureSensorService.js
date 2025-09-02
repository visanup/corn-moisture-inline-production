// services/moistureSensorService.js

const API_BASE_URL = import.meta.env.VITE_REACT_APP_MOISTURE_SENSOR_SERVICE_ENDPOINT;

export async function startDataCollection(collectionInfo) {
  // ดึง refreshToken จาก localStorage
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No accessToken  found. กรุณา login ใหม่ก่อนใช้งาน');
  }

  // Normalize base URL
  const base = API_BASE_URL.replace(/\/+$/, '');
  // ตาม Postman: port 5004, path /api/v1/sensor/sensor-start
  const url = `${base}/api/v1/sensor/sensor-start`;
  console.log('👉 startDataCollection URL:', url);
  console.log('👉 Payload:', collectionInfo);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      queue:     collectionInfo.queue,
      ins_lot:   collectionInfo.ins_lot,
      material:  collectionInfo.material,
      batch:     collectionInfo.batch,
      plant:     collectionInfo.plant,
      sample_no: collectionInfo.sample_no
    })
  });

  console.log('👈 Response status:', response.status);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error starting data collection: ${response.status} – ${text}`);
  }

  const data = await response.json();
  console.log("✅ Data collection started:", data);
  return data;
}
