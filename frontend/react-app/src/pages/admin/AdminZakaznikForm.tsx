import { useState } from 'react';
import { authHeader } from '../../services/auth';
import { Zakaznik } from './ZakazniciAdminPage';

type Props = {
  zakaznik?: Zakaznik;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AdminZakaznikForm({ zakaznik, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    jmeno_prijmeni: zakaznik?.jmeno_prijmeni || '',
    email: zakaznik?.email || '',
    tel: zakaznik?.tel || '',
    login: zakaznik?.login || '',
    heslo: '',
    role: zakaznik?.role || 'zakaznik',
  });
  const [zprava, setZprava] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<Zakaznik> & { heslo?: string } = {
      jmeno_prijmeni: form.jmeno_prijmeni,
      email: form.email,
      tel: form.tel,
      login: form.login,
    };

    if (!zakaznik && !form.heslo) {
      setZprava('Heslo je povinné při vytváření nového zákazníka.');
      return;
    }

    if (form.heslo && form.heslo.trim().length > 0) {
      payload.heslo = form.heslo;
    }

    const method = zakaznik ? 'PUT' : 'POST';
    const url = zakaznik
      ? `/api/v1/zakaznici/${zakaznik.zakaznik_id}`
      : '/api/v1/zakaznici/';

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
      setZprava('Chyba při ukládání zákazníka');
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded shadow mb-4">
      <h3 className="text-lg font-semibold mb-2">
        {zakaznik ? 'Upravit zákazníka' : 'Přidat nového zákazníka'}
      </h3>

      {zprava && <p className="text-red-600 mb-2">{zprava}</p>}

      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          name="jmeno_prijmeni"
          value={form.jmeno_prijmeni}
          onChange={handleChange}
          placeholder="Jméno a příjmení"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="tel"
          value={form.tel}
          onChange={handleChange}
          placeholder="Telefon"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="login"
          value={form.login}
          onChange={handleChange}
          placeholder="Login"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          name="heslo"
          value={form.heslo}
          onChange={handleChange}
          placeholder="Heslo (ponechte prázdné pro beze změny)"
          className="w-full p-2 border rounded"
        />

        <div className="mt-4 space-x-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Uložit
          </button>
          <button type="button" onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">
            Zrušit
          </button>
        </div>
      </form>
    </div>
  );
}
