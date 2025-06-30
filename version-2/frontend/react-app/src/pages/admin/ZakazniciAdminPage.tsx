import { useEffect, useState } from 'react';
import { authHeader } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import AdminZakaznikForm from './AdminZakaznikForm';

export type Zakaznik = {
  zakaznik_id: number;
  jmeno_prijmeni: string;
  email: string;
  tel: string;
  login: string;
  heslo?: string;
  role: string;
};

export default function ZakazniciAdminPage() {
  const [zakaznici, setZakaznici] = useState<Zakaznik[]>([]);
  const [zprava, setZprava] = useState('');
  const [uprava, setUprava] = useState<Zakaznik | null>(null);
  const [novy, setNovy] = useState(false);
  const { user } = useAuth();

  const nacti = () => {
    fetch('/api/v1/zakaznici/', {
      headers: authHeader(),
    })
      .then(async (res) => {
        if (!res.ok) {
          setZprava(res.status === 401
            ? 'Nejste přihlášen nebo nemáte oprávnění.'
            : 'Chyba při načítání zákazníků');
          return;
        }
        const data = await res.json();
        setZakaznici(data);
      })
      .catch(() => setZprava('Chyba při komunikaci se serverem'));
  };

  useEffect(() => {
    nacti();
  }, []);

  const smazat = async (id: number) => {
    if (!window.confirm('Opravdu smazat zákazníka?')) return;
    try {
      const res = await fetch(`/api/v1/zakaznici/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      if (!res.ok) throw new Error();
      setZakaznici((prev) => prev.filter((z) => z.zakaznik_id !== id));
    } catch {
      setZprava('Chyba při mazání zákazníka');
    }
  };

  if (!user || !['admin', 'vedoucí', 'majitel'].includes(user.role)) {
    return <p className="text-red-600 font-semibold p-4">Přístup zamítnut – nemáte oprávnění.</p>;
  }

  const zobrazitHeslo = user.role === 'admin' || user.role === 'majitel';

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Zákazníci – administrace</h2>

      <button
        onClick={() => setNovy(true)}
        className="mb-6 bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
      >
        Přidat zákazníka
      </button>

      {zprava && <p className="text-red-600 mb-4">{zprava}</p>}

      {novy && (
        <AdminZakaznikForm onClose={() => setNovy(false)} onSuccess={nacti} />
      )}
      {uprava && (
        <AdminZakaznikForm zakaznik={uprava} onClose={() => setUprava(null)} onSuccess={nacti} />
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
              {zobrazitHeslo && <th className="p-2">Heslo (hash)</th>}
              <th className="p-2">Role</th>
              <th className="p-2">Akce</th>
            </tr>
          </thead>
          <tbody>
            {zakaznici.map((z) => (
              <tr key={z.zakaznik_id} className="bg-white shadow rounded">
                <td className="p-2">{z.zakaznik_id}</td>
                <td className="p-2">{z.jmeno_prijmeni}</td>
                <td className="p-2">{z.email}</td>
                <td className="p-2">{z.tel}</td>
                <td className="p-2">{z.login}</td>
                {zobrazitHeslo && (
                  <td className="p-2 text-xs break-all">
                    {z.heslo || <span className="italic text-gray-400">skryto</span>}
                  </td>
                )}
                <td className="p-2">{z.role}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => setUprava(z)}
                    className="text-blue-600 hover:underline"
                  >
                    Upravit
                  </button>
                  <button
                    onClick={() => smazat(z.zakaznik_id)}
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
