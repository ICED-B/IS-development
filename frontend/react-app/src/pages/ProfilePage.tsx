// src/pages/ProfilePage.tsx
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

  if (loading) return <p>Načítám...</p>;
  if (!user) return <p>Musíte být přihlášeni pro zobrazení profilu.</p>;

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
        setZprava('Údaje uloženy');
        reloadUser(); // obnoví context
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
      if (!res.ok) {
        const data = await res.json();
        setZprava(data.message || 'Chyba při změně hesla');
      } else {
        setZprava('Heslo úspěšně změněno');
        setStareHeslo('');
        setNoveHeslo('');
        setNoveHesloZnovu('');
      }
    } catch {
      setZprava('Chyba spojení se serverem');
    }
  };

  return (
    <div>
      <h2>Můj profil</h2>

      <h4>Osobní údaje</h4>
      <label>Jméno a příjmení:<br />
        <input value={jmeno} onChange={(e) => setJmeno(e.target.value)} />
      </label><br />
      <label>Email:<br />
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </label><br />
      <label>Telefon:<br />
        <input value={tel} onChange={(e) => setTel(e.target.value)} />
      </label><br />
      <button onClick={odeslatZmenuUdaju}>Uložit změny</button>

      <h4>Změna hesla</h4>
      <label>Staré heslo:<br />
        <input type="password" value={stareHeslo} onChange={(e) => setStareHeslo(e.target.value)} />
      </label><br />
      <label>Nové heslo:<br />
        <input type="password" value={noveHeslo} onChange={(e) => setNoveHeslo(e.target.value)} />
      </label><br />
      <label>Nové heslo znovu:<br />
        <input type="password" value={noveHesloZnovu} onChange={(e) => setNoveHesloZnovu(e.target.value)} />
      </label><br />
      <button onClick={zmenitHeslo}>Změnit heslo</button>

      <p style={{ color: 'green' }}>{zprava}</p>

      <hr />
      <button onClick={logout}>Odhlásit se</button>
    </div>
  );
}
