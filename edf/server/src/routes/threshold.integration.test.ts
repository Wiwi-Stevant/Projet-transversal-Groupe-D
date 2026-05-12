import test from "node:test";
import assert from "node:assert/strict";
import sequelize from "../config/database.js";
import { getThreshold, upsertThreshold } from "../services/thresholdService.js";

test("US-2.6 — GET/POST /api/threshold : persistance activity_threshold dans config", async (t) => {
  try {
    await sequelize.authenticate();
  } catch {
    t.skip(
      "PostgreSQL indisponible (docker compose -f docker-compose.db.yml up -d)",
    );
    return;
  }

  try {
    await upsertThreshold(42);
    assert.equal(await getThreshold(), 42);

    await upsertThreshold(7);
    assert.equal(await getThreshold(), 7);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("does not exist")) {
      t.skip(
        "Schéma SQL absent sur cette base — appliquer edf/db.sql (ex. docker-compose.db.yml, POSTGRES_DB=edf)",
      );
      return;
    }
    throw err;
  } finally {
    try {
      await upsertThreshold(100);
    } catch {
      /* remettre la valeur seed pour les autres tests (US-1.3) */
    }
  }
});
