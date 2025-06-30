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
  reloadUser: () => Promise<void>; 
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  reloadUser: async () => {}, 
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadUser = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/auth/me', { headers: authHeader() });
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setUser(data);
      localStorage.setItem('role', data.role);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const kontrolaVyprseni = () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000;
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

    reloadUser(); // načíst uživatele při načtení
    kontrolaVyprseni();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// AuthContext -> Uchovává info o přihlašeném uživateli 
// prostor pro přístup k přihlášenému uživateli(user)
// Automaticky kontroluje jestli expiruje token pokud ano uživatele odhlásí 
// Exportuje useAuth() z jiných komponent snadno zjistíme kdo je přihlášený
// data o přihlášeném uživateli v fetch('/api/v1/auth/me') v reloadUser()