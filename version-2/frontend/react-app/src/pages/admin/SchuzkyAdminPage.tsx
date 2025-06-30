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
  const [od, setOd] = useState('');
  const [doDatum, setDoDatum] = useState('');
  const { user } = useAuth();

  const nacti = () => {
    let url = '/api/v1/schuzky/';
    const params = new URLSearchParams();
    if (od) params.append('od', od);
    if (doDatum) params.append('do', doDatum);
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url, { headers: authHeader() })
      .then(async (res) => {
        if (!res.ok) {
          setZprava(res.status === 401
            ? 'Nejste přihlášen nebo nemáte oprávnění.'
            : 'Chyba při načítání schůzek.');
          return;
        }
        const data = await res.json();
        setSchuzky(data);
      })
      .catch(() => setZprava('Chyba při komunikaci se serverem'));
  };

  useEffect(() => {
    nacti();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    return <p className="text-red-600 font-semibold p-4">Přístup zamítnut – nemáte oprávnění.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Schůzky – administrace</h2>

      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block font-semibold mb-1">Datum od</label>
          <input
            type="date"
            value={od}
            onChange={(e) => setOd(e.target.value)}
            className="border px-3 py-2 rounded shadow-sm"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Datum do</label>
          <input
            type="date"
            value={doDatum}
            onChange={(e) => setDoDatum(e.target.value)}
            className="border px-3 py-2 rounded shadow-sm"
          />
        </div>
        <button
          onClick={nacti}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          Filtrovat
        </button>
        <button
          onClick={() => {
            setOd('');
            setDoDatum('');
            nacti();
          }}
          className="bg-gray-300 text-white px-4 py-2 rounded shadow hover:bg-gray-400 transition"
        >
          Vymazat filtr
        </button>
      </div>

      <button
        onClick={() => setNovy(true)}
        className="mb-6 bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
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

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">ID</th>
              <th className="p-2">Zákazník</th>
              <th className="p-2">Pracovník</th>
              <th className="p-2">Datum</th>
              <th className="p-2">Čas</th>
              <th className="p-2">Stav</th>
              <th className="p-2">Poznámka</th>
              <th className="p-2">Akce</th>
            </tr>
          </thead>
          <tbody>
            {schuzky.map((s) => (
              <tr key={s.schuzka_id} className="bg-white shadow rounded">
                <td className="p-2">{s.schuzka_id}</td>
                <td className="p-2">{s.rezervace?.jmeno_prijmeni || '—'}</td>
                <td className="p-2">{s.pracovnici?.jmeno_prijmeni || '—'}</td>
                <td className="p-2">{s.rezervace?.rezervovane_datum || '—'}</td>
                <td className="p-2">{s.rezervace?.rezervovany_cas || '—'}</td>
                <td className="p-2">{s.stav}</td>
                <td className="p-2">{s.poznamka}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => setUprava(s)}
                    className="text-blue-600 hover:underline"
                  >
                    Upravit
                  </button>
                  <button
                    onClick={() => smazat(s.schuzka_id)}
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
