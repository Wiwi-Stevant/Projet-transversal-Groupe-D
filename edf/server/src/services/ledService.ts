import { QueryTypes } from "sequelize";
import sequelize from "../config/database.js";

export const LED_STATE_KEY = "led_state";

export async function upsertLedState(on: boolean): Promise<{ led: string; on: boolean }> {
  const value = on ? "on" : "off";

  await sequelize.query(
    `INSERT INTO config (key_name, value, updated_by)
     VALUES ($1, $2, NULL)
     ON CONFLICT (key_name) DO UPDATE SET
       value = EXCLUDED.value,
       updated_at = NOW(),
       updated_by = EXCLUDED.updated_by`,
    { bind: [LED_STATE_KEY, value] },
  );

  return { led: value, on };
}

export async function getLedStateValue(): Promise<string | null> {
  const rows = await sequelize.query<{ value: string }>(
    `SELECT value FROM config WHERE key_name = $1 LIMIT 1`,
    { bind: [LED_STATE_KEY], type: QueryTypes.SELECT },
  );
  return rows[0]?.value ?? null;
}
