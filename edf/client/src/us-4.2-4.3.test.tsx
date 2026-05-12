import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import {
  clearAuth,
  isAuthenticated,
  setAccessToken,
} from "./lib/auth";

describe("US-4.2 / US-4.3 — auth localStorage et garde de route", () => {
  beforeEach(() => {
    localStorage.clear();
    clearAuth();
  });

  afterEach(() => {
    cleanup();
  });

  it("isAuthenticated suit le jeton stocké", () => {
    expect(isAuthenticated()).toBe(false);
    setAccessToken("fake.jwt.token");
    expect(isAuthenticated()).toBe(true);
    clearAuth();
    expect(isAuthenticated()).toBe(false);
  });

  it("sans jeton, ProtectedRoute renvoie vers /login", () => {
    render(
      <MemoryRouter initialEntries={["/prive"]}>
        <Routes>
          <Route path="/login" element={<div>PageLogin</div>} />
          <Route
            path="/prive"
            element={
              <ProtectedRoute>
                <div>ZonePrivee</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("PageLogin")).toBeInTheDocument();
    expect(screen.queryByText("ZonePrivee")).not.toBeInTheDocument();
  });

  it("avec jeton, ProtectedRoute affiche la zone protégée", () => {
    setAccessToken("fake.jwt.token");

    render(
      <MemoryRouter initialEntries={["/prive"]}>
        <Routes>
          <Route path="/login" element={<div>PageLogin</div>} />
          <Route
            path="/prive"
            element={
              <ProtectedRoute>
                <div>ZonePrivee</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("ZonePrivee")).toBeInTheDocument();
    expect(screen.queryByText("PageLogin")).not.toBeInTheDocument();
  });
});
