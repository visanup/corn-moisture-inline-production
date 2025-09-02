"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// services/data-service/src/routes/interfaceResults.ts
const express_1 = require("express");
const db_1 = require("../utils/db");
const router = (0, express_1.Router)();
// GET /interface-results
router.get('/', async (req, res, next) => {
    try {
        const { ins_lot, material, batch, plant, queue } = req.query;
        const filters = [];
        const values = [];
        let idx = 1;
        if (ins_lot) {
            filters.push(`ins_lot = $${idx}`);
            values.push(ins_lot);
            idx++;
        }
        if (material) {
            filters.push(`material = $${idx}`);
            values.push(material);
            idx++;
        }
        if (batch) {
            filters.push(`batch = $${idx}`);
            values.push(batch);
            idx++;
        }
        if (plant) {
            filters.push(`plant = $${idx}`);
            values.push(plant);
            idx++;
        }
        if (queue) {
            filters.push(`queue = $${idx}`);
            values.push(queue);
            idx++;
        }
        const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
        const query = `SELECT * FROM moisture.interface ${whereClause} ORDER BY created_at DESC`;
        const { rows } = await db_1.pool.query(query, values);
        res.json(rows);
    }
    catch (err) {
        next(err);
    }
});
// GET /interface-results/:id
router.get('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { rows } = await db_1.pool.query(`SELECT * FROM moisture.interface WHERE id = $1`, [id]);
        if (rows.length)
            res.json(rows[0]);
        else
            res.status(404).json({ message: 'Interface record not found' });
    }
    catch (err) {
        next(err);
    }
});
// POST /interface-results
router.post('/', async (req, res, next) => {
    try {
        const { ins_lot, material, batch, plant, queue, statistics } = req.body;
        const { rows } = await db_1.pool.query(`INSERT INTO moisture.interface(ins_lot, material, batch, plant, queue, statistics)
       VALUES($1, $2, $3, $4, $5, $6) RETURNING *`, [ins_lot, material, batch, plant, queue, statistics]);
        res.status(201).json(rows[0]);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
