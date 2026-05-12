import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface Event {
  id: number;
  type: string;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Page historique paginée (US-4.8)
 */
export function HistoryPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchEvents = async (pageNum: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/events?page=${pageNum}&limit=10`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();
      setEvents(data.events);
      setPagination(data.pagination);
    } catch (err) {
      setError("Erreur lors du chargement des événements.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(page);
  }, [page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setPage(newPage);
    }
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight">Historique des événements</h1>
        <Link
          to="/"
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
        >
          Retour au tableau de bord
        </Link>
      </header>
      <main className="px-6 py-10">
        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950/50 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">
            <p className="text-slate-400">Chargement...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-700">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">ID</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Type</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-slate-800">
                      <td className="px-4 py-2 text-sm text-slate-100">{event.id}</td>
                      <td className="px-4 py-2 text-sm text-slate-100">{event.type}</td>
                      <td className="px-4 py-2 text-sm text-slate-100">
                        {new Date(event.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Page {pagination.page} sur {pagination.totalPages} ({pagination.total} événements)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= pagination.totalPages}
                    className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}