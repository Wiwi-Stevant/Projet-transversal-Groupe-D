import { useState } from "react";

interface LoginProps {
  onLoginSuccess: (email: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Utilisation de "as any" pour forcer TypeScript à accepter 'env' de Vite
  const API_URL = (import.meta as any).env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // On utilise l'URL dynamique récupérée du .env.production
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // On stocke l'email et on informe App.tsx
        onLoginSuccess(email);
      } else {
        setError(data.message || "Identifiants incorrects");
      }
    } catch (err) {
      console.error("Erreur Login:", err);
      setError("Erreur de connexion au serveur (Vérifiez l'IP)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-700">
        
        {/* Header EDF Style */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-8 text-center">
          <div className="inline-block bg-yellow-400 p-3 rounded-2xl mb-4 shadow-lg shadow-yellow-500/20">
            <div className="w-6 h-6 bg-blue-900 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">
            EDF <span className="font-light text-blue-200">Access</span>
          </h2>
          <p className="text-blue-200/60 text-sm mt-1">Système de Monitoring Industriel</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
              Adresse Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900"
              placeholder="admin@edf.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
              Mot de passe
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {loading ? "Vérification..." : "SE CONNECTER"}
          </button>

          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-tighter">
              Accès réservé au personnel autorisé - Groupe D
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}