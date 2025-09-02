// services/registerService.js
import axios from 'axios';

// ดึงค่าจาก .env (ใน Vite ทุกตัวแปรต้องขึ้นต้นด้วย VITE_)
const API_USER_URL = import.meta.env.VITE_REACT_APP_USER_ENDPOINT;

const registerService = async (userData) => {
  try {
    // กำหนด URL
    const url = `${API_USER_URL}/api/v1/auth/signup`;
    // สร้าง config ที่บอกว่าเราส่ง JSON
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    // stringify ตัว userData
    const body = JSON.stringify({
      email:    userData.email,
      name:     userData.name,
      password: userData.password
    });
    const response = await axios.post(url, body, config);
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export default registerService;
