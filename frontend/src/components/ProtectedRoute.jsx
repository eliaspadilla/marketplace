/**
 * ProtectedRoute.jsx
 * Wrapper de ruta que redirige a /login si no hay sesión activa.
 * Si se pasa `requiredRole`, también verifica que el usuario tenga ese rol.
 *
 * Uso:
 *   <Route path="/carrito" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
 *   <Route path="/vendedor" element={<ProtectedRoute requiredRole="VENDEDOR"><SellerDashboardPage /></ProtectedRoute>} />
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.rol !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
