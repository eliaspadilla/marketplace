/**
 * server.js — Punto de entrada de la aplicación.
 * Solo instancia el servidor HTTP y escucha en el puerto configurado.
 */

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
});
