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

function App() {
  const { user } = useAuth();
  console.log("Přihlášený uživatel:", user);
  const isAdmin = user && ['admin', 'majitel', 'vedoucí', 'pracovník'].includes(user.role);

  return (
    <Router>
      <div className="flex flex-col min-h-screen min-w-screen bg-gray-100">
        {/* Navigace */}
        <nav className="bg-blue-600 text-white p-4 shadow-md mb-6">
          <ul className="flex space-x-6 container mx-auto items-center">
            <li><Link to="/" className="hover:text-blue-200 transition-colors">Domů</Link></li>
            <li><Link to="/produkty" className="hover:text-blue-200 transition-colors">Zážitky</Link></li>
            <li><Link to="/rezervace" className="hover:text-blue-200 transition-colors">Rezervace</Link></li>
            <li><Link to="/moje-rezervace" className="hover:text-blue-200 transition-colors">Moje rezervace</Link></li>

            {isAdmin && (
              <li><Link to="/admin" className="hover:text-blue-200 transition-colors">Admin</Link></li>
            )}

            {/* Profilové menu */}
            {user ? (
              <li className="relative group ml-auto">
                <span className="cursor-pointer hover:text-blue-200 transition-colors">
                  Přihlášen jako: <strong>{user.jmeno_prijmeni || user.login || user.role}</strong> ⮟
                </span>
                <ul className="absolute right-0 mt-2 bg-white text-black shadow-lg rounded hidden group-hover:block z-50 p-2 w-48">
                  <li><Link to="/profil" className="block px-3 py-1 hover:bg-gray-100">Profil</Link></li>
                  <li>
                    <button
                      onClick={() => {
                        localStorage.removeItem('access_token');
                        window.location.href = '/login';
                      }}
                      className="block px-3 py-1 hover:bg-gray-100 text-left w-full"
                    >
                      Odhlásit se
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="ml-auto"><Link to="/login" className="hover:text-blue-200 transition-colors">Přihlásit se</Link></li>
                <li><Link to="/registrace" className="hover:text-blue-200 transition-colors">Registrovat se</Link></li>
              </>
            )}
          </ul>
        </nav>

        {/* Obsah */}
        <main className="flex-grow p-6 container mx-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/registrace" element={<RegistracePage />} />
            <Route path="/produkty" element={<ProduktyPage />} />
            <Route path="/rezervace" element={<NovaRezervacePage />} />
            <Route path="/moje-rezervace" element={<MojeRezervacePage />} />

            {/* Chráněné admin routy */}
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
        <footer className="text-center p-4 text-gray-500 mt-auto text-sm">
          © {new Date().getFullYear()} IS Šablona
        </footer>
      </div>
    </Router>
  );
}

export default App;
