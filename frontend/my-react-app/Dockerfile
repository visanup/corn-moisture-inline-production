# Stage 1: Build the project
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# ✅ แก้ DNS อย่างถูกต้อง (ก่อนคุณพิมพ์ผิดเป็น /etc/--network host)
#RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn cache clean --force && yarn install --frozen-lockfile

# ✅ Copy environment file ก่อน เพื่อใช้ใน build
COPY .env .env

# ✅ Copy source code ทั้งหมด รวม index.html, vite.config.js, src/
COPY . .

# ✅ Build (จะสร้างโฟลเดอร์ dist/)
RUN yarn build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Nginx ทำงานที่ path นี้เป็น default
WORKDIR /usr/share/nginx/html

# ลบไฟล์ default
RUN rm -rf ./*

# ✅ คัดลอกผลลัพธ์ที่ build แล้วจาก stage แรก
COPY --from=builder /app/dist .

# ✅ ถ้ามีไฟล์ nginx.conf (option)
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 5000

# Start Nginx
ENTRYPOINT ["nginx", "-g", "daemon off;"]
