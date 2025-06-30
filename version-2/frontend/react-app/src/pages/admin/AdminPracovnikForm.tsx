import { useEffect, useState } from 'react';
import { authHeader } from '../../services/auth';

interface Specializace {
  specializace_id: number;
  nazev_specializace: string;
}

interface Vedouci {
  pracovnici_id: number;
  jmeno_prijmeni: string;
}

interface Props {
  pracovnik?: {
    pracovnici_id: number;
    jmeno_prijmeni: string;
    email: string;
    tel: string;
    login: string;
    pracovni_pozice: string;
    specializace_id: number;
    vedouci?: number | null;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminPracovnikForm({ pracovnik, onClose, onSuccess }: Props) {
  const [specializace, setSpecializace] = useState<Specializace[]>([]);
  const [vedouciMoznosti, setVedouciMoznosti] = useState<Vedouci[]>([]);
  const [form, setForm] = useState({
    jmeno_prijmeni: pracovnik?.jmeno_prijmeni || '',
    email: pracovnik?.email || '',
    tel: pracovnik?.tel || '',
    login: pracovnik?.login || '',
    pracovni_pozice: pracovnik?.pracovni_pozice || '',
    heslo: '',
    specializace_id: pracovnik?.specializace_id || 1,
    vedouci: pracovnik?.vedouci || undefined,
  });
  const [zprava, setZprava] = useState('');

  useEffect(() => {
    fetch('/api/v1/specializace/', { headers: authHeader() })
      .then(res => res.json())
      .then(setSpecializace)
      .catch(() => setZprava('Nepodařilo se načíst specializace.'));

    fetch('/api/v1/pracovnici/', { headers: authHeader() })
      .then(res => res.json())
      .then(setVedouciMoznosti)
      .catch(() => setZprava('Nepodařilo se načíst seznam vedoucích.'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ['specializace_id', 'vedouci'].includes(name) ? parseInt(value) || undefined : value,
    }));
  };

  const odeslat = async () => {
    const metoda = pracovnik ? 'PUT' : 'POST';
    const url = pracovnik
      ? `/api/v1/pracovnici/${pracovnik.pracovnici_id}`
      : '/api/v1/pracovnici/';

    const payload = {
      ...form,
      ...(form.heslo ? {} : { heslo: undefined })
    };

    try {
      const res = await fetch(url, {
        method: metoda,
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      onSuccess();
      onClose();
    } catch {
      setZprava('Chyba při ukládání pracovníka');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow max-w-3xl mx-auto mt-6">
      <h3 className="text-xl font-bold mb-4 text-blue-700">
        {pracovnik ? 'Upravit pracovníka' : 'Nový pracovník'}
      </h3>

      {zprava && <p className="text-red-600 mb-4">{zprava}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="border border-gray-300 rounded-lg p-2"
          placeholder="Jméno a příjmení"
          name="jmeno_prijmeni"
          value={form.jmeno_prijmeni}
          onChange={handleChange}
          required
        />
        <input
          className="border border-gray-300 rounded-lg p-2"
          placeholder="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          type="email"
          required
        />
        <input
          className="border border-gray-300 rounded-lg p-2"
          placeholder="Telefon"
          name="tel"
          value={form.tel}
          onChange={handleChange}
          required
        />
        <input
          className="border border-gray-300 rounded-lg p-2"
          placeholder="Login"
          name="login"
          value={form.login}
          onChange={handleChange}
          required
        />
        <select
          className="border border-gray-300 rounded-lg p-2"
          name="pracovni_pozice"
          value={form.pracovni_pozice}
          onChange={handleChange}
          required
        >
          <option value="">Zvol pozici</option>
          <option value="pracovník">Pracovník</option>
          <option value="vedoucí">Vedoucí</option>
          <option value="majitel">Majitel</option>
        </select>
        <input
          className="border border-gray-300 rounded-lg p-2"
          type="password"
          name="heslo"
          placeholder="Heslo (ponechte prázdné pro beze změny)"
          value={form.heslo}
          onChange={handleChange}
        />
        <select
          className="border border-gray-300 rounded-lg p-2"
          name="specializace_id"
          value={form.specializace_id}
          onChange={handleChange}
          required
        >
          <option value="">-- Vyberte specializaci --</option>
          {specializace.map((s) => (
            <option key={s.specializace_id} value={s.specializace_id}>
              {s.nazev_specializace}
            </option>
          ))}
        </select>
        <select
          className="border border-gray-300 rounded-lg p-2"
          name="vedouci"
          value={form.vedouci || ''}
          onChange={handleChange}
        >
          <option value="">-- Vyberte vedoucího (nepovinné) --</option>
          {vedouciMoznosti.map((v) => (
            <option key={v.pracovnici_id} value={v.pracovnici_id}>
              {v.jmeno_prijmeni}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={odeslat}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition"
        >
          Uložit
        </button>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 underline"
        >
          Zrušit
        </button>
      </div>
    </div>
  );
}
