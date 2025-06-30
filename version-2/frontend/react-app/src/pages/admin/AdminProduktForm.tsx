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
    <div className="bg-white p-6 rounded-2xl shadow max-w-3xl mx-auto mt-6">
      <h3 className="text-xl font-bold mb-4 text-blue-700">
        {produkt ? 'Upravit produkt' : 'Nový produkt'}
      </h3>

      {zprava && <p className="text-red-600 mb-4">{zprava}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Název produktu</label>
          <input
            name="nazev_produktu"
            value={formData.nazev_produktu}
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
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Cena (Kč)</label>
          <input
            name="cena"
            type="number"
            min={0}
            value={formData.cena}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Specializace</label>
          <select
            name="specializace_id"
            value={formData.specializace_id}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Vyberte specializaci</option>
            {specializace.map((s) => (
              <option key={s.specializace_id} value={s.specializace_id}>
                {s.nazev_specializace}
              </option>
            ))}
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
