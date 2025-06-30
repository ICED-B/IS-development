import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authHeader } from '../services/auth';

type Rezervace = {
  rezervace_id: number;
  jmeno_prijmeni: string;
  email: string;
  tel: string;
  produkt: {
    nazev_produktu: string;
  };
  rezervovane_datum: string;
  rezervovany_cas: string;
  stav: string;
};

export default function MojeRezervacePage() {
  const { user } = useAuth();
  const [rezervace, setRezervace] = useState<Rezervace[]>([]);
  const [zprava, setZprava] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'zakaznik') return;
    fetch('/api/v1/rezervace/moje', { headers: authHeader() })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 403) setZprava('Nemáte oprávnění zobrazit rezervace.');
          else setZprava('Nepodařilo se načíst rezervace.');
          return;
        }
        const data = await res.json();
        setRezervace(data);
      })
      .catch(() => setZprava('Chyba při komunikaci se serverem'));
  }, [user]);

  const zrusitRezervaci = async (id: number) => {
    if (!window.confirm('Opravdu chcete zrušit tuto rezervaci?')) return;
    try {
      const res = await fetch(`/api/v1/rezervace/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      if (!res.ok) throw new Error();
      setRezervace((prev) => prev.filter((r) => r.rezervace_id !== id));
    } catch {
      setZprava('Rezervaci se nepodařilo zrušit');
    }
  };

  if (!user)
    return <p className="text-red-500 text-center mt-6">Pro zobrazení rezervací se prosím přihlaste.</p>;
  if (user.role !== 'zakaznik')
    return <p className="text-red-500 text-center mt-6">Tuto stránku mohou zobrazit pouze zákazníci.</p>;

  const barvaStavu = (stav: string) => {
    if (stav === 'schváleno') return 'text-green-600 font-medium';
    if (stav === 'zamítnuto') return 'text-red-600 font-medium';
    return 'text-yellow-600 font-medium';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Moje rezervace</h2>

        {zprava && <p className="text-red-600 text-center mb-4">{zprava}</p>}

        {rezervace.length === 0 ? (
          <p className="text-center text-gray-600">Nemáte žádné rezervace.</p>
        ) : (
          <div className="space-y-6">
            {rezervace.map((r) => (
              <div
                key={r.rezervace_id}
                className="bg-white border border-blue-100 rounded-xl shadow p-5"
              >
                <h3 className="text-xl font-semibold text-blue-700 mb-2">
                  {r.produkt?.nazev_produktu ?? 'Neznámý produkt'}
                </h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <strong>Datum:</strong> {r.rezervovane_datum} &nbsp; | &nbsp; <strong>Čas:</strong>{' '}
                    {r.rezervovany_cas}
                  </p>
                  <p>
                    <strong>Stav:</strong>{' '}
                    <span className={barvaStavu(r.stav)}>{r.stav}</span>
                  </p>
                </div>
                <button
                  onClick={() => zrusitRezervaci(r.rezervace_id)}
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow transition"
                >
                  Zrušit rezervaci
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
