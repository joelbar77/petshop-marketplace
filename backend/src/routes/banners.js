const express = require("express");
const prisma = require("../prismaClient");
const { requireAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// GET /api/banners - público, solo activos, ordenados. ?admin=true trae todos (admin).
router.get("/", async (req, res) => {
  const where = req.query.admin ? {} : { active: true };
  const banners = await prisma.banner.findMany({
    where,
    orderBy: { position: "asc" },
  });
  res.json(banners);
});

// POST /api/banners - admin
router.post("/", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, subtitle, linkUrl, active } = req.body;
    if (!req.file) return res.status(400).json({ error: "La imagen es requerida" });

    const count = await prisma.banner.count();
    const banner = await prisma.banner.create({
      data: {
        title: title || null,
        subtitle: subtitle || null,
        linkUrl: linkUrl || null,
        imageUrl: `/uploads/${req.file.filename}`,
        active: active === undefined ? true : active === "true" || active === true,
        position: count,
      },
    });
    res.status(201).json(banner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/banners/:id - admin
router.put("/:id", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, subtitle, linkUrl, active, position } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (subtitle !== undefined) data.subtitle = subtitle;
    if (linkUrl !== undefined) data.linkUrl = linkUrl;
    if (active !== undefined) data.active = active === "true" || active === true;
    if (position !== undefined) data.position = parseInt(position);
    if (req.file) data.imageUrl = `/uploads/${req.file.filename}`;

    const banner = await prisma.banner.update({ where: { id: req.params.id }, data });
    res.json(banner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/banners/:id - admin
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.banner.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: "No se pudo eliminar el banner" });
  }
});

module.exports = router;
