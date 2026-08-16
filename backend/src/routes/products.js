const express = require("express");
const prisma = require("../prismaClient");
const { requireAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET /api/products - público, con filtros ?categoria=&mascota=&buscar=
router.get("/", async (req, res) => {
  const { categoria, mascota, buscar, admin } = req.query;

  const where = {};
  if (!admin) where.active = true; // el panel admin puede pedir también los inactivos
  if (categoria) where.category = { slug: categoria };
  if (mascota) where.petType = mascota;
  if (buscar) where.name = { contains: buscar };

  const products = await prisma.product.findMany({
    where,
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(products);
});

// GET /api/products/:slug - público
router.get("/:slug", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { images: true, category: true },
  });
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(product);
});

// POST /api/products - admin (hasta 6 imágenes)
router.post("/", requireAdmin, upload.array("images", 6), async (req, res) => {
  try {
    const { name, description, price, stock, petType, categoryId, active } = req.body;
    if (!name || !price || !categoryId) {
      return res.status(400).json({ error: "Nombre, precio y categoría son requeridos" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: `${slugify(name)}-${Date.now().toString(36)}`,
        description: description || "",
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 0,
        petType: petType || "otro",
        active: active === undefined ? true : active === "true" || active === true,
        categoryId,
        images: {
          create: (req.files || []).map((f, i) => ({
            url: `/uploads/${f.filename}`,
            position: i,
          })),
        },
      },
      include: { images: true, category: true },
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/products/:id - admin (agrega imágenes nuevas si se mandan; no borra las viejas)
router.put("/:id", requireAdmin, upload.array("images", 6), async (req, res) => {
  try {
    const { name, description, price, stock, petType, categoryId, active } = req.body;
    const data = {};
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (stock !== undefined) data.stock = parseInt(stock);
    if (petType) data.petType = petType;
    if (categoryId) data.categoryId = categoryId;
    if (active !== undefined) data.active = active === "true" || active === true;

    if (req.files && req.files.length > 0) {
      data.images = {
        create: req.files.map((f, i) => ({ url: `/uploads/${f.filename}`, position: i })),
      };
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { images: true, category: true },
    });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/products/:id - admin
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: "No se pudo eliminar el producto" });
  }
});

// DELETE /api/products/:id/images/:imageId - admin, para sacar una imagen puntual
router.delete("/:id/images/:imageId", requireAdmin, async (req, res) => {
  try {
    await prisma.productImage.delete({ where: { id: req.params.imageId } });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: "No se pudo eliminar la imagen" });
  }
});

module.exports = router;
