import React from 'react';

interface ProduktKartaProps {
  nazev_produktu: string;
  popis: string;
  cena: number;
}

const ProduktKarta: React.FC<ProduktKartaProps> = ({ nazev_produktu, popis, cena }) => {
  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-gray-200 hover:shadow-lg transition flex flex-col justify-between min-h-[220px]">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{nazev_produktu}</h2>
        <p className="text-gray-600 mb-3">{popis}</p>
      </div>
      <p className="text-lg font-semibold text-blue-600">{cena} Kč</p>
    </div>
  );
};

export default ProduktKarta;
