import { useEffect, useState, useCallback } from 'react';
import { authHeader } from '../../services/auth';

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
  const [od, setOd] = useState('');
  const [doDatum, setDoDatum] = useState('');

  const [formData, setFormData] = useState<Schuzka>({
    rezervace_id: schuzka?.rezervace_id || 0,
    pracovnici_id: schuzka?.pracovnici_id || 0,
    stav: schuzka?.stav || 'planovano',
    poznamka: schuzka?.poznamka || '',
  });

  const nacistRezervace = useCallback(() => {
    let url = '/api/v1/rezervace/vyber/';
    const params = new URLSearchParams();
    if (od) params.append('od', od);
    if (doDatum) params.append('do', doDatum);
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url, { headers: authHeader() })
      .then(res => res.json())
      .then(setRezervace)
      .catch(() => setZprava('Chyba při načítání rezervací'));
  }, [od, doDatum]);

  useEffect(() => {
    nacistRezervace();
    fetch('/api/v1/pracovnici/', { headers: authHeader() })
      .then(res => res.json())
      .then(setPracovnici);
  }, [nacistRezervace]);

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
    <div className="bg-white p-6 rounded-2xl shadow max-w-3xl mx-auto mt-6">
      <h3 className="text-xl font-bold mb-4 text-blue-700">
        {schuzka ? 'Upravit schůzku' : 'Nová schůzka'}
      </h3>
      {zprava && <p className="text-red-600 mb-4">{zprava}</p>}

      {/* Filtrování rezervací */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block font-semibold mb-1">Datum od</label>
          <input
            type="date"
            value={od}
            onChange={(e) => setOd(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Datum do</label>
          <input
            type="date"
            value={doDatum}
            onChange={(e) => setDoDatum(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div>
          <button
            type="button"
            onClick={nacistRezervace}
            className="mt-1 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Načíst rezervace
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Rezervace</label>
          <select
            name="rezervace_id"
            value={formData.rezervace_id}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
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
          <label className="block font-semibold mb-1">Pracovník</label>
          <select
            name="pracovnici_id"
            value={formData.pracovnici_id}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
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
          <label className="block font-semibold mb-1">Stav</label>
          <select
            name="stav"
            value={formData.stav}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="planovano">Plánováno</option>
            <option value="probehlo">Proběhlo</option>
            <option value="zruseno">Zrušeno</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Poznámka</label>
          <input
            name="poznamka"
            value={formData.poznamka}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
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
