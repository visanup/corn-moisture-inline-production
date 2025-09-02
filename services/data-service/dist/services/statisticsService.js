"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAndStoreAll = exports.computeStats = void 0;
// services/data-service/src/services/statisticsService.ts
const db_1 = require("../utils/db");
const simple_statistics_1 = require("simple-statistics");
/**
 * Compute statistics for a given ins_lot/material/batch/plant
 */
async function computeStats(ins_lot, material, batch, plant) {
    const { rows } = await db_1.pool.query(`SELECT (result->'predicted_values') AS predicted_values
     FROM moisture.result
     WHERE ins_lot=$1 AND material=$2 AND batch=$3 AND plant=$4`, [ins_lot, material, batch, plant]);
    const predictedValues = rows.flatMap(r => r.predicted_values);
    const N = predictedValues.length;
    const minimum = Math.min(...predictedValues);
    const maximum = Math.max(...predictedValues);
    const range = maximum - minimum;
    const sum = predictedValues.reduce((a, b) => a + b, 0);
    const average = sum / N;
    const variance = predictedValues.reduce((a, v) => a + Math.pow(v - average, 2), 0) / N;
    const sd = Math.sqrt(variance);
    const cv = average !== 0 ? (sd / average) * 100 : null;
    const sorted = [...predictedValues].sort((a, b) => a - b);
    const median = sorted[Math.floor(N / 2)];
    const skewVal = (0, simple_statistics_1.sampleSkewness)(predictedValues);
    const kurtVal = (0, simple_statistics_1.sampleKurtosis)(predictedValues);
    return { N, minimum, maximum, range, average, sd, cv, median, variance, skewness: skewVal, kurtosis: kurtVal };
}
exports.computeStats = computeStats;
/**
 * Fetch all distinct keys and store computed stats into interface table
 */
async function computeAndStoreAll() {
    const { rows } = await db_1.pool.query(`SELECT DISTINCT ins_lot, material, batch, plant FROM moisture.result`);
    for (const { ins_lot, material, batch, plant } of rows) {
        const stats = await computeStats(ins_lot, material, batch, plant);
        await db_1.pool.query(`INSERT INTO moisture.interface(ins_lot, material, batch, plant, queue, statistics)
       VALUES($1,$2,$3,$4,'ALL',$5)`, [ins_lot, material, batch, plant, stats]);
    }
}
exports.computeAndStoreAll = computeAndStoreAll;
