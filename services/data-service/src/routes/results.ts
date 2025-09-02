// services/data-service/src/routes/results.ts
import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../utils/db';
import { ResultRecord } from '../models/result';

const router = Router();

// GET /results
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ins_lot, material, batch, plant, sample_no, queue } = req.query as Record<string, string>;
    const filters: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (ins_lot) { filters.push(`ins_lot = $${idx}`); values.push(ins_lot); idx++; }
    if (material) { filters.push(`material = $${idx}`); values.push(material); idx++; }
    if (batch) { filters.push(`batch = $${idx}`); values.push(batch); idx++; }
    if (plant) { filters.push(`plant = $${idx}`); values.push(plant); idx++; }
    if (sample_no) { filters.push(`sample_no = $${idx}`); values.push(sample_no); idx++; }
    if (queue) { filters.push(`queue = $${idx}`); values.push(queue); idx++; }
    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const query = `SELECT * FROM moisture.result ${whereClause} ORDER BY created_at DESC`;
    const { rows } = await pool.query<ResultRecord>(query, values);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /results/:ins_lot
 */
router.get('/:ins_lot', async (req, res, next) => {
  try {
    const { ins_lot } = req.params;
    const { rows } = await pool.query<ResultRecord>(
      `SELECT * FROM moisture.result WHERE ins_lot = $1 ORDER BY created_at DESC`,
      [ins_lot]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /results/:queue
 */
router.get('/:queue', async (req, res, next) => {
  try {
    const { queue } = req.params;
    const { rows } = await pool.query<ResultRecord>(
      `SELECT * FROM moisture.result WHERE queue = $1 ORDER BY created_at DESC`,
      [queue]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /results/:sample_no
 */
router.get('/:sample_no', async (req, res, next) => {
  try {
    const { sample_no } = req.params;
    const { rows } = await pool.query<ResultRecord>(
      `SELECT * FROM moisture.result WHERE sample_no = $1 ORDER BY created_at DESC`,
      [sample_no]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /results/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query<ResultRecord>(
      `SELECT * FROM moisture.result WHERE id = $1`,
      [id]
    );
    if (rows.length) res.json(rows[0]);
    else res.status(404).json({ message: 'Result record not found' });
  } catch (err) {
    next(err);
  }
});

// POST /results
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ins_lot, material, batch, plant, sample_no, queue, result, statistics } = req.body;
    const { rows } = await pool.query<ResultRecord>(
      `INSERT INTO moisture.result(ins_lot, material, batch, plant, sample_no, queue, result, statistics)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [ins_lot, material, batch, plant, sample_no, queue, result, statistics]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
