// src/pages/admin/AdminDashboard.tsx
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

  if (!user) return <p>Načítání...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-6">Admin rozhraní</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <li><Link to="/admin/zakaznici" className="block bg-white shadow p-4 rounded hover:bg-gray-50">Zákazníci</Link></li>
        <li><Link to="/admin/rezervace" className="block bg-white shadow p-4 rounded hover:bg-gray-50">Rezervace</Link></li>
        <li><Link to="/admin/produkty" className="block bg-white shadow p-4 rounded hover:bg-gray-50">Produkty</Link></li>
        <li><Link to="/admin/schuzky" className="block bg-white shadow p-4 rounded hover:bg-gray-50">Schůzky</Link></li>
        <li><Link to="/admin/pracovnici" className="block bg-white shadow p-4 rounded hover:bg-gray-50">Pracovníci</Link></li>
        <li><Link to="/admin/specializace" className="block bg-white shadow p-4 rounded hover:bg-gray-50">Specializace</Link></li>
      </ul>
    </div>
  );
}
