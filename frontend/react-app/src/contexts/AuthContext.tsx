// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { authHeader } from '../services/auth';

type UserInfo = {
  jmeno_prijmeni: string;
  email: string;
  tel: string;
  login: string;
  role: string;
};

type AuthContextType = {
  user: UserInfo | null;
  loading: boolean;
  reloadUser: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  reloadUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadUser = () => {
    const token = localStorage.getItem('access_token'); // 🔁 sjednoceno
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    fetch('/api/v1/auth/me', { headers: authHeader() })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    const kontrolaVyprseni = () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // v ms
        const zbyva = exp - Date.now();

        if (zbyva <= 0) {
          setUser(null);
          localStorage.removeItem('access_token');
        } else {
          setTimeout(() => {
            setUser(null);
            localStorage.removeItem('access_token');
            window.location.href = '/login';
          }, zbyva);
        }
      } catch {
        setUser(null);
        localStorage.removeItem('access_token');
      }
    };

    reloadUser();          //  zajistí načtení dat při startu
    kontrolaVyprseni();    //  nastaví automatické odhlášení
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
