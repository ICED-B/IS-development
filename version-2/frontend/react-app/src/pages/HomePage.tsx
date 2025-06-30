import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

type Produkt = {
  produkt_id: number;
  nazev_produktu: string;
  popis: string;
  cena: number;
};

export default function HomePage() {
  const [produkty, setProdukty] = useState<Produkt[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetch('/api/v1/produkty/')
      .then((res) => res.json())
      .then((data) => setProdukty(data))
      .catch(() => console.error('Chyba při načítání produktů'));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 flex justify-center">
      <PageWrapper>
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-4">
          CMR – Firma na zážitky
        </h1>
        <p className="text-center text-gray-600 text-lg mb-6">
          Vyberte si ten pravý zážitek pro sebe nebo své blízké.
        </p>

        {user ? (
          <div className="text-center mb-8 text-gray-700">
            Přihlášen jako: <strong>{user.jmeno_prijmeni}</strong>{' '}
            (<Link to="/profil" className="text-blue-600 hover:underline">Můj profil</Link>)
          </div>
        ) : (
          <div className="text-center mb-8 text-gray-700">
            <Link to="/login" className="text-blue-600 hover:underline">Přihlášení</Link>{' '}|{' '}
            <Link to="/registrace" className="text-blue-600 hover:underline">Registrace</Link>
          </div>
        )}

        <h2 className="text-2xl font-semibold text-blue-700 mb-6">Naše zážitky</h2>

        {produkty.length === 0 ? (
          <p className="text-gray-500 text-center">Načítání produktů...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {produkty.map((p) => (
              <div
                key={p.produkt_id}
                className="bg-white border border-blue-100 rounded-xl shadow-sm hover:shadow-lg transition p-5"
              >
                <h3 className="text-xl font-semibold text-blue-900">{p.nazev_produktu}</h3>
                <p className="text-gray-600 mt-2">{p.popis}</p>
                <p className="text-blue-700 font-bold mt-4 text-lg">{p.cena} Kč</p>
              </div>
            ))}
          </div>
        )}
      </div>
      </PageWrapper>
    </div>
  );
}
