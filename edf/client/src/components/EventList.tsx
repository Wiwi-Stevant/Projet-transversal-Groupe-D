import { useEffect, useState } from 'react';

// On exporte l'interface pour qu'App.tsx et StatsDashboard puissent l'utiliser
export interface EventData {
  id: number;
  type: string;
  value: string;
  device_id: string;
  createdAt: string;
}

interface EventListProps {
  events: EventData[];
}

export default function EventList({ events }: EventListProps) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Journal Brut des Activités</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Capteur</th>
              <th className="px-6 py-3 text-left font-semibold">Valeur</th>
              <th className="px-6 py-3 text-left font-semibold">Appareil</th>
              <th className="px-6 py-3 text-left font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">{event.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{event.value}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{event.device_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {new Date(event.createdAt).toLocaleString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}