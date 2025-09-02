// services/data-service/src/server.ts
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';

import { PORT} from './configs/config';

import dataRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';
import { computeAndStoreAll } from './services/statisticsService';

const app = express();

app.use(express.json());
app.use(cors({
  origin: '*',                      // อนุญาตทุก origin
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// schedule every 3 minutes
cron.schedule('*/3 * * * *', async () => {
  console.log('🔄 Running stats job every 3 minutes');
  try {
    await computeAndStoreAll();
    console.log('✔️ Stats job completed');
  } catch (err) {
    console.error('❌ Stats job error:', err);
  }
});

// ตรวจ token ก่อนเข้าถึงทุก endpoint ภายใต้ /api/v1/data
app.use('/api/v1/data', authenticateToken, dataRouter);

// global error handler
app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`🚀 Data Service on port ${PORT}`)
);

