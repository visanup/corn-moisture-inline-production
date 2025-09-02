# Stage 1: build
FROM node:18-alpine AS builder

# ติดตั้งเครื่องมือ build ที่จำเป็นสำหรับ bcrypt
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copy package and lock files
COPY package.json tsconfig.json ./

# ติดตั้ง dependencies ทั้งหมด (รวม dev)
RUN npm install --production=false

# Copy source code แล้ว build
COPY src ./src
RUN npm run build

# Stage 2: production runtime
FROM node:18-alpine

# ติดตั้ง build tools อีกรอบ เพราะ bcrypt ยังต้อง build
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# ติดตั้งเฉพาะ production dependencies
COPY package.json ./
RUN npm install --production=true

# Copy built files จาก stage แรก
COPY --from=builder /usr/src/app/dist ./dist

# Expose port
EXPOSE 5001

# Run the server
CMD ["node", "dist/server.js"]
