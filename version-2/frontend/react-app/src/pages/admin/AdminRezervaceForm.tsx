import { useEffect, useState } from 'react';
import { authHeader } from '../../services/auth';

type Produkt = {
  produkt_id: number;
  nazev_produktu: string;
};

type Zakaznik = {
  zakaznik_id: number;
  jmeno_prijmeni: string;
  email: string;
  tel: string;
};

type Rezervace = {
  rezervace_id?: number;
  jmeno_prijmeni: string;
  email: string;
  tel: string;
  rezervovane_datum: string;
  rezervovany_cas: string;
  stav: string;
  produkt_id: number;
  zakaznik_id?: number;
};

type Props = {
  rezervace?: Rezervace;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AdminRezervaceForm({ rezervace, onClose, onSuccess }: Props) {
  const [produkty, setProdukty] = useState<Produkt[]>([]);
  const [zakaznici, setZakaznici] = useState<Zakaznik[]>([]);
  const [zprava, setZprava] = useState('');
  const [vybranyZakaznikId, setVybranyZakaznikId] = useState<number | ''>('');

  const [formData, setFormData] = useState<Rezervace>({
    jmeno_prijmeni: rezervace?.jmeno_prijmeni || '',
    email: rezervace?.email || '',
    tel: rezervace?.tel || '',
    rezervovane_datum: rezervace?.rezervovane_datum || '',
    rezervovany_cas: rezervace?.rezervovany_cas || '',
    stav: rezervace?.stav || 'čekající',
    produkt_id: rezervace?.produkt_id || 0,
    zakaznik_id: rezervace?.zakaznik_id,
  });

  useEffect(() => {
    fetch('/api/v1/produkty/', { headers: authHeader() })
      .then(res => res.json())
      .then(setProdukty)
      .catch(() => setZprava('Nepodařilo se načíst produkty'));

    fetch('/api/v1/zakaznici-rv/', { headers: authHeader() })
      .then(res => res.json())
      .then(setZakaznici)
      .catch(() => setZprava('Nepodařilo se načíst zákazníky'));
  }, []);

  const handleZakaznikSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    setVybranyZakaznikId(id);

    try {
      const res = await fetch(`/api/v1/zakaznici-rv/${id}`, { headers: authHeader() });
      if (!res.ok) throw new Error();
      const zakaznik = await res.json();

      setFormData((prev) => ({
        ...prev,
        jmeno_prijmeni: zakaznik.jmeno_prijmeni,
        email: zakaznik.email,
        tel: zakaznik.tel,
        zakaznik_id: zakaznik.zakaznik_id,
      }));
    } catch {
      setZprava('Nepodařilo se načíst údaje o zákazníkovi');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'produkt_id' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = rezervace ? 'PUT' : 'POST';
    const url = rezervace
      ? `/api/v1/rezervace/${rezervace.rezervace_id}`
      : '/api/v1/rezervace/';

    const payload = {
      ...formData,
      produkt_id: Number(formData.produkt_id),
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      onSuccess();
      onClose();
    } catch {
      setZprava('Chyba při ukládání rezervace');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow max-w-3xl mx-auto mt-6">
      <h3 className="text-xl font-bold mb-4 text-blue-700">
        {rezervace ? 'Upravit rezervaci' : 'Nová rezervace'}
      </h3>

      {zprava && <p className="text-red-600 mb-4">{zprava}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!rezervace && (
          <div>
            <label className="block font-semibold mb-1">Zákazník</label>
            <select
              value={vybranyZakaznikId}
              onChange={handleZakaznikSelect}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">-- Vyberte zákazníka --</option>
              {zakaznici.map((z) => (
                <option key={z.zakaznik_id} value={z.zakaznik_id}>
                  {z.jmeno_prijmeni} ({z.email})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block font-semibold mb-1">Jméno a příjmení</label>
          <input
            name="jmeno_prijmeni"
            value={formData.jmeno_prijmeni}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Telefon</label>
          <input
            name="tel"
            value={formData.tel}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Datum</label>
            <input
              name="rezervovane_datum"
              type="date"
              value={formData.rezervovane_datum}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Čas</label>
            <input
              name="rezervovany_cas"
              type="time"
              value={formData.rezervovany_cas}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1">Produkt</label>
          <select
            name="produkt_id"
            value={formData.produkt_id}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="">-- Vyberte produkt --</option>
            {produkty.map((p) => (
              <option key={p.produkt_id} value={p.produkt_id}>
                {p.nazev_produktu}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Stav</label>
          <select
            name="stav"
            value={formData.stav}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="čekající">čekající</option>
            <option value="schváleno">schváleno</option>
            <option value="zamítnuto">zamítnuto</option>
          </select>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition"
          >
            Uložit
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            Zrušit
          </button>
        </div>
      </form>
    </div>
  );
}
