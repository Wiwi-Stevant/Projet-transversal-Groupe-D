import { QueryTypes } from "sequelize";
import sequelize from "../config/database.js";

/** Clé alignée avec `edf/seed.sql` et l’ERD (`activity_threshold`). */
export const THRESHOLD_CONFIG_KEY = "activity_threshold";

export async function getThreshold(): Promise<number | null> {
  const rows = await sequelize.query<{ value: string }>(
    `SELECT value FROM config WHERE key_name = $1 LIMIT 1`,
    { bind: [THRESHOLD_CONFIG_KEY], type: QueryTypes.SELECT },
  );
  const raw = rows[0]?.value;
  if (raw === undefined || raw === null) {
    return null;
  }
  const n = Number.parseInt(String(raw).trim(), 10);
  return Number.isFinite(n) ? n : null;
}

export async function upsertThreshold(threshold: number): Promise<{ threshold: number }> {
  const value = String(Math.trunc(threshold));

  await sequelize.query(
    `INSERT INTO config (key_name, value, updated_by)
     VALUES ($1, $2, NULL)
     ON CONFLICT (key_name) DO UPDATE SET
       value = EXCLUDED.value,
       updated_at = NOW(),
       updated_by = EXCLUDED.updated_by`,
    { bind: [THRESHOLD_CONFIG_KEY, value] },
  );

  return { threshold: Math.trunc(threshold) };
}
