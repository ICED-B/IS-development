// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

      // Uložení JWT tokenu
      localStorage.setItem('access_token', data.access_token);

      // Načtení uživatele (z /me)
      reloadUser();

      // Přesměrování podle role
      if (data.role === 'zakaznik') navigate('/profil');
      else navigate('/admin');
    } catch (err) {
      console.error(err);
      setChyba('Špatné přihlašovací údaje');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Přihlášení</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block">Login:</label>
          <input
            className="border w-full p-2 rounded"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
        </div>
        <div>
          <label className="block">Heslo:</label>
          <input
            className="border w-full p-2 rounded"
            type="password"
            value={heslo}
            onChange={(e) => setHeslo(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Přihlásit se
        </button>
        {chyba && <p className="text-red-600 mt-2">{chyba}</p>}
      </form>
    </div>
  );
}
