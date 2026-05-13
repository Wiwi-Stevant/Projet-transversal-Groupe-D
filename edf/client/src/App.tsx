import { useState, useEffect } from "react";
import Login from "./components/Login";
import StatsDashboard, { type EventData } from "./components/StatsDashboard";

function App() {
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem("userEmail"));
  const [events, setEvents] = useState<EventData[]>([]);

  // 1. On récupère l'URL configurée dans le .env (Vite utilise import.meta.env)
  const API_URL = import.meta.env.VITE_API_URL || '/api';

  const fetchEvents = async () => {
    try {
      // 2. On utilise l'URL dynamique ici !
      const response = await fetch(`${API_URL}/events`);
      if (!response.ok) throw new Error("Erreur serveur");
      const data = await response.json();
      setEvents(data);
    } catch (e) {
      console.error("Erreur Fetch:", e);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchEvents();
      const interval = setInterval(fetchEvents, 5000);
      return () => clearInterval(interval);
    }
  }, [userEmail]);

  if (!userEmail) return <Login onLoginSuccess={(email) => {
    localStorage.setItem("userEmail", email);
    setUserEmail(email);
  }} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-black tracking-tighter">EDF MONITORING</h1>
        <div className="flex items-center gap-4">
          <span className="text-xs bg-blue-800 px-3 py-1 rounded-full border border-blue-700">👤 {userEmail}</span>
          <button 
            onClick={() => { localStorage.clear(); setUserEmail(null); }}
            className="text-xs font-bold text-blue-300 hover:text-white uppercase tracking-widest"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-10 px-4">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Dashboard de Fréquentation</h2>
          <p className="text-gray-500">Données consolidées des capteurs Raspberry Pi</p>
        </div>

        <StatsDashboard events={events} />
      </main>
    </div>
  );
}

export default App;