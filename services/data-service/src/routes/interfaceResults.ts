// services/data-service/src/routes/interfaceResults.ts
import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../utils/db';
import { InterfaceRecord } from '../models/interface';

const router = Router();

// GET /interface-results
// Optional query-params: ins_lot, material, batch, plant, sample_no
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ins_lot, material, batch, plant, sample_no } = req.query as Record<string, string>;
    const filters: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (ins_lot)    { filters.push(`ins_lot = $${idx}`);    values.push(ins_lot);    idx++; }
    if (material)  { filters.push(`material = $${idx}`);  values.push(material);  idx++; }
    if (batch)     { filters.push(`batch = $${idx}`);     values.push(batch);     idx++; }
    if (plant)     { filters.push(`plant = $${idx}`);     values.push(plant);     idx++; }
    if (sample_no) { filters.push(`sample_no = $${idx}`); values.push(sample_no); idx++; }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const sql = `
      SELECT
        id,
        ins_lot,
        material,
        batch,
        plant,
        sample_no,
        interface_status,
        statistics,
        created_at,
        updated_at
      FROM moisture.interface
      ${whereClause}
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query<InterfaceRecord>(sql, values);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /interface-results/:ins_lot
 */
router.get('/:ins_lot', async (req, res, next) => {
  try {
    const { ins_lot } = req.params;
    const sql = `
      SELECT
        id,
        ins_lot,
        material,
        batch,
        plant,
        sample_no,
        interface_status,
        statistics,
        created_at,
        updated_at
      FROM moisture.interface
      WHERE ins_lot = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query<InterfaceRecord>(sql, [ins_lot]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /interface-results/:sample_no
 */
router.get('/:sample_no', async (req, res, next) => {
  try {
    const { sample_no } = req.params;
    const sql = `
      SELECT
        id,
        ins_lot,
        material,
        batch,
        plant,
        sample_no,
        interface_status,
        statistics,
        created_at,
        updated_at
      FROM moisture.interface
      WHERE sample_no = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query<InterfaceRecord>(sql, [sample_no]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /interface-results/:id
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const sql = `
      SELECT
        id,
        ins_lot,
        material,
        batch,
        plant,
        sample_no,
        interface_status,
        statistics,
        created_at,
        updated_at
      FROM moisture.interface
      WHERE id = $1
    `;
    const { rows } = await pool.query<InterfaceRecord>(sql, [id]);
    if (rows.length) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Interface record not found' });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * POST /interface-results
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ins_lot, material, batch, plant, sample_no, statistics } = req.body;
    const sql = `
      INSERT INTO moisture.interface
        (ins_lot, material, batch, plant, sample_no, statistics)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        ins_lot,
        material,
        batch,
        plant,
        sample_no,
        interface_status,
        statistics,
        created_at,
        updated_at
    `;
    const { rows } = await pool.query<InterfaceRecord>(sql, [
      ins_lot,
      material,
      batch,
      plant,
      sample_no,
      statistics,
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
