import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !['admin', 'majitel', 'vedoucí', 'pracovník'].includes(user.role)) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return <p className="text-center text-gray-500 mt-10">Načítání...</p>;

  return (
    <div className="max-w-5xl mx-auto mt-12 px-4">
      <h2 className="text-3xl font-bold text-center text-blue-800 mb-10">Admin rozhraní</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/admin/zakaznici"
          className="bg-white border border-blue-200 rounded-2xl shadow hover:shadow-md p-6 text-center transition hover:bg-blue-50"
        >
          Zákazníci
        </Link>
        <Link
          to="/admin/rezervace"
          className="bg-white border border-blue-200 rounded-2xl shadow hover:shadow-md p-6 text-center transition hover:bg-blue-50"
        >
          Rezervace
        </Link>
        <Link
          to="/admin/produkty"
          className="bg-white border border-blue-200 rounded-2xl shadow hover:shadow-md p-6 text-center transition hover:bg-blue-50"
        >
          Produkty
        </Link>
        <Link
          to="/admin/schuzky"
          className="bg-white border border-blue-200 rounded-2xl shadow hover:shadow-md p-6 text-center transition hover:bg-blue-50"
        >
          Schůzky
        </Link>
        <Link
          to="/admin/pracovnici"
          className="bg-white border border-blue-200 rounded-2xl shadow hover:shadow-md p-6 text-center transition hover:bg-blue-50"
        >
          Pracovníci
        </Link>
        <Link
          to="/admin/specializace"
          className="bg-white border border-blue-200 rounded-2xl shadow hover:shadow-md p-6 text-center transition hover:bg-blue-50"
        >
          Specializace
        </Link>
      </div>
    </div>
  );
}
