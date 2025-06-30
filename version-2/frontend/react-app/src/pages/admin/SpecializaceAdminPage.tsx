import { useEffect, useState } from 'react';
import { authHeader } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import AdminSpecializaceForm from './AdminSpecializaceForm';

type Specializace = {
  specializace_id: number;
  nazev_specializace: string;
  popis: string;
};

export default function SpecializaceAdminPage() {
  const { user } = useAuth();
  const [specializace, setSpecializace] = useState<Specializace[]>([]);
  const [zprava, setZprava] = useState('');
  const [uprava, setUprava] = useState<Specializace | null>(null);
  const [novy, setNovy] = useState(false);

  const nacti = () => {
    fetch('/api/v1/specializace/', { headers: authHeader() })
      .then(async (res) => {
        if (!res.ok) {
          setZprava(res.status === 401
            ? 'Nejste přihlášen nebo nemáte oprávnění.'
            : 'Chyba při načítání specializací.');
          return;
        }
        const data = await res.json();
        setSpecializace(data);
      })
      .catch(() => setZprava('Chyba při komunikaci se serverem'));
  };

  useEffect(() => {
    nacti();
  }, []);

  const smazat = async (id: number) => {
    if (!window.confirm('Opravdu smazat specializaci?')) return;
    try {
      const res = await fetch(`/api/v1/specializace/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      if (!res.ok) throw new Error();
      setSpecializace((prev) => prev.filter((s) => s.specializace_id !== id));
    } catch {
      setZprava('Chyba při mazání specializace.');
    }
  };

  if (!user || !['admin', 'vedoucí', 'majitel'].includes(user.role)) {
    return <p className="text-red-600 font-semibold p-4">Přístup zamítnut – nemáte oprávnění.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Specializace – administrace</h2>

      <button
        onClick={() => setNovy(true)}
        className="mb-6 bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
      >
        Přidat specializaci
      </button>

      {zprava && <p className="text-red-600 mb-4">{zprava}</p>}

      {novy && (
        <AdminSpecializaceForm onClose={() => setNovy(false)} onSuccess={nacti} />
      )}
      {uprava && (
        <AdminSpecializaceForm specializace={uprava} onClose={() => setUprava(null)} onSuccess={nacti} />
      )}

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">ID</th>
              <th className="p-2">Název</th>
              <th className="p-2">Popis</th>
              <th className="p-2">Akce</th>
            </tr>
          </thead>
          <tbody>
            {specializace.map((s) => (
              <tr key={s.specializace_id} className="bg-white shadow rounded">
                <td className="p-2">{s.specializace_id}</td>
                <td className="p-2">{s.nazev_specializace}</td>
                <td className="p-2">{s.popis || '—'}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => setUprava(s)}
                    className="text-blue-600 hover:underline"
                  >
                    Upravit
                  </button>
                  <button
                    onClick={() => smazat(s.specializace_id)}
                    className="text-red-600 hover:underline"
                  >
                    Smazat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
