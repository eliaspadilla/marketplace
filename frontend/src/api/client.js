/**
 * client.js — Instancia de axios configurada para la API.
 *
 * - baseURL tomada de la variable de entorno VITE_API_URL
 * - Interceptor de request: adjunta el JWT desde localStorage si existe
 * - Interceptor de response: si llega 401, limpia la sesión y redirige a /login
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

// Adjuntar token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el servidor responde 401, limpiar sesión y redirigir
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
