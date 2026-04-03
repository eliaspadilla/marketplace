/**
 * SellerDashboardPage.jsx
 * Panel del vendedor: lista sus productos y permite crear, editar y eliminar.
 */

import { useState, useEffect } from 'react';
import api from '../api/client';

const FORM_VACIO = { nombre: '', descripcion: '', precio: '', stock: '', imageUrl: '' };

export default function SellerDashboardPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading]     = useState(true);

  // Estado del modal de creación/edición
  const [modalAbierto, setModalAbierto]   = useState(false);
  const [editando, setEditando]           = useState(null); // null = crear, objeto = editar
  const [form, setForm]                   = useState(FORM_VACIO);
  const [guardando, setGuardando]         = useState(false);
  const [formError, setFormError]         = useState('');

  async function fetchProductos() {
    try {
      const { data } = await api.get('/products/mis-productos');
      setProductos(data.productos);
    } catch {
      // silenciar en panel
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProductos(); }, []);

  function abrirCrear() {
    setEditando(null);
    setForm(FORM_VACIO);
    setFormError('');
    setModalAbierto(true);
  }

  function abrirEditar(producto) {
    setEditando(producto);
    setForm({
      nombre:      producto.nombre,
      descripcion: producto.descripcion,
      precio:      String(producto.precio),
      stock:       String(producto.stock),
      imageUrl:    producto.imageUrl || '',
    });
    setFormError('');
    setModalAbierto(true);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleGuardar(e) {
    e.preventDefault();
    setGuardando(true);
    setFormError('');
    try {
      const payload = {
        nombre:      form.nombre,
        descripcion: form.descripcion,
        precio:      parseFloat(form.precio),
        stock:       parseInt(form.stock),
        imageUrl:    form.imageUrl || null,
      };

      if (editando) {
        await api.put(`/products/${editando.id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setModalAbierto(false);
      fetchProductos();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar el producto');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(producto) {
    if (!confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/products/${producto.id}`);
      fetchProductos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mi Panel</h1>
          <p className="text-sm text-gray-500">{productos.length} producto(s) publicado(s)</p>
        </div>
        <button
          onClick={abrirCrear}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + Nuevo producto
        </button>
      </div>

      {/* Tabla de productos */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📦</p>
          <p>Aún no tienes productos. ¡Crea el primero!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium text-right">Precio</th>
                <th className="px-4 py-3 font-medium text-right">Stock</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productos.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{p.nombre}</p>
                    <p className="text-xs text-gray-400 truncate max-w-xs">{p.descripcion}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-indigo-700">
                    ${p.precio.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'
                    }`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => abrirEditar(p)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(p)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear/editar */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editando ? 'Editar producto' : 'Nuevo producto'}
            </h2>

            {formError && (
              <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleGuardar} className="space-y-3">
              {[
                { name: 'nombre',      label: 'Nombre',      type: 'text',   required: true  },
                { name: 'precio',      label: 'Precio ($)',   type: 'number', required: true  },
                { name: 'stock',       label: 'Stock',        type: 'number', required: true  },
                { name: 'imageUrl',    label: 'URL de imagen', type: 'url',   required: false },
              ].map(({ name, label, type, required }) => (
                <div key={name}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required={required}
                    min={type === 'number' ? 0 : undefined}
                    step={name === 'precio' ? '0.01' : undefined}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 py-2 rounded-lg text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg text-sm transition"
                >
                  {guardando ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
