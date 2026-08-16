require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("./prismaClient");

async function main() {
  // 1. Crear administrador
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@petshop.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin1234";

  const existing = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.create({
      data: { email: adminEmail, passwordHash, name: "Administrador" },
    });
    console.log(`✅ Admin creado -> email: ${adminEmail} / password: ${adminPassword}`);
  } else {
    console.log("ℹ️ El admin ya existía, no se creó de nuevo.");
  }

  // 2. Crear categorías
  const categoriesData = [
    { name: "Alimento para Perros", slug: "alimento-perros" },
    { name: "Alimento para Gatos", slug: "alimento-gatos" },
    { name: "Juguetes", slug: "juguetes" },
    { name: "Higiene y Cuidado", slug: "higiene-cuidado" },
    { name: "Accesorios", slug: "accesorios" },
  ];

  for (const c of categoriesData) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log("✅ Categorías de ejemplo listas.");

  // 3. Obtener categorías para asociar productos
  const categoryPerros = await prisma.category.findUnique({ where: { slug: "alimento-perros" } });
  const categoryGatos = await prisma.category.findUnique({ where: { slug: "alimento-gatos" } });
  const categoryJuguetes = await prisma.category.findUnique({ where: { slug: "juguetes" } });
  const categoryHigiene = await prisma.category.findUnique({ where: { slug: "higiene-cuidado" } });
  const categoryAccesorios = await prisma.category.findUnique({ where: { slug: "accesorios" } });

  // 4. Crear productos de ejemplo
  const productsData = [
    {
      name: "Correa de paseo reforzada",
      slug: "correa-de-paseo-reforzada",
      description: "Correa para perros grandes, resistente y duradera. Ideal para paseos diarios.",
      price: 12999,
      stock: 10,
      petType: "perro",
      active: true,
      categoryId: categoryAccesorios.id,
    },
    {
      name: "Alimento balanceado para perros",
      slug: "alimento-balanceado-perros",
      description: "Alimento completo y balanceado para perros adultos. 20kg.",
      price: 8599,
      stock: 20,
      petType: "perro",
      active: true,
      categoryId: categoryPerros.id,
    },
    {
      name: "Arenero sanitario para gatos",
      slug: "arenero-sanitario-gatos",
      description: "Arenero con filtro de carbón y pala incluida. Fácil de limpiar.",
      price: 15999,
      stock: 5,
      petType: "gato",
      active: true,
      categoryId: categoryGatos.id,
    },
    {
      name: "Juguete mordedor para perros",
      slug: "juguete-mordedor-perros",
      description: "Juguete de goma resistente, ideal para perros que muerden mucho.",
      price: 3499,
      stock: 15,
      petType: "perro",
      active: true,
      categoryId: categoryJuguetes.id,
    },
    {
      name: "Shampoo hipoalergénico para mascotas",
      slug: "shampoo-hipoalergenico-mascotas",
      description: "Shampoo suave, sin perfumes ni colorantes. Ideal para pieles sensibles.",
      price: 2999,
      stock: 8,
      petType: "perro",
      active: true,
      categoryId: categoryHigiene.id,
    },
    {
      name: "Comedero automático para gatos",
      slug: "comedero-automatico-gatos",
      description: "Comedero con temporizador, ideal para gatos que comen varias veces al día.",
      price: 24999,
      stock: 3,
      petType: "gato",
      active: true,
      categoryId: categoryAccesorios.id,
    },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log(`✅ ${productsData.length} productos de ejemplo creados.`);

  // 5. Configuración del sitio
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  console.log("✅ Configuración del sitio inicializada.");

  console.log("🎉 ¡Seed completado con éxito!");
}

main()
  .catch((e) => console.error("❌ Error en seed:", e))
  .finally(() => prisma.$disconnect());