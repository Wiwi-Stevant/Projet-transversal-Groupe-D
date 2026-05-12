import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../lib/auth";

type Props = { children: ReactNode };

/**
 * US-4.3 — redirige vers `/login` si aucun jeton d’accès en localStorage.
 */
export function ProtectedRoute({ children }: Props) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }

  return children;
}
