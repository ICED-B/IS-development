import { useState } from 'react';
import { authHeader } from '../../services/auth';

type Specializace = {
  specializace_id?: number;
  nazev_specializace: string;
  popis: string;
};

type Props = {
  specializace?: Specializace;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AdminSpecializaceForm({ specializace, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<Specializace>({
    nazev_specializace: specializace?.nazev_specializace || '',
    popis: specializace?.popis || '',
  });
  const [zprava, setZprava] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = specializace ? 'PUT' : 'POST';
    const url = specializace
      ? `/api/v1/specializace/${specializace.specializace_id}`
      : '/api/v1/specializace/';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();
      onSuccess();
      onClose();
    } catch {
      setZprava('Chyba při ukládání specializace');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow max-w-3xl mx-auto mt-6">
      <h3 className="text-xl font-bold mb-4 text-blue-700">
        {specializace ? 'Upravit specializaci' : 'Nová specializace'}
      </h3>

      {zprava && <p className="text-red-600 mb-4">{zprava}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Název specializace</label>
          <input
            type="text"
            name="nazev_specializace"
            value={formData.nazev_specializace}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Popis</label>
          <textarea
            name="popis"
            value={formData.popis}
            onChange={handleChange}
            rows={3}
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
