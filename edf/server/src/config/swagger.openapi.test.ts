import test from "node:test";
import assert from "node:assert/strict";
import { swaggerSpec } from "./swagger.js";

test("US-2.7 — documentation OpenAPI : spec valide et chemins exposés documentés", () => {
  const spec = swaggerSpec as Record<string, unknown>;

  assert.equal(spec.openapi, "3.0.0");

  const info = spec.info as { title?: string; description?: string };
  assert.ok(info.title && info.title.length > 0);
  assert.ok(info.description && info.description.length > 0);

  assert.ok(Array.isArray(spec.servers) && spec.servers.length >= 1);

  assert.ok(Array.isArray(spec.tags) && spec.tags.length >= 3);

  const components = spec.components as { securitySchemes?: Record<string, unknown> } | undefined;
  const schemes = components?.securitySchemes;
  assert.ok(schemes && typeof schemes === "object");
  assert.ok("bearerAuth" in schemes);

  const paths = spec.paths as Record<string, Record<string, unknown>>;
  assert.ok(paths["/api/led"]?.post);
  assert.ok(paths["/api/threshold"]?.get);
  assert.ok(paths["/api/threshold"]?.post);
  assert.ok(paths["/api/users"]?.get);
  assert.ok(paths["/api/auth/login"]?.post);
});
