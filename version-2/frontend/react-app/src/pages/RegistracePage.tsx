import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegistracePage() {
  const [login, setLogin] = useState('');
  const [heslo, setHeslo] = useState('');
  const [hesloZnovu, setHesloZnovu] = useState('');
  const [jmeno, setJmeno] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [zprava, setZprava] = useState('');
  const [chyba, setChyba] = useState('');

  const navigate = useNavigate();

  const odeslatRegistraci = async (e: React.FormEvent) => {
    e.preventDefault();
    setZprava('');
    setChyba('');

    if (heslo !== hesloZnovu) {
      setChyba('Hesla se neshodují.');
      return;
    }

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login,
          heslo,
          jmeno_prijmeni: jmeno,
          email,
          tel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setChyba(data.message || 'Registrace selhala.');
        return;
      }

      setZprava('Registrace proběhla úspěšně. Přesměrování...');
      setTimeout(() => navigate('/login'), 1500);
    } catch {
      setChyba('Chyba při komunikaci se serverem.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Registrace zákazníka</h2>
        <form onSubmit={odeslatRegistraci} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Login</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heslo</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
              value={heslo}
              onChange={(e) => setHeslo(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heslo znovu</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
              value={hesloZnovu}
              onChange={(e) => setHesloZnovu(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jméno a příjmení</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
              value={jmeno}
              onChange={(e) => setJmeno(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg shadow transition"
          >
            Registrovat
          </button>
          {chyba && <p className="text-red-600 text-center">{chyba}</p>}
          {zprava && <p className="text-green-600 text-center">{zprava}</p>}
        </form>
      </div>
    </div>
  );
}
