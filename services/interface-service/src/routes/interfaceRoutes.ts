// services/data-service/src/routes/interfaceRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../utils/db';
import { InterfaceRecord } from '../models/interface';

const router = Router();

/**
 * GET /api/v1/data/interface/sample/:sample_no
 * Retrieve pending interface records for a given sample_no
 */
router.get('/sample/:sample_no', async (req: Request, res: Response, next: NextFunction) => {
  const sampleNo = req.params.sample_no;
  try {
    const { rows } = await pool.query<InterfaceRecord>(
      `SELECT *
         FROM moisture.interface
        WHERE sample_no = $1
          AND interface_status = 'pending'
        ORDER BY created_at DESC`,
      [sampleNo]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;