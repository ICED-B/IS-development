import React, { useEffect, useState } from 'react';
import ProduktKarta from '../components/ProduktKarta';

interface Produkt {
  produkt_id: number;
  nazev_produktu: string;
  popis: string;
  cena: number;
};

const ProduktyPage: React.FC = () => {
  const [produkty, setProdukty] = useState<Produkt[]>([]);
  const [nacitani, setNacitani] = useState(true);

  useEffect(() => {
      fetch('/api/v1/produkty/')  // Předpokládá se existující endpoint
      .then(res => res.json())
      .then(data => {
        setProdukty(data);
        setNacitani(false);
      })
      .catch(() => setNacitani(false));
  }, []);

  if (nacitani) {
    return <p>Načítání...</p>;
  }

 return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Nabídka zážitků</h1>
      {produkty.length === 0 ? (
        <p>Žádné produkty k dispozici.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {produkty.map(produkt => (
            <ProduktKarta key={produkt.produkt_id} {...produkt} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProduktyPage;