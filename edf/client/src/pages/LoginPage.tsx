import { useState, type FormEvent } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  apiBaseUrl,
  clearAuth,
  isAuthenticated,
  setAccessToken,
} from "../lib/auth";

type LoginLocationState = { from?: string };

/**
 * US-4.2 — connexion via POST `/api/auth/login` (email + mot de passe).
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as LoginLocationState | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        accessToken?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : `Erreur ${res.status}`,
        );
      }

      if (!data.accessToken) {
        throw new Error("Réponse invalide du serveur.");
      }

      clearAuth();
      setAccessToken(data.accessToken);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl backdrop-blur">
        <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-slate-50">
          Connexion
        </h1>
        <p className="mb-8 text-center text-sm text-slate-400">
          EDF — accès sécurisé (JWT)
        </p>

        {error ? (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-500/40 bg-red-950/50 px-3 py-2 text-sm text-red-100"
          >
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-amber-500/0 transition focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
