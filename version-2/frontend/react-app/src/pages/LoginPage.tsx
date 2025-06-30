// src/pages/LoginPage.tsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [heslo, setHeslo] = useState('');
  const [chyba, setChyba] = useState('');
  const navigate = useNavigate();
  const { reloadUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setChyba('');

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, heslo }),
      });

      if (!res.ok) throw new Error('Přihlášení selhalo');

      const data = await res.json();
      localStorage.setItem('access_token', data.access_token);

      await reloadUser(); // nejdřív načti uživatele
      const role = localStorage.getItem('role');

      if (role === 'zakaznik') navigate('/profil');
      else navigate('/admin'); // jinak na admin dashboard
    } catch (err) {
      console.error(err);
      setChyba('Špatné přihlašovací údaje');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Přihlášení</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Login</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heslo</label>
            <input
              type="password"
              value={heslo}
              onChange={(e) => setHeslo(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {chyba && <p className="text-red-600 text-sm text-center">{chyba}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow transition"
          >
            Přihlásit se
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Nemáte účet?{' '}
          <Link to="/registrace" className="text-blue-600 hover:underline font-medium">
            Zaregistrujte se
          </Link>
        </div>

        <div className="mt-2 text-center text-sm">
          <Link to="/" className="text-gray-500 hover:underline">
            Zpět na úvodní stránku
          </Link>
        </div>
      </div>
    </div>
  );
}
