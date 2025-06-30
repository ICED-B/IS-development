import { useState, useEffect } from 'react';

type Produkt = {
  produkt_id: number;
  nazev_produktu: string;
};

export default function NovaRezervacePage() {
  const [produkty, setProdukty] = useState<Produkt[]>([]);
  const [jmeno, setJmeno] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [produktId, setProduktId] = useState<number | null>(null);
  const [datum, setDatum] = useState('');
  const [cas, setCas] = useState('');
  const [zprava, setZprava] = useState('');
  const [zpravaTyp, setZpravaTyp] = useState<'ok' | 'chyba' | ''>('');

  useEffect(() => {
    fetch('/api/v1/produkty/')
      .then((res) => res.json())
      .then((data) => setProdukty(data))
      .catch(() => console.error('Chyba při načítání produktů'));
  }, []);

  const odeslat = async (e: React.FormEvent) => {
    e.preventDefault();
    setZprava('');
    setZpravaTyp('');

    if (!produktId || !datum || !cas || !jmeno || !email || !tel) {
      setZprava('Vyplňte všechna pole.');
      setZpravaTyp('chyba');
      return;
    }

    const payload = {
      jmeno_prijmeni: jmeno,
      email,
      tel,
      produkt_id: produktId,
      rezervovane_datum: datum,
      rezervovany_cas: cas,
    };

    try {
      const res = await fetch('/api/v1/rezervace/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Chyba');

      setZprava('Rezervace byla úspěšně vytvořena!');
      setZpravaTyp('ok');
      setJmeno('');
      setEmail('');
      setTel('');
      setProduktId(null);
      setDatum('');
      setCas('');
    } catch (e) {
      console.error(e);
      setZprava('Nepodařilo se vytvořit rezervaci.');
      setZpravaTyp('chyba');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex justify-center items-center px-4 py-10">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Nová rezervace</h2>

        <form onSubmit={odeslat} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Jméno a příjmení</label>
            <input
              type="text"
              value={jmeno}
              onChange={(e) => setJmeno(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Telefon</label>
            <input
              type="tel"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Produkt</label>
            <select
              value={produktId ?? ''}
              onChange={(e) => setProduktId(Number(e.target.value) || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Vyberte produkt</option>
              {produkty.map((produkt) => (
                <option key={produkt.produkt_id} value={produkt.produkt_id}>
                  {produkt.nazev_produktu}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Datum</label>
            <input
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Čas</label>
            <select
              value={cas}
              onChange={(e) => setCas(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Vyberte čas</option>
              {Array.from({ length: 9 }, (_, i) => {
                const hour = 8 + i;
                const time = `${hour.toString().padStart(2, '0')}:00`;
                return <option key={time} value={time}>{time}</option>;
              })}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow transition"
          >
            Odeslat rezervaci
          </button>

          {zprava && (
            <div className={`text-center text-sm font-medium mt-4 ${zpravaTyp === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
              {zprava}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
