import React, { useEffect, useState } from 'react';
import ProduktKarta from '../components/ProduktKarta';

interface Produkt {
  produkt_id: number;
  nazev_produktu: string;
  popis: string;
  cena: number;
}

const ProduktyPage: React.FC = () => {
  const [produkty, setProdukty] = useState<Produkt[]>([]);
  const [nacitani, setNacitani] = useState(true);

  useEffect(() => {
    fetch('/api/v1/produkty/')
      .then((res) => res.json())
      .then((data) => {
        setProdukty(data);
        setNacitani(false);
      })
      .catch(() => {
        console.error('Chyba při načítání produktů');
        setNacitani(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-12 flex justify-center">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-8">Nabídka zážitků</h1>

        {nacitani ? (
          <p className="text-center text-blue-600 text-lg">Načítání...</p>
        ) : produkty.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">Žádné produkty k dispozici.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {produkty.map((produkt) => (
              <ProduktKarta key={produkt.produkt_id} {...produkt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProduktyPage;
