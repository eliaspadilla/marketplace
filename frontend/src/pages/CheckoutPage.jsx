/**
 * CheckoutPage.jsx
 * Checkout simulado: formulario ficticio de pago + confirmación de orden.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

const ESTADO_INICIAL  = 'form';   // 'form' | 'loading' | 'success' | 'error'

export default function CheckoutPage() {
  const navigate = useNavigate();

  const [carrito, setCarrito]   = useState({ items: [], total: 0 });
  const [estado, setEstado]     = useState(ESTADO_INICIAL);
  const [orden, setOrden]       = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [pago, setPago] = useState({
    nombre: '',
    tarjeta: '',
    expiry: '',
    cvv: '',
  });

  useEffect(() => {
    api.get('/cart')
      .then(({ data }) => setCarrito(data))
      .catch(() => navigate('/carrito'));
  }, [navigate]);

  function handleChange(e) {
    setPago({ ...pago, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEstado('loading');
    try {
      const { data } = await api.post('/orders');
      setOrden(data.orden);
      setEstado('success');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Error al procesar la orden');
      setEstado('error');
    }
  }

  // ── Pantalla de éxito ─────────────────────────────────────────────────────

  if (estado === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Orden confirmada!</h1>
          <p className="text-gray-500 text-sm mb-1">Orden #{orden.id}</p>
          <p className="text-indigo-700 text-2xl font-bold mb-6">
            ${orden.total.toFixed(2)}
          </p>

          <div className="text-left bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
            {orden.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-700">
                <span>{item.product.nombre} × {item.cantidad}</span>
                <span>${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mb-6">
            Este es un pago simulado. No se realizó ningún cargo real.
          </p>

          <Link
            to="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // ── Formulario de pago ────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link to="/carrito" className="text-sm text-indigo-600 hover:underline mb-6 inline-block">
        ← Volver al carrito
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Finalizar compra</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Formulario ficticio */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Datos de pago (simulado)</h2>

          {estado === 'error' && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nombre en la tarjeta
              </label>
              <input
                type="text"
                name="nombre"
                value={pago.nombre}
                onChange={handleChange}
                required
                placeholder="Juan Pérez"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Número de tarjeta
              </label>
              <input
                type="text"
                name="tarjeta"
                value={pago.tarjeta}
                onChange={handleChange}
                required
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Vencimiento
                </label>
                <input
                  type="text"
                  name="expiry"
                  value={pago.expiry}
                  onChange={handleChange}
                  required
                  placeholder="MM/AA"
                  maxLength={5}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={pago.cvv}
                  onChange={handleChange}
                  required
                  placeholder="123"
                  maxLength={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div className="pt-1 text-xs text-gray-400 text-center">
              Pago 100% simulado — no uses datos reales
            </div>

            <button
              type="submit"
              disabled={estado === 'loading'}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
            >
              {estado === 'loading' ? 'Procesando…' : `Pagar $${carrito.total.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Resumen del pedido */}
        <div className="bg-white rounded-2xl shadow-sm p-6 h-fit">
          <h2 className="font-semibold text-gray-700 mb-4">Resumen</h2>
          <div className="space-y-3 text-sm">
            {carrito.items.map((item) => (
              <div key={item.productId} className="flex justify-between text-gray-700">
                <span className="truncate pr-2">{item.product.nombre} × {item.cantidad}</span>
                <span className="font-medium whitespace-nowrap">
                  ${(item.product.precio * item.cantidad).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between font-bold text-gray-800">
            <span>Total</span>
            <span className="text-indigo-700">${carrito.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
