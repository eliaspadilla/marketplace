# Marketplace

Mini marketplace web construido como proyecto formativo para aprender a usar Claude Code CLI en el desarrollo completo de una aplicación: análisis, estructura, construcción, depuración y despliegue.

**Demo en producción:**
- Frontend: https://marketplace-frontend-gqc1.onrender.com
- Backend API: https://marketplace-wm34.onrender.com/api/health

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Node.js + Express |
| ORM | Prisma |
| Base de datos | PostgreSQL (Neon Free Tier) |
| Autenticación | JWT + bcrypt |
| Frontend | React 18 + Vite |
| Enrutamiento | React Router v6 |
| Estilos | Tailwind CSS |
| Despliegue | Render (Web Service + Static Site) |

---

## Funcionalidades

- Registro y login de usuarios con roles (comprador / vendedor)
- Listado público de productos con búsqueda en tiempo real
- Detalle de producto con selector de cantidad
- Carrito de compras (agregar, modificar cantidad, eliminar, vaciar)
- Checkout simulado con confirmación de orden
- Panel de vendedor: CRUD completo de productos
- Rutas protegidas por sesión y por rol

---

## Instalación local

### Requisitos previos

- Node.js 18+
- Una base de datos PostgreSQL (o cuenta en [Neon](https://neon.tech))

### 1. Clonar el repositorio

```bash
git clone https://github.com/eliaspadilla/marketplace.git
cd marketplace
```

### 2. Configurar el backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita `backend/.env` con tus valores:

```env
DATABASE_URL="postgresql://usuario:password@host/marketplace?sslmode=require"
JWT_SECRET="genera-una-cadena-larga-y-aleatoria"
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV="development"
```

Para generar un `JWT_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Ejecutar migraciones y seed:

```bash
npm run db:migrate   # crea las tablas en la base de datos
npm run db:seed      # carga usuarios y productos de prueba
```

Iniciar el servidor:

```bash
npm run dev          # desarrollo con hot-reload
npm start            # producción
```

El backend queda disponible en `http://localhost:4000`.

### 3. Configurar el frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edita `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

El frontend queda disponible en `http://localhost:5173`.

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | cadena hexadecimal de 64 bytes |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `7d` |
| `PORT` | Puerto del servidor | `4000` |
| `NODE_ENV` | Entorno de ejecución | `development` / `production` |
| `FRONTEND_URL` | URL del frontend (para CORS en producción) | `https://tu-app.onrender.com` |

### Frontend (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API del backend | `http://localhost:4000/api` |

> **Importante:** las variables `VITE_*` se incrustan en el bundle durante el build. En producción deben estar configuradas en Render antes de desplegar.

---

## Cuentas de prueba

| Email | Password | Rol |
|---|---|---|
| vendedor@test.com | password123 | VENDEDOR |
| comprador@test.com | password123 | COMPRADOR |

---

## Endpoints de la API

### Autenticación
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Crear cuenta |
| POST | `/api/auth/login` | Público | Iniciar sesión |
| GET | `/api/auth/me` | Autenticado | Perfil del usuario |

### Productos
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/products` | Público | Listar productos (`?search=`) |
| GET | `/api/products/:id` | Público | Detalle de producto |
| GET | `/api/products/mis-productos` | Vendedor | Productos del vendedor |
| POST | `/api/products` | Vendedor | Crear producto |
| PUT | `/api/products/:id` | Vendedor | Actualizar producto |
| DELETE | `/api/products/:id` | Vendedor | Eliminar producto |

### Carrito
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/cart` | Autenticado | Ver carrito con total |
| POST | `/api/cart` | Autenticado | Agregar producto |
| PUT | `/api/cart/:productId` | Autenticado | Cambiar cantidad |
| DELETE | `/api/cart/:productId` | Autenticado | Eliminar item |
| DELETE | `/api/cart` | Autenticado | Vaciar carrito |

### Órdenes
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/orders` | Autenticado | Crear orden (checkout) |
| GET | `/api/orders` | Autenticado | Historial de órdenes |
| GET | `/api/orders/:id` | Autenticado | Detalle de orden |

---

## Estructura del proyecto

```
marketplace/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Modelos: User, Product, CartItem, Order, OrderItem
│   │   ├── seed.js              # Datos de prueba
│   │   └── migrations/          # Historial de migraciones SQL
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── cart.controller.js
│   │   │   └── order.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js   # Verificación de JWT
│   │   │   └── role.middleware.js   # Control de acceso por rol
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── cart.routes.js
│   │   │   └── order.routes.js
│   │   ├── lib/
│   │   │   └── prisma.js            # Singleton del cliente Prisma
│   │   └── app.js                   # Configuración de Express
│   ├── server.js                    # Punto de entrada
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── placeholder.jpg
    ├── src/
    │   ├── api/
    │   │   └── client.js            # Axios con interceptor de token
    │   ├── context/
    │   │   └── AuthContext.jsx      # Estado global de sesión
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProductCard.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── HomePage.jsx
    │   │   ├── ProductDetailPage.jsx
    │   │   ├── CartPage.jsx
    │   │   ├── CheckoutPage.jsx
    │   │   └── SellerDashboardPage.jsx
    │   ├── App.jsx                  # Definición de rutas
    │   └── main.jsx                 # Punto de entrada React
    ├── .env.example
    └── package.json
```

---

## Despliegue en Render

### Backend (Web Service)

| Campo | Valor |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install && npm run build` |
| Start Command | `node server.js` |

Variables de entorno requeridas: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV`, `FRONTEND_URL`.

### Frontend (Static Site)

| Campo | Valor |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

Variables de entorno requeridas: `VITE_API_URL`.

> **Orden de despliegue:** primero el backend, luego el frontend. La URL del backend debe estar lista antes de configurar `VITE_API_URL`.

---

## Modelo de datos

```
User ──────────────< Product
  │                    │
  ├──────────────< CartItem >──┘
  │
  └──────────────< Order ──────< OrderItem >── Product
```

- Un **User** con rol `VENDEDOR` puede tener muchos **Products**
- Un **User** puede tener muchos **CartItems** (su carrito activo)
- Un **User** puede tener muchas **Orders** (historial de compras)
- Una **Order** tiene muchos **OrderItems** que capturan precio y cantidad al momento de la compra

---

## Licencia

MIT
