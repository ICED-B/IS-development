import { useEffect, useState } from 'react';
import { authHeader } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import AdminProduktForm from './AdminProduktForm';

type Produkt = {
  produkt_id: number;
  nazev_produktu: string;
  popis: string;
  cena: number;
  specializace_id: number;
  specializace?: {
    nazev_specializace: string;
  };
};

export default function ProduktyAdminPage() {
  const [produkty, setProdukty] = useState<Produkt[]>([]);
  const [zprava, setZprava] = useState('');
  const [uprava, setUprava] = useState<Produkt | null>(null);
  const [novy, setNovy] = useState(false);
  const { user } = useAuth();

  const nacti = () => {
    fetch('/api/v1/produkty/', { headers: authHeader() })
      .then(async (res) => {
        if (!res.ok) {
          setZprava(res.status === 401
            ? 'Nejste přihlášen nebo nemáte oprávnění.'
            : 'Chyba při načítání produktů.');
          return;
        }
        const data = await res.json();
        setProdukty(data);
      })
      .catch(() => setZprava('Chyba při komunikaci se serverem'));
  };

  useEffect(() => {
    nacti();
  }, []);

  const smazat = async (id: number) => {
    if (!window.confirm('Opravdu smazat produkt?')) return;
    try {
      const res = await fetch(`/api/v1/produkty/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      if (!res.ok) throw new Error();
      setProdukty((prev) => prev.filter((p) => p.produkt_id !== id));
    } catch {
      setZprava('Chyba při mazání produktu');
    }
  };

  if (!user || !['admin', 'vedoucí', 'majitel'].includes(user.role)) {
    return <p className="text-red-600 font-semibold p-4">Přístup zamítnut – nemáte oprávnění.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Produkty – administrace</h2>

      <button
        onClick={() => setNovy(true)}
        className="mb-6 bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
      >
        Přidat nový produkt
      </button>

      {zprava && <p className="text-red-600 mb-4">{zprava}</p>}

      {novy && (
        <AdminProduktForm onClose={() => setNovy(false)} onSuccess={nacti} />
      )}
      {uprava && (
        <AdminProduktForm produkt={uprava} onClose={() => setUprava(null)} onSuccess={nacti} />
      )}

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">ID</th>
              <th className="p-2">Název</th>
              <th className="p-2">Popis</th>
              <th className="p-2">Cena</th>
              <th className="p-2">Specializace</th>
              <th className="p-2">Akce</th>
            </tr>
          </thead>
          <tbody>
            {produkty.map((p) => (
              <tr key={p.produkt_id} className="bg-white shadow rounded">
                <td className="p-2">{p.produkt_id}</td>
                <td className="p-2">{p.nazev_produktu}</td>
                <td className="p-2">{p.popis}</td>
                <td className="p-2">{p.cena} Kč</td>
                <td className="p-2">{p.specializace?.nazev_specializace || '-'}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => setUprava(p)}
                    className="text-blue-600 hover:underline"
                  >
                    Upravit
                  </button>
                  <button
                    onClick={() => smazat(p.produkt_id)}
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
