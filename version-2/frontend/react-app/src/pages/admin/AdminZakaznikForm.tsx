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
    <div className="bg-white p-6 rounded-2xl shadow max-w-3xl mx-auto mt-6">
      <h3 className="text-xl font-bold mb-4 text-blue-700">
        {zakaznik ? 'Upravit zákazníka' : 'Přidat nového zákazníka'}
      </h3>

      {zprava && <p className="text-red-600 mb-4">{zprava}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Jméno a příjmení</label>
          <input
            type="text"
            name="jmeno_prijmeni"
            value={form.jmeno_prijmeni}
            onChange={handleChange}
            placeholder="Jméno a příjmení"
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Telefon</label>
          <input
            type="text"
            name="tel"
            value={form.tel}
            onChange={handleChange}
            placeholder="Telefon"
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Login</label>
          <input
            type="text"
            name="login"
            value={form.login}
            onChange={handleChange}
            placeholder="Login"
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Heslo</label>
          <input
            type="password"
            name="heslo"
            value={form.heslo}
            onChange={handleChange}
            placeholder="Heslo (ponechte prázdné pro beze změny)"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
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
