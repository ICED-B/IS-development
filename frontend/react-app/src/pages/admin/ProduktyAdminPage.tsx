// src/pages/admin/ProduktyAdminPage.tsx
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
          if (res.status === 401) setZprava('Nejste přihlášen nebo nemáte oprávnění.');
          else setZprava('Chyba při načítání produktů.');
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
    return <p className="text-red-600 font-semibold">Přístup zamítnut – nemáte oprávnění.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Produkty – administrace</h2>

      <button
        onClick={() => setNovy(true)}
        className="mb-4 bg-blue-600 text-white px-4 py-1 rounded"
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

      <table className="table-auto w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Název</th>
            <th className="p-2 text-left">Popis</th>
            <th className="p-2 text-left">Cena</th>
            <th className="p-2 text-left">Specializace</th>
            <th className="p-2 text-left">Akce</th>
          </tr>
        </thead>
        <tbody>
          {produkty.map((p) => (
            <tr key={p.produkt_id} className="bg-white shadow-sm rounded">
              <td className="p-2">{p.produkt_id}</td>
              <td className="p-2">{p.nazev_produktu}</td>
              <td className="p-2">{p.popis}</td>
              <td className="p-2">{p.cena} Kč</td>
              <td className="p-2">{p.specializace?.nazev_specializace || '-'}</td>
              <td className="p-2">
                <button
                  onClick={() => setUprava(p)}
                  className="mr-2 text-blue-600 underline"
                >
                  Upravit
                </button>
                <button
                  onClick={() => smazat(p.produkt_id)}
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
