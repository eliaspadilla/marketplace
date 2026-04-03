/**
 * seed.js — Pobla la base de datos con datos de prueba.
 * Ejecutar con: npm run db:seed
 *
 * Crea:
 *   - 1 vendedor de prueba
 *   - 1 comprador de prueba
 *   - 4 productos publicados por el vendedor
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Limpiar datos previos en orden correcto (por dependencias de FK)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // Crear vendedor de prueba
  const vendedor = await prisma.user.create({
    data: {
      nombre: 'Ana Vendedora',
      email: 'vendedor@test.com',
      password: passwordHash,
      rol: 'VENDEDOR',
    },
  });

  // Crear comprador de prueba
  await prisma.user.create({
    data: {
      nombre: 'Carlos Comprador',
      email: 'comprador@test.com',
      password: passwordHash,
      rol: 'COMPRADOR',
    },
  });

  // Crear productos asociados al vendedor
  await prisma.product.createMany({
    data: [
      {
        nombre: 'Teclado Mecánico',
        descripcion: 'Teclado mecánico retroiluminado, switches azules, ideal para programadores.',
        precio: 89.99,
        stock: 15,
        imageUrl: null,
        vendedorId: vendedor.id,
      },
      {
        nombre: 'Monitor 24"',
        descripcion: 'Monitor Full HD 1080p, 75Hz, panel IPS, ideal para trabajo y gaming.',
        precio: 249.99,
        stock: 8,
        imageUrl: null,
        vendedorId: vendedor.id,
      },
      {
        nombre: 'Mouse Inalámbrico',
        descripcion: 'Mouse ergonómico inalámbrico con autonomía de 6 meses.',
        precio: 34.99,
        stock: 30,
        imageUrl: null,
        vendedorId: vendedor.id,
      },
      {
        nombre: 'Webcam HD',
        descripcion: 'Cámara web 1080p con micrófono integrado, compatible con videollamadas.',
        precio: 59.99,
        stock: 20,
        imageUrl: null,
        vendedorId: vendedor.id,
      },
    ],
  });

  console.log('✅ Seed completado');
  console.log('   vendedor@test.com  / password123 (rol: VENDEDOR)');
  console.log('   comprador@test.com / password123 (rol: COMPRADOR)');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
