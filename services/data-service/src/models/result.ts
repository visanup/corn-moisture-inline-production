// src/models/result.ts

/**
 * Represents a row in moisture.result
 */
export interface ResultRecord {
  id: number;
  ins_lot: string;
  material: string;
  batch: string;
  plant: string;
  sample_no: string;
  queue: string;
  result: Record<string, unknown>;      // JSONB
  created_at: Date;
}

// If you need the full table identifier:
export const RESULT_TABLE = 'moisture.result';
