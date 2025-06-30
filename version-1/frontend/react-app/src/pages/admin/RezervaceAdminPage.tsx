// src/pages/admin/RezervaceAdminPage.tsx
import { useEffect, useState } from 'react';
import { authHeader } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import AdminRezervaceForm from './AdminRezervaceForm';

type Rezervace = {
  rezervace_id: number;
  jmeno_prijmeni: string;
  email: string;
  tel: string;
  rezervovane_datum: string;
  rezervovany_cas: string;
  stav: string;
  produkt: { nazev_produktu: string };
  produkt_id: number;
  zakaznik_id?: number;
};

export default function RezervaceAdminPage() {
  const [rezervace, setRezervace] = useState<Rezervace[]>([]);
  const [zprava, setZprava] = useState('');
  const [uprava, setUprava] = useState<Rezervace | null>(null);
  const [novy, setNovy] = useState(false);
  const { user } = useAuth();

  const nacti = () => {
    fetch('/api/v1/rezervace/', { headers: authHeader() })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) setZprava('Nejste přihlášen nebo nemáte oprávnění.');
          else setZprava('Chyba při načítání rezervací.');
          return;
        }
        const data = await res.json();
        setRezervace(data);
      })
      .catch(() => setZprava('Chyba při komunikaci se serverem'));
  };

  useEffect(() => {
    nacti();
  }, []);

  const smazat = async (id: number) => {
    if (!window.confirm('Opravdu smazat rezervaci?')) return;
    try {
      const res = await fetch(`/api/v1/rezervace/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      if (!res.ok) throw new Error();
      setRezervace((prev) => prev.filter((r) => r.rezervace_id !== id));
    } catch {
      setZprava('Chyba při mazání rezervace.');
    }
  };

  if (!user || !['admin', 'vedoucí', 'majitel'].includes(user.role)) {
    return <p className="text-red-600 font-semibold">Přístup zamítnut – nemáte oprávnění.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Rezervace – administrace</h2>

      <button
        onClick={() => setNovy(true)}
        className="mb-4 bg-blue-600 text-white px-4 py-1 rounded"
      >
        Přidat rezervaci
      </button>

      {zprava && <p className="text-red-600 mb-4">{zprava}</p>}

      {novy && (
        <AdminRezervaceForm onClose={() => setNovy(false)} onSuccess={nacti} />
      )}
      {uprava && (
        <AdminRezervaceForm rezervace={uprava} onClose={() => setUprava(null)} onSuccess={nacti} />
      )}

      <table className="table-auto w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Zákazník</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Tel</th>
            <th className="p-2 text-left">Produkt</th>
            <th className="p-2 text-left">Datum</th>
            <th className="p-2 text-left">Čas</th>
            <th className="p-2 text-left">Stav</th>
            <th className="p-2 text-left">Akce</th>
          </tr>
        </thead>
        <tbody>
          {rezervace.map((r) => (
            <tr key={r.rezervace_id} className="bg-white shadow-sm rounded">
              <td className="p-2">{r.rezervace_id}</td>
              <td className="p-2">{r.jmeno_prijmeni}</td>
              <td className="p-2">{r.email}</td>
              <td className="p-2">{r.tel}</td>
              <td className="p-2">{r.produkt?.nazev_produktu || '–'}</td>
              <td className="p-2">{r.rezervovane_datum}</td>
              <td className="p-2">{r.rezervovany_cas}</td>
              <td className="p-2">{r.stav}</td>
              <td className="p-2">
                <button
                  onClick={() => setUprava(r)}
                  className="mr-2 text-blue-600 underline"
                >
                  Upravit
                </button>
                <button
                  onClick={() => smazat(r.rezervace_id)}
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
