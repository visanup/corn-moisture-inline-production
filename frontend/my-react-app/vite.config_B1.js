// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  // โหลดตัวแปรจาก .env(.development/.production) มาใส่ใน process.env
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    plugins: [react()],
    server: {
      host: '0.0.0.0',     // ✅ สำคัญมาก! เพื่อให้เข้าจากภายนอกได้
      port: 5000,  // ถ้าจะเปลี่ยนพอร์ตก็แก้ตรงนี้
      proxy: {
        // ทุก request เริ่มต้น /api → จะไปที่ service endpoint
        '/api': {
          target: env.VITE_REACT_APP_CORN_MOISTURE_DATA_SERVICE_ENDPOINT,
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace(/^\/api/, '/api/v1')
        },
        // สมมติมี path /auth → ไปที่ user endpoint
        '/auth': {
          target: env.VITE_REACT_APP_USER_ENDPOINT,
          changeOrigin: true,
          secure: false,
          // ถ้าต้อง rewrite path ก็ใส่ได้ เช่น .replace(/^\/auth/, '/api/v1/auth')
        },
        // ถ้าต้องคอลไป sensor service โดยตรง
        '/sensor': {
          target: env.VITE_REACT_APP_MOISTURE_SENSOR_SERVICE_ENDPOINT,
          changeOrigin: true,
          secure: false,
          // rewrite ถ้าต้องการ
        }
      }
    }
  });
};
