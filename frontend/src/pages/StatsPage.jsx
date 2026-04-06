/**
 * StatsPage.jsx
 * Estadísticas e informes para el vendedor logueado.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

function formatFecha(iso) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function SummaryCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-yellow-600">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default function StatsPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    api.get('/stats/vendor')
      .then(({ data }) => setData(data))
      .catch(() => setError('No se pudieron cargar las estadísticas'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 py-20">{error}</p>;
  }

  const { resumen, porProducto, ultimaSemana } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Estadísticas e informes</h1>
        <Link to="/vendedor" className="text-sm text-yellow-600 hover:text-yellow-800 hover:underline">
          ← Volver al panel
        </Link>
      </div>

      {/* ── Resumen general ─────────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Resumen general
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Ingresos totales"
            value={`$${resumen.ingresos.toFixed(2)}`}
          />
          <SummaryCard
            label="Órdenes recibidas"
            value={resumen.ordenes}
          />
          <SummaryCard
            label="Unidades vendidas"
            value={resumen.unidadesVendidas}
          />
          <SummaryCard
            label="Producto más vendido"
            value={resumen.productoMasVendido?.nombre ?? '—'}
            sub={resumen.productoMasVendido ? `${resumen.productoMasVendido.unidades} unidades` : undefined}
          />
        </div>
      </section>

      {/* ── Por producto ────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Por producto
        </h2>
        {porProducto.length === 0 ? (
          <p className="text-gray-400 text-sm">No tienes productos publicados aún.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3 text-right">Vendidas</th>
                  <th className="px-4 py-3 text-right">Ingresos</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {porProducto.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.nombre}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{p.unidades}</td>
                    <td className="px-4 py-3 text-right font-semibold text-yellow-600">
                      ${p.ingresos.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.stock < 5
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {p.stock} {p.stock < 5 && '⚠️'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Tendencias: últimos 7 días ───────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Órdenes últimos 7 días
        </h2>
        {ultimaSemana.length === 0 ? (
          <p className="text-gray-400 text-sm">Sin órdenes en los últimos 7 días.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Orden</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ultimaSemana.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">#{o.id}</td>
                    <td className="px-4 py-3 text-gray-600">{formatFecha(o.fecha)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-yellow-600">
                      ${o.monto.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
