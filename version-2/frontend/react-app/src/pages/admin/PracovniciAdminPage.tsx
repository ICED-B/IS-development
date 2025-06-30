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
    return <p className="text-red-600 font-semibold p-4">Přístup zamítnut – nemáte oprávnění.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Pracovníci – administrace</h2>

      <button
        onClick={() => setNovy(true)}
        className="mb-6 bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
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

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">ID</th>
              <th className="p-2">Jméno</th>
              <th className="p-2">Email</th>
              <th className="p-2">Telefon</th>
              <th className="p-2">Login</th>
              <th className="p-2">Pozice</th>
              <th className="p-2">Specializace</th>
              <th className="p-2">Vedoucí ID</th>
              {['admin', 'majitel'].includes(user.role) && (
                <th className="p-2">Heslo</th>
              )}
              <th className="p-2">Akce</th>
            </tr>
          </thead>
          <tbody>
            {pracovnici.map((p) => (
              <tr key={p.pracovnici_id} className="bg-white shadow rounded">
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
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => setUprava(p)}
                    className="text-blue-600 hover:underline"
                  >
                    Upravit
                  </button>
                  <button
                    onClick={() => smazat(p.pracovnici_id)}
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
