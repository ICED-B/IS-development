import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { authHeader, logout } from '../services/auth';

export default function ProfilePage() {
  const { user, loading, reloadUser } = useAuth();

  const [jmeno, setJmeno] = useState(user?.jmeno_prijmeni || '');
  const [email, setEmail] = useState(user?.email || '');
  const [tel, setTel] = useState(user?.tel || '');

  const [stareHeslo, setStareHeslo] = useState('');
  const [noveHeslo, setNoveHeslo] = useState('');
  const [noveHesloZnovu, setNoveHesloZnovu] = useState('');
  const [zprava, setZprava] = useState('');

  if (loading) return <p className="text-gray-500 text-center mt-6">Načítám...</p>;
  if (!user) return <p className="text-red-500 text-center mt-6">Musíte být přihlášeni pro zobrazení profilu.</p>;

  const odeslatZmenuUdaju = async () => {
    setZprava('');
    try {
      const res = await fetch('/api/v1/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({
          jmeno_prijmeni: jmeno,
          email,
          tel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Chyba při ukládání');
      setZprava('Údaje byly úspěšně uloženy');
      reloadUser();
    } catch (e) {
      console.error(e);
      setZprava('Nepodařilo se uložit údaje');
    }
  };

  const zmenitHeslo = async () => {
    setZprava('');
    if (noveHeslo !== noveHesloZnovu) {
      setZprava('Nová hesla se neshodují');
      return;
    }
    try {
      const res = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({
          stare_heslo: stareHeslo,
          nove_heslo: noveHeslo,
          nove_heslo_opakovani: noveHesloZnovu,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setZprava(data.message || 'Chyba při změně hesla');
      } else {
        setZprava('Heslo bylo úspěšně změněno');
        setStareHeslo('');
        setNoveHeslo('');
        setNoveHesloZnovu('');
      }
    } catch {
      setZprava('Chyba spojení se serverem');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-12 flex justify-center">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Můj profil</h2>

        <div className="space-y-6 mb-10">
          <h4 className="text-lg font-semibold text-gray-700">Osobní údaje</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jméno a příjmení</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
              value={jmeno}
              onChange={(e) => setJmeno(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
            />
          </div>

          <button
            onClick={odeslatZmenuUdaju}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow transition"
          >
            Uložit změny
          </button>
        </div>

        <div className="space-y-6 mb-10">
          <h4 className="text-lg font-semibold text-gray-700">Změna hesla</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staré heslo</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
              value={stareHeslo}
              onChange={(e) => setStareHeslo(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nové heslo</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
              value={noveHeslo}
              onChange={(e) => setNoveHeslo(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nové heslo znovu</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
              value={noveHesloZnovu}
              onChange={(e) => setNoveHesloZnovu(e.target.value)}
            />
          </div>

          <button
            onClick={zmenitHeslo}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow transition"
          >
            Změnit heslo
          </button>
        </div>

        {zprava && (
          <p className="text-center text-sm font-medium mb-6 text-green-600">{zprava}</p>
        )}

        <hr className="my-6" />

        <div className="text-center">
          <button
            onClick={logout}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded transition"
          >
            Odhlásit se
          </button>
        </div>
      </div>
    </div>
  );
}
