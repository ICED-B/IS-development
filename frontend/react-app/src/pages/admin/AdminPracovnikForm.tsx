// Upravený AdminPracovnikForm.tsx se selectem pro specializace a výběr vedoucího podle jména
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
    <div className="bg-white p-4 shadow rounded mb-4">
      <h3 className="text-lg font-semibold mb-2">
        {pracovnik ? 'Upravit pracovníka' : 'Nový pracovník'}
      </h3>
      {zprava && <p className="text-red-600 mb-2">{zprava}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Jméno a příjmení"
          name="jmeno_prijmeni"
          value={form.jmeno_prijmeni}
          onChange={handleChange}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          type="email"
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Telefon"
          name="tel"
          value={form.tel}
          onChange={handleChange}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Login"
          name="login"
          value={form.login}
          onChange={handleChange}
          required
        />
        <select
          className="border p-2 rounded"
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
          className="border p-2 rounded"
          type="password"
          name="heslo"
          placeholder="Heslo (ponechte prázdné pro beze změny)"
          value={form.heslo}
          onChange={handleChange}
        />
        <select
          className="border p-2 rounded"
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
          className="border p-2 rounded"
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

      <div className="mt-4 space-x-2">
        <button
          onClick={odeslat}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Uložit
        </button>
        <button onClick={onClose} className="text-gray-600 hover:underline">
          Zrušit
        </button>
      </div>
    </div>
  );
}
