// services/data-service/src/models/interface.ts

/**
 * TypeScript interface for a row in moisture.interface
 */
export interface InterfaceRecord {
  id: number;
  ins_lot: string;
  material: string;
  batch: string;
  plant: string;
  sample_no: string;
  interface_status: string;           // NEW: 'pending' or other statuses
  statistics: Record<string, unknown>;  // JSONB
  created_at: Date;
  updated_at: Date;                   // NEW: timestamp of last update
}

export const INTERFACE_TABLE = 'moisture.interface';
