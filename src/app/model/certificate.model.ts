// src/app/model/certificate.model.ts
export interface Certificate {
  id: number;          // backend returns Long -> number
  name: string;
  description: string;
}
export interface Certificate {
  id: number;          // backend returns Long -> number
  name: string;
  description: string;
  durationSeconds?: number; // NEW: quiz time in seconds
}
