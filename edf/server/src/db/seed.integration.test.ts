import test from "node:test";
import assert from "node:assert/strict";
import pg from "pg";

const { Client } = pg;

function connectionOptions(): pg.ClientConfig {
  return {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? process.env.POSTGRES_PORT ?? 5432),
    user: process.env.DB_USER ?? process.env.POSTGRES_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? process.env.POSTGRES_PASSWORD ?? "postgres",
    database:
      process.env.DB_NAME ??
      process.env.POSTGRES_DB ??
      "edf",
    connectionTimeoutMillis: 3_000,
  };
}

async function tryConnect(): Promise<pg.Client | null> {
  const client = new Client(connectionOptions());
  try {
    await client.connect();
    return client;
  } catch {
    await client.end().catch(() => {});
    return null;
  }
}

test("US-1.3 — seed PostgreSQL : utilisateurs, événements et config attendus", async (t) => {
  const client = await tryConnect();
  if (!client) {
    t.skip(
      "PostgreSQL indisponible (lancer : docker compose -f docker-compose.db.yml up -d)",
    );
    return;
  }

  try {
    const { rows: userRows } = await client.query<{ n: string }>(
      `SELECT email AS n FROM users WHERE email IN ('demo@edf.local', 'admin@edf.local') ORDER BY email`,
    );
    assert.deepEqual(
      userRows.map((r: { n: string }) => r.n),
      ["admin@edf.local", "demo@edf.local"],
    );

    const { rows: eventCount } = await client.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM events`,
    );
    assert.equal(Number(eventCount[0]?.c), 3);

    const { rows: threshold } = await client.query<{ v: string }>(
      `SELECT value AS v FROM config WHERE key_name = 'activity_threshold'`,
    );
    assert.equal(threshold[0]?.v, "100");

    const { rows: site } = await client.query<{ v: string }>(
      `SELECT value AS v FROM config WHERE key_name = 'site_name'`,
    );
    assert.equal(site[0]?.v, "EDF Demo");
  } finally {
    await client.end();
  }
});
