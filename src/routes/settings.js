const express = require("express");
const prisma = require("../prismaClient");
const { requireAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

async function getOrCreateSettings() {
  let settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { id: "singleton" } });
  }
  return settings;
}

// GET /api/settings - público
router.get("/", async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json(settings);
});

// PUT /api/settings - admin (puede mandar logo y/o heroImage como archivos)
router.put(
  "/",
  requireAdmin,
  upload.fields([{ name: "logo", maxCount: 1 }, { name: "heroImage", maxCount: 1 }]),
  async (req, res) => {
    try {
      await getOrCreateSettings();

      const { businessName, primaryColor, heroTitle, heroSubtitle, sectionsOrder } = req.body;
      const data = {};
      if (businessName !== undefined) data.businessName = businessName;
      if (primaryColor !== undefined) data.primaryColor = primaryColor;
      if (heroTitle !== undefined) data.heroTitle = heroTitle;
      if (heroSubtitle !== undefined) data.heroSubtitle = heroSubtitle;
      if (sectionsOrder !== undefined) data.sectionsOrder = sectionsOrder;
      if (req.files?.logo?.[0]) data.logoUrl = `/uploads/${req.files.logo[0].filename}`;
      if (req.files?.heroImage?.[0]) data.heroImageUrl = `/uploads/${req.files.heroImage[0].filename}`;

      const settings = await prisma.siteSettings.update({
        where: { id: "singleton" },
        data,
      });
      res.json(settings);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

module.exports = router;
