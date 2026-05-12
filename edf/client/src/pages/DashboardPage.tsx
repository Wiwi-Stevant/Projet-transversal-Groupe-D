import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { clearAuth } from "../lib/auth";

/**
 * Zone protégée (US-4.3) — tableau de bord avec configuration du seuil (US-4.7).
 */
export function DashboardPage() {
  const navigate = useNavigate();
  const [threshold, setThreshold] = useState<number | null>(null);
  const [newThreshold, setNewThreshold] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  // Récupérer le seuil actuel
  useEffect(() => {
    const fetchThreshold = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/threshold`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setThreshold(data.threshold);
          setNewThreshold(data.threshold.toString());
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du seuil:", err);
      }
    };
    fetchThreshold();
  }, []);

  // Mettre à jour le seuil
  const updateThreshold = async () => {
    const value = parseInt(newThreshold);
    if (isNaN(value) || value < 0) {
      setError("Le seuil doit être un nombre positif.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/threshold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threshold: value }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      setThreshold(value);
    } catch (err) {
      setError("Erreur lors de la mise à jour du seuil.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight">Tableau de bord</h1>
        <div className="flex items-center gap-4">
          <Link
            to="/history"
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
          >
            Historique
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
          >
            Déconnexion
          </button>
        </div>
      </header>
      <main className="px-6 py-10 space-y-8">
        <p className="max-w-xl text-slate-400">
          Tu es connecté. Les routes sous protection nécessitent un jeton valide
          stocké après la page de connexion (US-4.2 / US-4.3).
        </p>

        {/* Configuration du seuil (US-4.7) */}
        <section className="max-w-md">
          <h2 className="text-lg font-medium mb-4">Configuration du seuil</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="threshold" className="block text-sm font-medium text-slate-300 mb-1">
                Seuil actuel: {threshold !== null ? threshold : "Non défini"}
              </label>
              <input
                id="threshold"
                type="number"
                min="0"
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-400 focus:border-slate-500 focus:outline-none"
                placeholder="Entrez le nouveau seuil"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={updateThreshold}
              disabled={loading}
              className="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-600 disabled:opacity-50"
            >
              {loading ? "Mise à jour..." : "Mettre à jour le seuil"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
