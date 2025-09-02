// services/data-service/src/services/statisticsService.ts

import { pool } from '../utils/db';
import {
  sampleSkewness,
  sampleKurtosis,
  mean,
  standardDeviation,
  min,
  max,
  variance,
  median,
} from 'simple-statistics';

export interface Stats {
  N: number;
  minimum: number;
  maximum: number;
  range: number;
  average: number;
  sd: number;
  cv: number | null;
  median: number;
  variance: number;
  skewness: number | null;
  kurtosis: number | null;
}

/**
 * Compute statistics for a given ins_lot/material/batch/plant/sample_no
 */
export async function computeStats(
  ins_lot: string,
  material: string,
  batch: string,
  plant: string,
  sample_no: string
): Promise<Stats> {
  const { rows } = await pool.query<{ predicted_values: number[] }>(
    `SELECT (result->'predictions') AS predicted_values
       FROM moisture.result
      WHERE ins_lot=$1
        AND material=$2
        AND batch=$3
        AND plant=$4
        AND sample_no=$5`,
    [ins_lot, material, batch, plant, sample_no]
  );

  const preds = rows.flatMap(r =>
    r.predicted_values.map((p: any) => (typeof p === 'object' ? p.prediction : p))
  );

  const N = preds.length;

  if (N === 0) {
    throw new Error("No prediction data found for the given key");
  }

  const minimum = min(preds);
  const maximum = max(preds);
  const range = maximum - minimum;
  const average = mean(preds);
  const sd = standardDeviation(preds);
  const varVal = variance(preds);
  const cv = average !== 0 ? (sd / average) * 100 : null;
  const medianVal = median(preds);
  const skewness = N >= 3 ? sampleSkewness(preds) : null;
  const kurtosis = N >= 4 ? sampleKurtosis(preds) : null;

  return {
    N,
    minimum,
    maximum,
    range,
    average,
    sd,
    cv,
    median: medianVal,
    variance: varVal,
    skewness,
    kurtosis,
  };
}

/**
 * Fetch all distinct keys and store computed stats into interface table
 */
export async function computeAndStoreAll(): Promise<void> {
  const { rows } = await pool.query<{
    ins_lot: string;
    material: string;
    batch: string;
    plant: string;
    sample_no: string;
  }>(
    `SELECT DISTINCT ins_lot, material, batch, plant, sample_no
       FROM moisture.result`
  );

  for (const { ins_lot, material, batch, plant, sample_no } of rows) {
    try {
      const stats = await computeStats(ins_lot, material, batch, plant, sample_no);

      await pool.query(
        `INSERT INTO moisture.interface
           (ins_lot, material, batch, plant, sample_no, statistics)
         VALUES
           ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (ins_lot, material, batch, plant, sample_no)
         DO UPDATE SET
           statistics = EXCLUDED.statistics,
           updated_at = NOW()`,
        [ins_lot, material, batch, plant, sample_no, stats]
      );
    } catch (error) {
      console.error(
        `❌ Failed to compute stats for [${ins_lot}, ${material}, ${batch}, ${plant}, ${sample_no}]:`,
        error
      );
    }
  }
}
