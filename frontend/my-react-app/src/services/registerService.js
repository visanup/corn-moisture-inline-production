// src/services/registerService.js

import axios from 'axios';

// ดึงค่าจาก .env (ใน Vite จะต้องขึ้นต้นด้วย VITE_)
const API_USER_URL = import.meta.env.VITE_REACT_APP_USER_ENDPOINT;

// Debug: แสดงค่าใน Console เพื่อตรวจสอบว่าโหลดมาถูกหรือไม่
console.log("USER API URL =", API_USER_URL);

const registerService = async (userData) => {
  try {
    // กำหนด URL สำหรับ signup
    const url = `${API_USER_URL}/api/v1/auth/signup`;

    // กำหนด config สำหรับส่ง JSON
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // แปลงข้อมูล userData เป็น JSON string
    const body = JSON.stringify({
      email: userData.email,
      name: userData.name,
      password: userData.password,
    });

    // ส่ง POST request ไปยัง backend
    const response = await axios.post(url, body, config);

    // ส่งผลลัพธ์กลับ
    return response.data;

  } catch (error) {
    // แสดง error ใน Console
    console.error("Error during registration:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export default registerService;
