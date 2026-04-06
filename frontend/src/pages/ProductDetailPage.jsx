/**
 * ProductDetailPage.jsx
 * Detalle de un producto con opción de agregar al carrito.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { isAuthenticated, isVendedor } = useAuth();
  const btnColor = !isAuthenticated
    ? 'bg-green-600 hover:bg-green-700'
    : isVendedor
      ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
      : 'bg-orange-600 hover:bg-orange-700';

  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading]   = useState(true);
  const [adding, setAdding]     = useState(false);
  const [mensaje, setMensaje]   = useState('');
  const [error, setError]       = useState('');

  useEffect(() => {
    async function fetchProducto() {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProducto(data.producto);
      } catch {
        setError('Producto no encontrado');
      } finally {
        setLoading(false);
      }
    }
    fetchProducto();
  }, [id]);

  async function handleAgregarCarrito() {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setAdding(true);
    setMensaje('');
    setError('');
    try {
      await api.post('/cart', { productId: producto.id, cantidad });
      setMensaje(`"${producto.nombre}" agregado al carrito`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al agregar al carrito');
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gray-100 rounded-2xl h-96 animate-pulse" />
      </div>
    );
  }

  if (error && !producto) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{error}</p>
        <Link to="/" className="text-green-600 hover:underline mt-2 inline-block">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/" className="text-sm text-green-600 hover:underline mb-6 inline-block">
        ← Volver al listado
      </Link>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden md:flex">
        {/* Imagen */}
        <img
          src={producto.imageUrl || '/placeholder.jpg'}
          alt={producto.nombre}
          className="w-full md:w-80 h-64 md:h-auto object-cover bg-gray-100"
          onError={(e) => { e.target.src = '/placeholder.jpg'; }}
        />

        {/* Info */}
        <div className="p-6 flex flex-col flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{producto.nombre}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Vendido por <span className="font-medium">{producto.vendedor?.nombre}</span>
          </p>

          <p className="text-gray-600 mt-4 text-sm leading-relaxed">
            {producto.descripcion}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <span className="text-3xl font-bold text-green-700">
              ${producto.precio.toFixed(2)}
            </span>
            <span className={`text-sm px-3 py-1 rounded-full ${
              producto.stock > 0
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-500'
            }`}>
              {producto.stock > 0 ? `${producto.stock} disponibles` : 'Sin stock'}
            </span>
          </div>

          {/* Selector de cantidad + botón (solo para compradores) */}
          {!isVendedor && producto.stock > 0 && (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition"
                >
                  −
                </button>
                <span className="px-4 py-2 text-sm font-medium">{cantidad}</span>
                <button
                  onClick={() => setCantidad((c) => Math.min(producto.stock, c + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAgregarCarrito}
                disabled={adding}
                className={`flex-1 disabled:opacity-60 font-semibold py-2 px-6 rounded-lg transition ${btnColor}`}
              >
                {adding ? 'Agregando…' : 'Agregar al carrito'}
              </button>
            </div>
          )}

          {/* Feedback */}
          {mensaje && (
            <p className="mt-3 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              {mensaje}
            </p>
          )}
          {error && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {!isAuthenticated && producto.stock > 0 && !isVendedor && (
            <p className="mt-4 text-sm text-gray-500">
              <Link to="/login" className="text-green-600 hover:underline">
                Inicia sesión
              </Link>{' '}
              para agregar al carrito.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
