// Upravená SchuzkyAdminPage.tsx pro správné zobrazení schůzek
import { useEffect, useState } from 'react';
import { authHeader } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import AdminSchuzkaForm from './AdminSchuzkaForm';

interface Schuzka {
  schuzka_id: number;
  rezervace: {
    jmeno_prijmeni: string;
    rezervovane_datum: string;
    rezervovany_cas: string;
  };
  pracovnici: {
    jmeno_prijmeni: string;
  };
  rezervace_id: number;
  pracovnici_id: number;
  stav: string;
  poznamka: string;
}

export default function SchuzkyAdminPage() {
  const [schuzky, setSchuzky] = useState<Schuzka[]>([]);
  const [zprava, setZprava] = useState('');
  const [uprava, setUprava] = useState<Schuzka | null>(null);
  const [novy, setNovy] = useState(false);
  const { user } = useAuth();

  const nacti = () => {
    fetch('/api/v1/schuzky/', { headers: authHeader() })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) setZprava('Nejste přihlášen nebo nemáte oprávnění.');
          else setZprava('Chyba při načítání schůzek.');
          return;
        }
        const data = await res.json();
        setSchuzky(data);
      })
      .catch(() => setZprava('Chyba při komunikaci se serverem'));
  };

  useEffect(() => {
    nacti();
  }, []);

  const smazat = async (id: number) => {
    if (!window.confirm('Opravdu smazat schůzku?')) return;
    try {
      const res = await fetch(`/api/v1/schuzky/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      if (!res.ok) throw new Error();
      setSchuzky((prev) => prev.filter((s) => s.schuzka_id !== id));
    } catch {
      setZprava('Chyba při mazání schůzky.');
    }
  };

  if (!user || !['admin', 'vedoucí', 'majitel'].includes(user.role)) {
    return <p className="text-red-600 font-semibold">Přístup zamítnut – nemáte oprávnění.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Schůzky – administrace</h2>

      <button
        onClick={() => setNovy(true)}
        className="mb-4 bg-blue-600 text-white px-4 py-1 rounded"
      >
        Přidat schůzku
      </button>

      {zprava && <p className="text-red-600 mb-4">{zprava}</p>}

      {novy && (
        <AdminSchuzkaForm onClose={() => setNovy(false)} onSuccess={nacti} />
      )}
      {uprava && (
        <AdminSchuzkaForm schuzka={uprava} onClose={() => setUprava(null)} onSuccess={nacti} />
      )}

      <table className="table-auto w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Zákazník</th>
            <th className="p-2 text-left">Pracovník</th>
            <th className="p-2 text-left">Datum</th>
            <th className="p-2 text-left">Čas</th>
            <th className="p-2 text-left">Stav</th>
            <th className="p-2 text-left">Poznámka</th>
            <th className="p-2 text-left">Akce</th>
          </tr>
        </thead>
        <tbody>
          {schuzky.map((s) => (
            <tr key={s.schuzka_id} className="bg-white shadow-sm rounded">
              <td className="p-2">{s.schuzka_id}</td>
              <td className="p-2">{s.rezervace?.jmeno_prijmeni || '—'}</td>
              <td className="p-2">{s.pracovnici?.jmeno_prijmeni || '—'}</td>
              <td className="p-2">{s.rezervace?.rezervovane_datum || '—'}</td>
              <td className="p-2">{s.rezervace?.rezervovany_cas || '—'}</td>
              <td className="p-2">{s.stav}</td>
              <td className="p-2">{s.poznamka}</td>
              <td className="p-2">
                <button
                  onClick={() => setUprava(s)}
                  className="mr-2 text-blue-600 underline"
                >
                  Upravit
                </button>
                <button
                  onClick={() => smazat(s.schuzka_id)}
                  className="text-red-600 underline"
                >
                  Smazat
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
