import { test, before, after } from "node:test";
import assert from "node:assert";
import sequelize from "../config/database.js";
import User from "../models/User.js";
import app from "../server.js";
import supertest from "supertest";

test("US-2.3 — GET /api/events : liste paginée des événements", async () => {
  // Vérifier que la DB est disponible
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.log("# PostgreSQL indisponible (lancer : docker compose -f docker-compose.db.yml up -d)");
    return;
  }

  const agent = supertest.agent(app);

  // Connexion pour obtenir un token
  const loginResponse = await agent
    .post("/api/auth/login")
    .send({ email: "demo@edf.local", password: "edf-seed" });

  assert.strictEqual(loginResponse.status, 200);
  const { accessToken } = loginResponse.body;

  // Test sans pagination (page 1, limit 10 par défaut)
  const response = await agent
    .get("/api/events")
    .set("Authorization", `Bearer ${accessToken}`);

  assert.strictEqual(response.status, 200);
  assert.ok(Array.isArray(response.body.events));
  assert.ok(response.body.pagination);
  assert.strictEqual(typeof response.body.pagination.page, "number");
  assert.strictEqual(typeof response.body.pagination.total, "number");

  // Vérifier la structure des événements
  if (response.body.events.length > 0) {
    const event = response.body.events[0];
    assert.strictEqual(typeof event.id, "number");
    assert.strictEqual(typeof event.type, "string");
    assert.strictEqual(typeof event.created_at, "string");
  }

  // Test avec pagination personnalisée
  const paginatedResponse = await agent
    .get("/api/events?page=1&limit=5")
    .set("Authorization", `Bearer ${accessToken}`);

  assert.strictEqual(paginatedResponse.status, 200);
  assert.ok(paginatedResponse.body.events.length <= 5);
  assert.strictEqual(paginatedResponse.body.pagination.limit, 5);
});