import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

// Interface unique pour toute l'application
export interface EventData {
  id: number;
  type: string;
  value: string;
  device_id: string;
  created_at: string; // Nom exact dans ta DB Postgres
}

interface StatsDashboardProps {
  events: EventData[];
}

export default function StatsDashboard({ events }: StatsDashboardProps) {
  // Séparation par Raspberry (Utilisation des IDs de ta DB)
  const rpi1 = events.filter(e => e.device_id === 'pico_w_001').slice(0, 5);
  const rpi2 = events.filter(e => e.device_id === 'pico_fictive_002' || e.device_id === 'FICTIVE 02').slice(0, 5);

  // Données du graphique (7 derniers jours)
  const chartData = () => {
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('fr-FR');
    }).reverse();

    return days.map(date => ({
      name: date,
      Salon: events.filter(e => 
        e.device_id === 'pico_w_001' && 
        new Date(e.created_at).toLocaleDateString('fr-FR') === date
      ).length,
      Cuisine: events.filter(e => 
        (e.device_id === 'pico_fictive_002' || e.device_id === 'FICTIVE 02') && 
        new Date(e.created_at).toLocaleDateString('fr-FR') === date
      ).length,
    }));
  };

  const TableMini = ({ data, title, color }: { data: EventData[], title: string, color: string }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
      <div className={`p-3 ${color} text-white font-bold text-xs flex justify-between uppercase tracking-wider`}>
        <span>{title}</span>
        <span className="opacity-70">Live</span>
      </div>
      <table className="w-full text-sm text-left">
        <tbody className="divide-y divide-gray-50">
          {data.length > 0 ? data.map(e => (
            <tr key={e.id} className="hover:bg-gray-50">
              <td className="p-3 font-semibold text-gray-700">{e.type.toUpperCase()}</td>
              <td className="p-3 text-gray-400 text-xs text-right">
                {new Date(e.created_at).toLocaleTimeString('fr-FR')}
              </td>
            </tr>
          )) : <tr><td className="p-4 text-center text-gray-400 italic">Aucune donnée</td></tr>}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold mb-6 text-gray-800">Fréquentation Comparative (7j)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData()}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={11} tickMargin={10} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="Salon" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Cuisine" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TableMini data={rpi1} title="📍 Salon (Pico 01)" color="bg-blue-900" />
        <TableMini data={rpi2} title="📍 Cuisine (Fictive 02)" color="bg-yellow-500" />
      </div>
    </div>
  );
}