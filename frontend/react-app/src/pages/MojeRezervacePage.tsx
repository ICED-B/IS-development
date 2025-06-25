// src/pages/MojeRezervacePage.tsx
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

  if (!user) return <p className="text-red-500">Pro zobrazení rezervací se prosím přihlaste.</p>;
  if (user.role !== 'zakaznik') return <p className="text-red-500">Tuto stránku mohou zobrazit pouze zákazníci.</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Moje rezervace</h2>
      {zprava && <p className="text-red-500 mb-4">{zprava}</p>}
      {rezervace.length === 0 ? (
        <p>Nemáte žádné rezervace.</p>
      ) : (
        <ul className="space-y-4">
          {rezervace.map((r) => (
            <li key={r.rezervace_id} className="p-4 border rounded bg-white shadow">
              <strong className="block text-lg">{r.produkt?.nazev_produktu ?? 'Neznámý produkt'}</strong>
              <p>Datum: {r.rezervovane_datum} &nbsp; | &nbsp; Čas: {r.rezervovany_cas}</p>
              <p>Stav: <span className="font-semibold">{r.stav}</span></p>
              <button
                onClick={() => zrusitRezervaci(r.rezervace_id)}
                className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Zrušit rezervaci
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
