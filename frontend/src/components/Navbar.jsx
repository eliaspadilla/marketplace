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

  // Color dinámico según estado de sesión y rol
  const navBg      = !isAuthenticated ? 'bg-green-700'  : isVendedor ? 'bg-yellow-500'  : 'bg-orange-600';
  const navText    = !isAuthenticated ? 'text-white'     : isVendedor ? 'text-gray-900'  : 'text-white';
  const linkHover  = !isAuthenticated ? 'hover:text-green-200'  : isVendedor ? 'hover:text-yellow-900' : 'hover:text-orange-200';
  const mutedText  = !isAuthenticated ? 'text-green-300' : isVendedor ? 'text-yellow-700' : 'text-orange-200';
  const btnClass   = !isAuthenticated
    ? 'bg-green-500 hover:bg-green-400 text-white'
    : isVendedor
      ? 'bg-yellow-400 hover:bg-yellow-300 text-gray-900'
      : 'bg-orange-500 hover:bg-orange-400 text-white';

  return (
    <nav className={`${navBg} ${navText} shadow-md transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / home */}
        <Link to="/" className={`text-xl font-bold tracking-tight ${linkHover}`}>
          MercadoClaudeOnline
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {isAuthenticated ? (
            <>
              {!isVendedor && (
                <>
                  <Link to="/carrito" className={linkHover}>
                    Carrito
                  </Link>
                  <Link to="/ordenes" className={linkHover}>
                    Mis órdenes
                  </Link>
                </>
              )}

              {isVendedor && (
                <Link to="/vendedor" className={linkHover}>
                  Mi Panel
                </Link>
              )}

              <span className={`${mutedText} hidden sm:inline`}>
                {user.nombre}
              </span>

              <button
                onClick={handleLogout}
                className={`${btnClass} px-3 py-1 rounded transition`}
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkHover}>
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
