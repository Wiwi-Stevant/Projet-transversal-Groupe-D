import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export interface EventData {
  id: number;
  type: string;
  value: string;
  device_id: string;
  createdAt: string;
}

interface StatsDashboardProps {
  events: EventData[];
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ events }) => {
  
  // --- LOGIQUE DE TRAITEMENT DES DONNÉES ---
  const processData = () => {
    const dataMap: { [key: string]: { name: string; salon: number; cuisine: number } } = {};

    events.forEach((event) => {
      // 1. Formater la date en JJ/MM
      const dateObj = new Date(event.createdAt);
      if (isNaN(dateObj.getTime())) return; // Sécurité si date invalide

      const dayMonth = dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
      });

      // 2. Initialiser le jour s'il n'existe pas encore
      if (!dataMap[dayMonth]) {
        dataMap[dayMonth] = { name: dayMonth, salon: 0, cuisine: 0 };
      }

      // 3. Incrémenter selon l'ID du device (BIEN VÉRIFIER LES STRINGS ICI)
      // On utilise .trim() et .toUpperCase() pour éviter les erreurs de frappe
      const deviceId = event.device_id.trim();
      
      if (deviceId === 'PICO 01') {
        dataMap[dayMonth].salon += 1;
      } else if (deviceId === 'FICTIVE 02') {
        dataMap[dayMonth].cuisine += 1;
      }
    });

    // 4. Convertir en tableau et TRIER par date pour Recharts
    return Object.values(dataMap).sort((a, b) => {
      const [dayA, monthA] = a.name.split('/').map(Number);
      const [dayB, monthB] = b.name.split('/').map(Number);
      return new Date(2026, monthA - 1, dayA).getTime() - new Date(2026, monthB - 1, dayB).getTime();
    });
  };

  const chartData = processData();

  // Filtrer les derniers événements pour les listes latérales
  const lastSalon = events.filter(e => e.device_id === 'PICO 01').slice(-5).reverse();
  const lastCuisine = events.filter(e => e.device_id === 'FICTIVE 02').slice(-5).reverse();

  return (
    <div className="space-y-8">
      {/* GRAPHIQUE PRINCIPAL */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
          Fréquentation des 7 derniers jours
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend iconType="circle" />
              <Bar dataKey="salon" name="Salon (PICO 01)" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cuisine" name="Cuisine (FICTIVE 02)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LISTES LATÉRALES (TEMPS RÉEL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Salon */}
        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
          <h4 className="font-bold text-blue-900 mb-4 flex justify-between">
            Dernières entrées Salon
            <span className="text-blue-500 text-xs">PICO 01</span>
          </h4>
          <ul className="space-y-3">
            {lastSalon.length > 0 ? lastSalon.map(e => (
              <li key={e.id} className="bg-white p-3 rounded-xl shadow-sm text-sm flex justify-between border border-blue-50">
                <span className="font-medium text-slate-700">👤 Entrée détectée</span>
                <span className="text-slate-400">{new Date(e.createdAt).toLocaleTimeString()}</span>
              </li>
            )) : <p className="text-blue-400 text-sm italic">En attente de données...</p>}
          </ul>
        </div>

        {/* Cuisine */}
        <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100">
          <h4 className="font-bold text-orange-900 mb-4 flex justify-between">
            Dernières entrées Cuisine
            <span className="text-orange-500 text-xs">FICTIVE 02</span>
          </h4>
          <ul className="space-y-3">
            {lastCuisine.length > 0 ? lastCuisine.map(e => (
              <li key={e.id} className="bg-white p-3 rounded-xl shadow-sm text-sm flex justify-between border border-orange-50">
                <span className="font-medium text-slate-700">👤 Entrée détectée</span>
                <span className="text-slate-400">{new Date(e.createdAt).toLocaleTimeString()}</span>
              </li>
            )) : <p className="text-orange-400 text-sm italic">En attente de données...</p>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;