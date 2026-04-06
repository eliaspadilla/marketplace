/**
 * OrdersPage.jsx
 * Historial de compras del comprador autenticado.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const ESTADO_STYLES = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  PAGADA:    'bg-green-100 text-green-700',
  CANCELADA: 'bg-red-100 text-red-500',
};

function formatFecha(isoString) {
  return new Date(isoString).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function OrdersPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrdenes(data.ordenes))
      .catch(() => setError('No se pudo cargar el historial de órdenes'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 py-20">{error}</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mis órdenes</h1>

      {ordenes.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="text-gray-500 text-lg">Todavía no has realizado ninguna compra</p>
          <Link to="/" className="mt-4 inline-block text-orange-600 hover:underline font-medium">
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {ordenes.map((orden) => (
            <div key={orden.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Cabecera de la orden */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Orden #{orden.id}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatFecha(orden.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_STYLES[orden.estado]}`}>
                    {orden.estado}
                  </span>
                  <span className="text-orange-600 font-bold text-lg">
                    ${orden.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Productos de la orden */}
              <ul className="divide-y divide-gray-50">
                {orden.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 px-5 py-3">
                    <img
                      src={item.product.imageUrl || '/placeholder.jpg'}
                      alt={item.product.nombre}
                      className="w-12 h-12 object-cover rounded-lg bg-gray-100 shrink-0"
                      onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {item.product.nombre}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.cantidad} × ${item.precioUnitario.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 shrink-0">
                      ${(item.cantidad * item.precioUnitario).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
