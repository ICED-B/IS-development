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
    return <p className="text-red-600 font-semibold">Přístup zamítnut – nemáte oprávnění.</p>;
  }

  const zobrazitHeslo = user.role === 'admin' || user.role === 'majitel';

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Zákazníci – administrace</h2>

      <button
        onClick={() => setNovy(true)}
        className="mb-4 bg-blue-600 text-white px-4 py-1 rounded"
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

      <table className="table-auto w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Jméno</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Telefon</th>
            <th className="p-2 text-left">Login</th>
            {zobrazitHeslo && <th className="p-2 text-left">Heslo (hash)</th>}
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Akce</th>
          </tr>
        </thead>
        <tbody>
          {zakaznici.map((z) => (
            <tr key={z.zakaznik_id} className="bg-white shadow-sm rounded">
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
              <td className="p-2">
                <button
                  onClick={() => setUprava(z)}
                  className="mr-2 text-blue-600 underline"
                >
                  Upravit
                </button>
                <button
                  onClick={() => smazat(z.zakaznik_id)}
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
