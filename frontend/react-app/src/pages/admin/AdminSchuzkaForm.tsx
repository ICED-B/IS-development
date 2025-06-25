// Upraveny AdminSchuzkaForm.tsx aby odpovidal backendu
import { useEffect, useState } from 'react';
import { authHeader } from '../../services/auth';

// Typy
interface Pracovnik {
  pracovnici_id: number;
  jmeno_prijmeni: string;
}

interface Rezervace {
  rezervace_id: number;
  jmeno_prijmeni: string;
  rezervovane_datum: string;
  rezervovany_cas: string;
}

interface Schuzka {
  schuzka_id?: number;
  rezervace_id: number;
  pracovnici_id: number;
  stav: string;
  poznamka: string;
}

interface Props {
  schuzka?: Schuzka;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminSchuzkaForm({ schuzka, onClose, onSuccess }: Props) {
  const [rezervace, setRezervace] = useState<Rezervace[]>([]);
  const [pracovnici, setPracovnici] = useState<Pracovnik[]>([]);
  const [zprava, setZprava] = useState('');
  const [formData, setFormData] = useState<Schuzka>({
    rezervace_id: schuzka?.rezervace_id || 0,
    pracovnici_id: schuzka?.pracovnici_id || 0,
    stav: schuzka?.stav || 'planovano',
    poznamka: schuzka?.poznamka || '',
  });

  useEffect(() => {
    fetch('/api/v1/rezervace/', { headers: authHeader() })
      .then(res => res.json())
      .then(setRezervace);

    fetch('/api/v1/pracovnici/', { headers: authHeader() })
      .then(res => res.json())
      .then(setPracovnici);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['rezervace_id', 'pracovnici_id'].includes(name) ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = schuzka ? 'PUT' : 'POST';
    const url = schuzka ? `/api/v1/schuzky/${schuzka.schuzka_id}` : '/api/v1/schuzky/';

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
      setZprava('Chyba při ukládání schůzky');
    }
  };

  return (
    <div className="border p-4 bg-white rounded shadow mb-4">
      <h3 className="text-lg font-bold mb-2">
        {schuzka ? 'Upravit schůzku' : 'Nová schůzka'}
      </h3>
      {zprava && <p className="text-red-600 mb-2">{zprava}</p>}

      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="block font-semibold">Rezervace</label>
          <select
            name="rezervace_id"
            value={formData.rezervace_id}
            onChange={handleChange}
            required
            className="w-full border px-2 py-1 rounded"
          >
            <option value="">-- Vyberte rezervaci --</option>
            {rezervace.map((r) => (
              <option key={r.rezervace_id} value={r.rezervace_id}>
                {`${r.jmeno_prijmeni} – ${r.rezervovane_datum} ${r.rezervovany_cas}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold">Pracovník</label>
          <select
            name="pracovnici_id"
            value={formData.pracovnici_id}
            onChange={handleChange}
            required
            className="w-full border px-2 py-1 rounded"
          >
            <option value="">-- Vyberte pracovníka --</option>
            {pracovnici.map((p) => (
              <option key={p.pracovnici_id} value={p.pracovnici_id}>
                {p.jmeno_prijmeni}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold">Stav</label>
          <select
            name="stav"
            value={formData.stav}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          >
            <option value="planovano">Plánováno</option>
            <option value="probehlo">Proběhlo</option>
            <option value="zruseno">Zrušeno</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold">Poznámka</label>
          <input
            name="poznamka"
            value={formData.poznamka}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div className="flex gap-2 mt-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
            Uložit
          </button>
          <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400">
            Zrušit
          </button>
        </div>
      </form>
    </div>
  );
}
