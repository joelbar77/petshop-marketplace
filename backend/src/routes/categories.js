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

// GET /api/categories - público
router.get("/", async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  res.json(categories);
});

// GET /api/categories/:slug - público
router.get("/:slug", async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { slug: req.params.slug },
  });
  if (!category) return res.status(404).json({ error: "Categoría no encontrada" });
  res.json(category);
});

// POST /api/categories - admin
router.post("/", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "El nombre es requerido" });

    const category = await prisma.category.create({
      data: {
        name,
        slug: slugify(name),
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      },
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/categories/:id - admin
router.put("/:id", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name } = req.body;
    const data = {};
    if (name) {
      data.name = name;
      data.slug = slugify(name);
    }
    if (req.file) data.imageUrl = `/uploads/${req.file.filename}`;

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data,
    });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/categories/:id - admin
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: "No se pudo eliminar (¿tiene productos asociados?)" });
  }
});

module.exports = router;
