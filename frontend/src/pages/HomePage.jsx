/**
 * HomePage.jsx
 * Listado público de productos con búsqueda en tiempo real.
 */

import { useState, useEffect } from 'react';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [productos, setProductos] = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  // Registrar visita una sola vez al montar la página
  useEffect(() => {
    api.post('/visits').catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProductos() {
      setLoading(true);
      try {
        const params = search ? { search } : {};
        const { data } = await api.get('/products', { params, signal: controller.signal });
        setProductos(data.productos);
      } catch (err) {
        if (err.name !== 'CanceledError') {
          setError('No se pudo cargar los productos');
        }
      } finally {
        setLoading(false);
      }
    }

    // Debounce de 300ms para no disparar una petición por cada tecla
    const timeout = setTimeout(fetchProductos, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Productos</h1>
        <p className="text-gray-500 mt-1">Encuentra lo que necesitas</p>
        {isAuthenticated && (
          <p className="text-green-700 font-medium mt-2">
            Hola {user.nombre}, ¡qué gusto tenerte de vuelta!
          </p>
        )}
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos…"
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Estados */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-center py-12">{error}</p>
      )}

      {!loading && !error && productos.length === 0 && (
        <p className="text-gray-500 text-center py-12">
          {search ? `Sin resultados para "${search}"` : 'No hay productos disponibles.'}
        </p>
      )}

      {/* Grid de productos */}
      {!loading && !error && productos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {productos.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
