/**
 * AuthContext.jsx
 * Estado global de autenticación: usuario actual, token y helpers login/logout.
 *
 * Persiste en localStorage para sobrevivir recargas de página.
 * Expone: { user, token, login, logout, isAuthenticated, isVendedor }
 */

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Inicializar desde localStorage si ya hay sesión guardada
  const [user, setUser]   = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  function login(newToken, newUser) {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token,
      isVendedor: user?.rol === 'VENDEDOR',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para consumir el contexto con un solo import
export function useAuth() {
  return useContext(AuthContext);
}
