// src/pages/HomePage.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

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
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">CMR – Firma na zážitky</h1>
      <p className="mb-4">
        Vítejte na stránkách zážitkové agentury CMR! Vyberte si z našich produktů ten pravý zážitek pro sebe nebo své blízké.
      </p>

      {user ? (
        <p className="mb-6">
          Přihlášen jako: <strong>{user.jmeno_prijmeni}</strong> (<Link to="/profil" className="text-blue-600 hover:underline">Můj profil</Link>)
        </p>
      ) : (
        <p className="mb-6">
          <Link to="/login" className="text-blue-600 hover:underline">Přihlášení</Link> | <Link to="/registrace" className="text-blue-600 hover:underline">Registrace</Link>
        </p>
      )}

      <h2 className="text-2xl font-semibold mb-4">Naše zážitky</h2>

      {produkty.length === 0 ? (
        <p>Načítání produktů...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {produkty.map((p) => (
            <div key={p.produkt_id} className="bg-white rounded shadow p-4">
              <h3 className="text-lg font-bold">{p.nazev_produktu}</h3>
              <p className="mt-1">{p.popis}</p>
              <p className="mt-2 text-blue-700 font-semibold">{p.cena} Kč</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
