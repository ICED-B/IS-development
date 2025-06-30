import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegistracePage from './pages/RegistracePage';
import NovaRezervacePage from './pages/NovaRezervacePage';
import MojeRezervacePage from './pages/MojeRezervacePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProduktyPage from './pages/ProduktyPage';
import RezervaceAdminPage from './pages/admin/RezervaceAdminPage';
import ProduktyAdminPage from './pages/admin/ProduktyAdminPage';
import SpecializaceAdminPage from './pages/admin/SpecializaceAdminPage';
import ZakazniciAdminPage from './pages/admin/ZakazniciAdminPage';
import PracovniciAdminPage from './pages/admin/PracovniciAdminPage';
import SchuzkyAdminPage from './pages/admin/SchuzkyAdminPage';

import { useAuth } from './contexts/AuthContext';
import { logout } from './services/auth';
import { useState } from 'react';

function App() {
  const { user, loading } = useAuth();
  const isAdmin = user && ['admin', 'majitel', 'vedoucí', 'pracovník'].includes(user.role);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100 text-gray-800">
        {/* Navigace */}
        <nav className="bg-blue-700 text-white shadow">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <ul className="flex gap-4 items-center flex-wrap">
              <li><Link to="/" className="!text-white hover:text-blue-200 font-medium">Domů</Link></li>
              <li><Link to="/produkty" className="!text-white hover:text-blue-200 font-medium">Zážitky</Link></li>
              <li><Link to="/rezervace" className="!text-white hover:text-blue-200 font-medium">Rezervace</Link></li>
              <li><Link to="/moje-rezervace" className="!text-white hover:text-blue-200 font-medium">Moje rezervace</Link></li>
              {isAdmin && (
                <li><Link to="/admin" className="!text-white hover:text-blue-200 font-medium">Admin</Link></li>
              )}
            </ul>

            {/* Profilové menu */}
            {!loading && (
              <div
                className="relative text-sm"
                onMouseEnter={() => setShowMenu(true)}
                onMouseLeave={() => setShowMenu(true)}
              >
                {user ? (
                  <div className="relative text-sm group">
                    <span className="cursor-pointer inline-block !text-white font-medium">
                      Přihlášen jako: <strong>{user.jmeno_prijmeni || user.login || user.role}</strong> ⮟
                    </span>
                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200">
                        <Link to="/profil" className="block px-4 py-2 hover:bg-gray-100">Profil</Link>
                        <button
                          onClick={logout}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Odhlásit se
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <ul className="flex gap-4">
                    <li><Link to="/login" className="!text-white hover:text-blue-200 font-medium">Přihlásit se</Link></li>
                    <li><Link to="/registrace" className="!text-white hover:text-blue-200 font-medium">Registrovat se</Link></li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Obsah */}
        <main className="flex-grow container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/registrace" element={<RegistracePage />} />
            <Route path="/produkty" element={<ProduktyPage />} />
            <Route path="/rezervace" element={<NovaRezervacePage />} />
            <Route path="/moje-rezervace" element={<MojeRezervacePage />} />
            {/* Admin */}
            <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="/admin/produkty" element={isAdmin ? <ProduktyAdminPage /> : <Navigate to="/" />} />
            <Route path="/admin/specializace" element={isAdmin ? <SpecializaceAdminPage /> : <Navigate to="/" />} />
            <Route path="/admin/zakaznici" element={isAdmin ? <ZakazniciAdminPage /> : <Navigate to="/" />} />
            <Route path="/admin/pracovnici" element={isAdmin ? <PracovniciAdminPage /> : <Navigate to="/" />} />
            <Route path="/admin/schuzky" element={isAdmin ? <SchuzkyAdminPage /> : <Navigate to="/" />} />
            <Route path="/admin/rezervace" element={isAdmin ? <RezervaceAdminPage /> : <Navigate to="/" />} />
          </Routes>
        </main>

        {/* Patička */}
        <footer className="text-center p-4 text-gray-500 text-sm border-t mt-auto bg-white">
          © {new Date().getFullYear()} CMR Zážitky
        </footer>
      </div>
    </Router>
  );
}

export default App;

// navigace v menu, přepínaní mezi stránkami
// kontrola přihlášení role přes useAuth() 
// řeší co se vykreslí podle role