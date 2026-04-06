/**
 * Navbar.jsx
 * Barra de navegación global. Muestra links según el estado de sesión y rol.
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isVendedor, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / home */}
        <Link to="/" className="text-xl font-bold tracking-tight hover:text-green-200">
          MercadoClaudeOnline
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-green-200">
            Inicio
          </Link>

          {isAuthenticated ? (
            <>
              {/* Link al carrito solo para compradores o cualquier usuario */}
              {!isVendedor && (
                <Link to="/carrito" className="hover:text-green-200">
                  Carrito
                </Link>
              )}

              {/* Panel de vendedor */}
              {isVendedor && (
                <Link to="/vendedor" className="hover:text-green-200">
                  Mi Panel
                </Link>
              )}

              <span className="text-green-300 hidden sm:inline">
                {user.nombre}
              </span>

              <button
                onClick={handleLogout}
                className="bg-green-500 hover:bg-green-400 px-3 py-1 rounded transition"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-green-200">
                Entrar
              </Link>
              <Link
                to="/register"
                className="bg-white text-green-700 font-semibold px-3 py-1 rounded hover:bg-green-100 transition"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
