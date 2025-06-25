// src/pages/admin/AdminSpecializaceForm.tsx
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
    <div className="border p-4 bg-white rounded shadow mb-4">
      <h3 className="text-lg font-bold mb-2">
        {specializace ? 'Upravit specializaci' : 'Nová specializace'}
      </h3>

      {zprava && <p className="text-red-600 mb-2">{zprava}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Název specializace</label>
          <input
            type="text"
            name="nazev_specializace"
            value={formData.nazev_specializace}
            onChange={handleChange}
            required
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold">Popis</label>
          <textarea
            name="popis"
            value={formData.popis}
            onChange={handleChange}
            rows={3}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            Uložit
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
          >
            Zrušit
          </button>
        </div>
      </form>
    </div>
  );
}
