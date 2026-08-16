require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("./prismaClient");

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@petshop.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin1234";

  const existing = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.create({
      data: { email: adminEmail, passwordHash, name: "Administrador" },
    });
    console.log(`Admin creado -> email: ${adminEmail} / password: ${adminPassword}`);
  } else {
    console.log("El admin ya existía, no se creó de nuevo.");
  }

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
  console.log("Categorías de ejemplo listas.");

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  console.log("Configuración del sitio inicializada.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
