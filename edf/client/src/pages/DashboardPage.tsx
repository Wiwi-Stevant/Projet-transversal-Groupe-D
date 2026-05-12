import { useNavigate } from "react-router-dom";
import { clearAuth } from "../lib/auth";

/**
 * Zone protégée (US-4.3) — exemple de tableau de bord après login.
 */
export function DashboardPage() {
  const navigate = useNavigate();

  const logout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight">Tableau de bord</h1>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
        >
          Déconnexion
        </button>
      </header>
      <main className="px-6 py-10">
        <p className="max-w-xl text-slate-400">
          Tu es connecté. Les routes sous protection nécessitent un jeton valide
          stocké après la page de connexion (US-4.2 / US-4.3).
        </p>
      </main>
    </div>
  );
}
