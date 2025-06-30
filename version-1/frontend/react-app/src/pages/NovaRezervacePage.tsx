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

  useEffect(() => {
    fetch('/api/v1/produkty/')
      .then((res) => res.json())
      .then((data) => {
        setProdukty(data);
      })
      .catch(() => console.error('Chyba při načítání produktů'));
  }, []);
const odeslat = async (e: React.FormEvent) => {
  e.preventDefault();
  setZprava('');

  if (!produktId || !datum || !cas) {
    setZprava('Vyplňte všechna pole.');
    return;
  }

  const payload = {
    jmeno_prijmeni: jmeno,
    email,
    tel,
    produkt_id: produktId,
    rezervovane_datum: datum,  // ← ZMĚNA
    rezervovany_cas: cas,
  };

  console.log('ODESÍLÁM:', payload); // ← TOTO PŘIDÁNO

  try {
    const res = await fetch('/api/v1/rezervace/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log('REZERVACE ODPOVĚĎ:', data); // ← TOTO PŘIDÁNO

    if (!res.ok) throw new Error(data.message || 'Chyba');

    setZprava('Rezervace byla úspěšně vytvořena!');
    setJmeno('');
    setEmail('');
    setTel('');
    setProduktId(null);
    setDatum('');
    setCas('');
  } catch (e) {
    console.error(e);
    setZprava('Nepodařilo se vytvořit rezervaci.');
  }
};


  return (
    <div>
      <h2>Nová rezervace</h2>
      <form onSubmit={odeslat}>
        <label>Jméno a příjmení:<br />
          <input value={jmeno} onChange={(e) => setJmeno(e.target.value)} required />
        </label><br />
        <label>Email:<br />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label><br />
        <label>Telefon:<br />
          <input value={tel} onChange={(e) => setTel(e.target.value)} required />
        </label><br />
        <label>Produkt:<br />
          <select
            value={produktId ?? ''}
            onChange={(e) => setProduktId(Number(e.target.value) || null)}
            required
          >
            <option value="">Vyberte produkt</option>
            {produkty.map((produkt) => (
              <option key={produkt.produkt_id} value={produkt.produkt_id}>
                {produkt.nazev_produktu}
              </option>
            ))}
          </select>
        </label><br />
        <label>Datum:<br />
          <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} required />
        </label><br />
        <label>Čas:<br />
          <select value={cas} onChange={(e) => setCas(e.target.value)} required>
            <option value="">Vyberte čas</option>
            {Array.from({ length: 9 }, (_, i) => {
              const hour = 8 + i;
              const time = `${hour.toString().padStart(2, '0')}:00`;
              return <option key={time} value={time}>{time}</option>;
            })}
          </select>
        </label><br />
        <button type="submit">Odeslat rezervaci</button>
      </form>
      <p style={{ color: 'green' }}>{zprava}</p>
    </div>
  );
}
