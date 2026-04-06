/**
 * CartPage.jsx
 * Carrito de compras: lista items, permite modificar cantidades y proceder al checkout.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function CartPage() {
  const navigate = useNavigate();

  const [items, setItems]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  async function fetchCarrito() {
    try {
      const { data } = await api.get('/cart');
      setItems(data.items);
      setTotal(data.total);
    } catch {
      setError('No se pudo cargar el carrito');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCarrito(); }, []);

  async function handleCantidad(productId, nuevaCantidad) {
    try {
      await api.put(`/cart/${productId}`, { cantidad: nuevaCantidad });
      fetchCarrito();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar');
    }
  }

  async function handleEliminar(productId) {
    try {
      await api.delete(`/cart/${productId}`);
      fetchCarrito();
    } catch {
      alert('Error al eliminar el producto');
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 py-20">{error}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-4xl mb-4">🛒</p>
        <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
        <Link to="/" className="mt-4 inline-block text-green-600 hover:underline">
          Explorar productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tu carrito</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4"
          >
            <img
              src={item.product.imageUrl || '/placeholder.jpg'}
              alt={item.product.nombre}
              className="w-16 h-16 object-cover rounded-lg bg-gray-100"
              onError={(e) => { e.target.src = '/placeholder.jpg'; }}
            />

            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{item.product.nombre}</p>
              <p className="text-sm text-gray-500">${item.product.precio.toFixed(2)} c/u</p>
            </div>

            {/* Control de cantidad */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => handleCantidad(item.productId, item.cantidad - 1)}
                className="px-2 py-1 text-gray-500 hover:bg-gray-100 text-lg leading-none"
              >
                −
              </button>
              <span className="px-3 text-sm font-medium">{item.cantidad}</span>
              <button
                onClick={() => handleCantidad(item.productId, item.cantidad + 1)}
                className="px-2 py-1 text-gray-500 hover:bg-gray-100 text-lg leading-none"
              >
                +
              </button>
            </div>

            {/* Subtotal */}
            <p className="font-semibold text-green-700 w-20 text-right">
              ${(item.product.precio * item.cantidad).toFixed(2)}
            </p>

            {/* Eliminar */}
            <button
              onClick={() => handleEliminar(item.productId)}
              className="text-gray-400 hover:text-red-500 transition ml-1"
              title="Eliminar"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Resumen y checkout */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between text-lg font-bold text-gray-800 mb-4">
          <span>Total</span>
          <span className="text-green-700">${total.toFixed(2)}</span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
        >
          Proceder al pago
        </button>
        <Link
          to="/"
          className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-3"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
