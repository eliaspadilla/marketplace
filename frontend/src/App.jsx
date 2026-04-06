/**
 * App.jsx — Define todas las rutas de la aplicación.
 *
 * Rutas públicas:    /  /productos/:id  /login  /register
 * Rutas protegidas:  /carrito  /checkout
 * Rutas de vendedor: /vendedor  (requiere rol VENDEDOR)
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage             from './pages/HomePage';
import LoginPage            from './pages/LoginPage';
import RegisterPage         from './pages/RegisterPage';
import ProductDetailPage    from './pages/ProductDetailPage';
import CartPage             from './pages/CartPage';
import CheckoutPage         from './pages/CheckoutPage';
import SellerDashboardPage  from './pages/SellerDashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="min-h-screen">
            <Routes>
              {/* Públicas */}
              <Route path="/"               element={<HomePage />} />
              <Route path="/productos/:id"  element={<ProductDetailPage />} />
              <Route path="/login"          element={<LoginPage />} />
              <Route path="/register"       element={<RegisterPage />} />

              {/* Protegidas: cualquier usuario autenticado */}
              <Route path="/carrito" element={
                <ProtectedRoute><CartPage /></ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute><CheckoutPage /></ProtectedRoute>
              } />

              {/* Protegida: solo VENDEDOR */}
              <Route path="/vendedor" element={
                <ProtectedRoute requiredRole="VENDEDOR">
                  <SellerDashboardPage />
                </ProtectedRoute>
              } />

              {/* Ruta no encontrada */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
