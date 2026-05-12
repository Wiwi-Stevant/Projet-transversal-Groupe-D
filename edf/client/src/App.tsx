import { useState } from "react";
import "./App.css";

interface User {
  id: number;
  nom?: string;
  prenom?: string;
  username?: string;
  role: string;
  isActive?: boolean;
}

type AppView = "login" | "profile" | "users";

function App() {
  const [view, setView] = useState<AppView>("login");
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );

  // ============================================
  // 1. LOGIN
  // ============================================
  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
          credentials: "include", // Pour les cookies
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();

      // Sauvegarder l'Access Token
      localStorage.setItem("accessToken", data.accessToken);
      setAccessToken(data.accessToken);
      setCurrentUser(data.user);
      setView("profile");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur de connexion"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 2. GET PROFILE (protégé)
  // ============================================
  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        setAccessToken(null);
        setView("login");
        setError("Token expiré, reconnexion required");
        return;
      }

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();
      setCurrentUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  // ============================================
  // 3. GET USERS
  // ============================================
  const fetchUsers = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 4. LOGOUT
  // ============================================
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken(null);
    setCurrentUser(null);
    setView("login");
    setError(null);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="App" style={{ padding: "20px", fontFamily: "Arial" }}>
      <header style={{ marginBottom: "30px" }}>
        <h1>🔐 Authentification JWT</h1>
        {accessToken && (
          <button onClick={handleLogout} style={{ padding: "10px 20px" }}>
            ❌ Logout
          </button>
        )}
      </header>

      {error && (
        <div style={{ color: "red", marginBottom: "20px", padding: "10px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* LOGIN VIEW */}
      {view === "login" && (
        <LoginForm onLogin={handleLogin} loading={loading} />
      )}

      {/* PROFILE VIEW */}
      {view === "profile" && accessToken && (
        <div>
          <button onClick={() => fetchProfile(accessToken)}>
            🔄 Rafraîchir le profil
          </button>
          <button onClick={() => { fetchUsers(accessToken); setView("users"); }} 
                  style={{ marginLeft: "10px" }}>
            👥 Voir la liste des users
          </button>
          {currentUser && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                border: "1px solid #ccc",
              }}
            >
              <h2>📋 Votre profil</h2>
              <p>
                <strong>ID:</strong> {currentUser.id}
              </p>
              <p>
                <strong>Username:</strong> {currentUser.username}
              </p>
              <p>
                <strong>Rôle:</strong> {currentUser.role}
              </p>
            </div>
          )}
        </div>
      )}

      {/* USERS VIEW */}
      {view === "users" && accessToken && (
        <div>
          <button onClick={() => setView("profile")}>← Retour au profil</button>
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <div style={{ marginTop: "20px" }}>
              <h2>👥 Liste des users</h2>
              {users.length === 0 ? (
                <p>Aucun user trouvé.</p>
              ) : (
                <ul>
                  {users.map((user) => (
                    <li key={user.id}>
                      {user.prenom} {user.nom} - Rôle: {user.role} -
                      {user.isActive ? " ✅ Actif" : " ❌ Inactif"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// LOGIN FORM COMPONENT
// ============================================

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
  loading: boolean;
}

function LoginForm({ onLogin, loading }: LoginFormProps) {
  const [username, setUsername] = useState("student");
  const [password, setPassword] = useState("password123");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "400px",
        margin: "0 auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2>🔑 Connexion</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              display: "block",
              marginTop: "5px",
              padding: "8px",
              width: "100%",
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              display: "block",
              marginTop: "5px",
              padding: "8px",
              width: "100%",
            }}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>

      <p style={{ fontSize: "12px", marginTop: "15px", color: "#666" }}>
        💡 Identifiants de démo:
        <br />
        Username: <strong>student</strong>
        <br />
        Password: <strong>password123</strong>
      </p>
    </form>
  );
}

export default App;
