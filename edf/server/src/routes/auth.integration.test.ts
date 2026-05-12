import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import sequelize from "../config/database.js";
import {
  loginWithTokens,
  registerUser,
} from "../services/authService.js";
import { HttpError } from "../services/userService.js";

test("US-3.2 et US-3.3 — inscription (bcrypt) et connexion JWT", async (t) => {
  if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    t.skip(
      "JWT_ACCESS_SECRET et JWT_REFRESH_SECRET requis pour tester les tokens.",
    );
    return;
  }

  try {
    await sequelize.authenticate();
  } catch {
    t.skip(
      "PostgreSQL indisponible (docker compose -f docker-compose.db.yml up -d)",
    );
    return;
  }

  try {
    const email = `auth_${Date.now()}@edf.local`;
    const password = "password123";

    const registered = await registerUser(email, password);
    assert.equal(registered.email, email);
    assert.ok(Number.isFinite(registered.id));

    await assert.rejects(
      async () => registerUser(email, password),
      (err: unknown) => err instanceof HttpError && err.status === 409,
    );

    const out = await loginWithTokens(email, password);
    assert.equal(out.user.email, email);

    const decoded = jwt.verify(
      out.accessToken,
      process.env.JWT_ACCESS_SECRET!,
    ) as jwt.JwtPayload & { email?: string };
    assert.equal(decoded.email, email);

    jwt.verify(out.refreshToken, process.env.JWT_REFRESH_SECRET!);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("does not exist")) {
      t.skip(
        "Schéma SQL absent — appliquer edf/db.sql (docker-compose.db.yml, POSTGRES_DB=edf)",
      );
      return;
    }
    throw err;
  }
});
