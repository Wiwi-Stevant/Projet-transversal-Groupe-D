import { useState } from "react";
import "./App.css";

interface User {
  id: number;
  email: string;
  role: string;
}

type AppView = "login" | "profile" | "users";

function App() {
  const [view, setView] = useState<AppView>("login");
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );

  // ============================================
  // 1. LOGIN (Mise à jour : email au lieu de username)
  // ============================================
  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // On envoie bien l'email pour matcher le backend
          body: JSON.stringify({ email, password }),
          credentials: "include", // Important pour les cookies de session
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erreur ${response.status}`);
      }

      // Sauvegarder l'Access Token
      localStorage.setItem("accessToken", data.accessToken);
      setAccessToken(data.accessToken);
      setCurrentUser(data.user);
      setView("profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 2. GET PROFILE
  // ============================================
  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleLogout();
        setError("Session expirée");
        return;
      }

      const data = await response.json();
      setCurrentUser(data.user);
    } catch (err) {
      setError("Impossible de charger le profil");
    }
  };

  // ============================================
  // 3. LOGOUT
  // ============================================
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken(null);
    setCurrentUser(null);
    setView("login");
    setError(null);
  };

  return (
    <div className="App" style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <header style={{ borderBottom: "1px solid #eee", marginBottom: "20px", paddingBottom: "10px" }}>
        <h1>🔐 Projet IoT - Auth Bcrypt</h1>
        {accessToken && (
          <button onClick={handleLogout} style={{ backgroundColor: "#ff4444", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer" }}>
            Déconnexion
          </button>
        )}
      </header>

      {error && (
        <div style={{ backgroundColor: "#ffebee", color: "#c62828", padding: "10px", borderRadius: "4px", marginBottom: "20px" }}>
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {/* VUE LOGIN */}
      {view === "login" && (
        <LoginForm onLogin={handleLogin} loading={loading} />
      )}

      {/* VUE PROFIL */}
      {view === "profile" && currentUser && (
        <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "left", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
          <h2>✅ Connexion réussie !</h2>
          <p><strong>Email :</strong> {currentUser.email}</p>
          <p><strong>ID Utilisateur :</strong> {currentUser.id}</p>
          <p><strong>Statut :</strong> Authentifié via JWT & Bcrypt</p>
          
          <button 
            onClick={() => fetchProfile(accessToken!)}
            style={{ marginTop: "10px", padding: "8px 12px", cursor: "pointer" }}
          >
            Vérifier le Token
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPOSANT FORMULAIRE (Mise à jour Email)
// ============================================

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  loading: boolean;
}

function LoginForm({ onLogin, loading }: LoginFormProps) {
  const [email, setEmail] = useState("jean.dupont@test.com");
  const [password, setPassword] = useState("password123");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto", padding: "30px", border: "1px solid #ccc", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
      <h2 style={{ marginTop: 0 }}>Connexion</h2>
      
      <div style={{ marginBottom: "15px", textAlign: "left" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Email :</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>

      <div style={{ marginBottom: "20px", textAlign: "left" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Mot de passe :</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{ width: "100%", padding: "12px", backgroundColor: loading ? "#ccc" : "#2196F3", color: "white", border: "none", borderRadius: "4px", fontSize: "16px", cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "Vérification..." : "Se connecter"}
      </button>

      <div style={{ marginTop: "20px", fontSize: "13px", color: "#666", backgroundColor: "#f9f9f9", padding: "10px", borderRadius: "4px" }}>
        <strong>Testez avec :</strong><br />
        Email: <code>jean.dupont@test.com</code><br />
        Pass: <code>password123</code>
      </div>
    </form>
  );
}

export default App;