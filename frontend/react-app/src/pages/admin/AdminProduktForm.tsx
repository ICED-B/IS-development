// src/pages/admin/AdminProduktForm.tsx
import { useEffect, useState } from 'react';
import { authHeader } from '../../services/auth';

type Produkt = {
  produkt_id?: number;
  nazev_produktu: string;
  popis: string;
  cena: number;
  specializace_id: number | '';
};

type Specializace = {
  specializace_id: number;
  nazev_specializace: string;
};

type Props = {
  produkt?: Produkt;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AdminProduktForm({ produkt, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<Produkt>({
    nazev_produktu: produkt?.nazev_produktu || '',
    popis: produkt?.popis || '',
    cena: produkt?.cena || 0,
    specializace_id: produkt?.specializace_id || '',
  });

  const [specializace, setSpecializace] = useState<Specializace[]>([]);
  const [zprava, setZprava] = useState('');

  useEffect(() => {
    fetch('/api/v1/specializace/', { headers: authHeader() })
      .then((res) => res.json())
      .then((data) => setSpecializace(data))
      .catch(() => setZprava('Nepodařilo se načíst specializace'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cena' ? parseFloat(value) : name === 'specializace_id' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = produkt ? 'PUT' : 'POST';
    const url = produkt
      ? `/api/v1/produkty/${produkt.produkt_id}`
      : '/api/v1/produkty/';

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
      setZprava('Chyba při ukládání produktu');
    }
  };

  return (
    <div className="border p-4 bg-white rounded shadow mb-4">
      <h3 className="text-lg font-bold mb-2">
        {produkt ? 'Upravit produkt' : 'Nový produkt'}
      </h3>

      {zprava && <p className="text-red-600 mb-2">{zprava}</p>}

      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="block font-semibold">Název produktu</label>
          <input
            name="nazev_produktu"
            value={formData.nazev_produktu}
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
            required
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold">Cena (Kč)</label>
          <input
            name="cena"
            type="number"
            min={0}
            value={formData.cena}
            onChange={handleChange}
            required
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold">Specializace</label>
          <select
            name="specializace_id"
            value={formData.specializace_id}
            onChange={handleChange}
            required
            className="w-full border px-2 py-1 rounded"
          >
            <option value="">Vyberte specializaci</option>
            {specializace.map((s) => (
              <option key={s.specializace_id} value={s.specializace_id}>
                {s.nazev_specializace}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mt-2">
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
