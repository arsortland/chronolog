// Created: 2025-01-28
// v2.1 - Moved notes from Entry to Code (notes are per-code, not per-entry)
// v2.2 - Added note field to Entry for per-entry notes (defaults from code note at creation)
// Purpose: TypeScript interfaces for ChronoLog data model.
//          Defines Entry (time log records) and Code (WBS/WO code lookup table).

export interface Entry {
  id?: string;
  date: string; // ISO date string e.g. "2025-01-28"
  customer: string;
  hours: number;
  description: string;
  wbsWo: string;
  billed: boolean;
  note?: string; // Per-entry note, defaults to code's notes at creation
  createdAt?: number; // Unix ms timestamp
  updatedAt?: number;
}

export interface Code {
  id?: string;
  code: string;
  customer: string;
  project: string;
  type: "WBS" | "WO";
  notes?: string; // Pricing / ServiceNow reference notes
}
