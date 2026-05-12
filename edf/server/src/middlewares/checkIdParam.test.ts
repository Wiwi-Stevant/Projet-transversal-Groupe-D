import test from "node:test";
import assert from "node:assert/strict";
import { checkIdParam } from "./checkIdParam.js";

function createRes() {
  const state: { status?: number; body?: unknown } = {};

  return {
    state,
    status(code: number) {
      state.status = code;
      return this;
    },
    json(body: unknown) {
      state.body = body;
      return this;
    },
  };
}

test("checkIdParam refuse un id non entier", () => {
  const req = { params: { id: "abc" } } as any;
  const res = createRes() as any;
  let called = false;
  const next = () => {
    called = true;
  };

  checkIdParam(req, res, next);

  assert.equal(called, false);
  assert.equal(res.state.status, 400);
});

test("checkIdParam accepte un id entier", () => {
  const req = { params: { id: "42" } } as any;
  const res = createRes() as any;
  let called = false;
  const next = () => {
    called = true;
  };

  checkIdParam(req, res, next);

  assert.equal(called, true);
  assert.equal(res.state.status, undefined);
});

