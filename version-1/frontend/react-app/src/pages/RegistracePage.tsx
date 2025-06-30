// src/pages/RegistracePage.tsx
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

  const navigate = useNavigate();

  const odeslatRegistraci = async (e: React.FormEvent) => {
    e.preventDefault();
    setZprava('');

    if (heslo !== hesloZnovu) {
      setZprava('Hesla se neshodují.');
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
        setZprava(data.message || 'Registrace selhala.');
        return;
      }

      setZprava('Registrace proběhla úspěšně. Přesměrování...');
      setTimeout(() => navigate('/login'), 1500);
    } catch {
      setZprava('Chyba při komunikaci se serverem.');
    }
  };

  return (
    <div>
      <h2>Registrace zákazníka</h2>
      <form onSubmit={odeslatRegistraci}>
        <label>Login:<br />
          <input value={login} onChange={(e) => setLogin(e.target.value)} required />
        </label><br />
        <label>Heslo:<br />
          <input type="password" value={heslo} onChange={(e) => setHeslo(e.target.value)} required />
        </label><br />
        <label>Heslo znovu:<br />
          <input type="password" value={hesloZnovu} onChange={(e) => setHesloZnovu(e.target.value)} required />
        </label><br />
        <label>Jméno a příjmení:<br />
          <input value={jmeno} onChange={(e) => setJmeno(e.target.value)} required />
        </label><br />
        <label>Email:<br />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label><br />
        <label>Telefon:<br />
          <input value={tel} onChange={(e) => setTel(e.target.value)} required />
        </label><br />
        <button type="submit">Registrovat</button>
      </form>
      <p style={{ color: 'green' }}>{zprava}</p>
    </div>
  );
}
