// loginService.js
export async function login(email, password) {
  // ดึงค่า raw endpoint จาก .env
  let endpoint = import.meta.env.VITE_REACT_APP_USER_ENDPOINT;
  console.log("👈 auth-endpoint:", endpoint);
  
  // ตัด slash ท้ายออก (เพื่อป้องกัน // เกิน)
  endpoint = endpoint.replace(/\/+$/, '');

  // สร้าง URL ตามที่ต้องการ
  const url = `${endpoint}/api/v1/auth/login`;
  console.log("👉 Login URL:", url);
  console.log("👉 Payload:", { email, password });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  console.log("👈 Response status:", response.status, response.url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Login failed: ${response.status} – ${errorText}`);
  }

  const data = await response.json();

  // เก็บ token ลง localStorage
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
  }
  if (data.refreshToken) {
    localStorage.setItem('refreshToken', data.refreshToken);
  }

  return data;
}
