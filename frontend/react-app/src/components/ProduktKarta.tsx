import React from 'react';

interface ProduktKartaProps {
//  produkt_id: number;
  nazev_produktu: string;
  popis: string;
  cena: number;
}

const ProduktKarta: React.FC<ProduktKartaProps> = ({ nazev_produktu, popis, cena }) => {
  return (
    <div className="bg-white shadow-md p-4 rounded-md mb-4">
      <h2 className="text-black-400 font-semibold">{nazev_produktu}</h2>
      <p className="text-gray-700">{popis}</p>
      <p className="text-blue-600 font-bold mt-2">{cena} Kč</p>
    </div>
  );
};

export default ProduktKarta;
