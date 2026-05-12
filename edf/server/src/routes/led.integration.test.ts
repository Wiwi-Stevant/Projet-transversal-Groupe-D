import test from "node:test";
import assert from "node:assert/strict";
import sequelize from "../config/database.js";
import { getLedStateValue, upsertLedState } from "../services/ledService.js";

test("US-2.5 — POST /api/led : persistance led_state (on / off) dans config", async (t) => {
  try {
    await sequelize.authenticate();
  } catch {
    t.skip(
      "PostgreSQL indisponible (docker compose -f docker-compose.db.yml up -d)",
    );
    return;
  }

  try {
    await upsertLedState(true);
    assert.equal(await getLedStateValue(), "on");

    await upsertLedState(false);
    assert.equal(await getLedStateValue(), "off");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("does not exist")) {
      t.skip(
        "Schéma SQL absent sur cette base — appliquer edf/db.sql (ex. docker-compose.db.yml, POSTGRES_DB=edf)",
      );
      return;
    }
    throw err;
  }
});
