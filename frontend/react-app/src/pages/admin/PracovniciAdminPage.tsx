// Upravená PracovniciAdminPage.tsx
import { useEffect, useState } from 'react';
import { authHeader } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import AdminPracovnikForm from './AdminPracovnikForm';

interface Specializace {
  specializace_id: number;
  nazev_specializace: string;
}

interface Pracovnik {
  pracovnici_id: number;
  jmeno_prijmeni: string;
  email: string;
  tel: string;
  login: string;
  heslo?: string;
  pracovni_pozice: string;
  specializace_id: number;
  specializace?: Specializace;
  vedouci: number | null;
}

export default function PracovniciAdminPage() {
  const [pracovnici, setPracovnici] = useState<Pracovnik[]>([]);
  const [zprava, setZprava] = useState('');
  const [uprava, setUprava] = useState<Pracovnik | null>(null);
  const [novy, setNovy] = useState(false);
  const { user } = useAuth();

  const nacti = () => {
    fetch('/api/v1/pracovnici/', { headers: authHeader() })
      .then(async (res) => {
        if (!res.ok) {
          setZprava(res.status === 401
            ? 'Nejste přihlášen nebo nemáte oprávnění.'
            : 'Chyba při načítání pracovníků.');
          return;
        }
        const data = await res.json();
        setPracovnici(data);
      })
      .catch(() => setZprava('Chyba při komunikaci se serverem'));
  };

  useEffect(() => {
    nacti();
  }, []);

  const smazat = async (id: number) => {
    if (!window.confirm('Opravdu smazat pracovníka?')) return;
    try {
      const res = await fetch(`/api/v1/pracovnici/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      if (!res.ok) throw new Error();
      setPracovnici((prev) => prev.filter((p) => p.pracovnici_id !== id));
    } catch {
      setZprava('Chyba při mazání pracovníka');
    }
  };

  if (!user || !['admin', 'vedoucí', 'majitel'].includes(user.role)) {
    return <p className="text-red-600 font-semibold">Přístup zamítnut – nemáte oprávnění.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pracovníci – administrace</h2>

      <button
        onClick={() => setNovy(true)}
        className="mb-4 bg-blue-600 text-white px-4 py-1 rounded"
      >
        Přidat pracovníka
      </button>

      {zprava && <p className="text-red-600 mb-4">{zprava}</p>}

      {novy && (
        <AdminPracovnikForm onClose={() => setNovy(false)} onSuccess={nacti} />
      )}
      {uprava && (
        <AdminPracovnikForm pracovnik={uprava} onClose={() => setUprava(null)} onSuccess={nacti} />
      )}

      <table className="table-auto w-full border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Jméno</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Telefon</th>
            <th className="p-2 text-left">Login</th>
            <th className="p-2 text-left">Pozice</th>
            <th className="p-2 text-left">Specializace</th>
            <th className="p-2 text-left">Vedoucí ID</th>
            {['admin', 'majitel'].includes(user.role) && (
              <th className="p-2 text-left">Heslo</th>
            )}
            <th className="p-2 text-left">Akce</th>
          </tr>
        </thead>
        <tbody>
          {pracovnici.map((p) => (
            <tr key={p.pracovnici_id} className="bg-white shadow-sm rounded">
              <td className="p-2">{p.pracovnici_id}</td>
              <td className="p-2">{p.jmeno_prijmeni}</td>
              <td className="p-2">{p.email}</td>
              <td className="p-2">{p.tel}</td>
              <td className="p-2">{p.login}</td>
              <td className="p-2">{p.pracovni_pozice}</td>
              <td className="p-2">{p.specializace?.nazev_specializace || p.specializace_id}</td>
              <td className="p-2">{p.vedouci !== null ? p.vedouci : '-'}</td>
              {['admin', 'majitel'].includes(user.role) && (
                <td className="p-2 text-xs break-all">{p.heslo ? 'skryto' : '-'}</td>
              )}
              <td className="p-2">
                <button
                  onClick={() => setUprava(p)}
                  className="mr-2 text-blue-600 underline"
                >
                  Upravit
                </button>
                <button
                  onClick={() => smazat(p.pracovnici_id)}
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
