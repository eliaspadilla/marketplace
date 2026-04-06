/**
 * ProductCard.jsx
 * Tarjeta reutilizable para mostrar un producto en el listado.
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ producto }) {
  const { isAuthenticated, isVendedor } = useAuth();
  const btnColor = !isAuthenticated
    ? 'bg-green-600 hover:bg-green-700'
    : isVendedor
      ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
      : 'bg-orange-600 hover:bg-orange-700';
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden flex flex-col">
      {/* Imagen */}
      <img
        src={producto.imageUrl || '/placeholder.jpg'}
        alt={producto.nombre}
        className="w-full h-48 object-cover bg-gray-100"
        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
      />

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
          {producto.nombre}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Por {producto.vendedor?.nombre || 'Vendedor'}
        </p>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-green-700 font-bold text-lg">
            ${producto.precio.toFixed(2)}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            producto.stock > 0
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-500'
          }`}>
            {producto.stock > 0 ? `${producto.stock} disponibles` : 'Sin stock'}
          </span>
        </div>

        <Link
          to={`/productos/${producto.id}`}
          className={`mt-3 block text-center text-white text-sm py-2 rounded-lg transition ${btnColor}`}
        >
          Ver detalle
        </Link>
      </div>
    </div>
  );
}
