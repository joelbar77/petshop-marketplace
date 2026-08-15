const express = require("express");
const prisma = require("../prismaClient");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/orders - admin, lista todos los pedidos
router.get("/", requireAdmin, async (req, res) => {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

// GET /api/orders/:id - admin o el propio comprador (con el id que le dimos tras comprar)
router.get("/:id", async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true } } },
  });
  if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
  res.json(order);
});

// PUT /api/orders/:id/status - admin, actualiza estado manualmente (ej: "shipped")
router.put("/:id/status", requireAdmin, async (req, res) => {
  const { status } = req.body;
  const valid = ["pending", "paid", "rejected", "shipped", "delivered", "cancelled"];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: "Estado inválido" });
  }
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json(order);
});

module.exports = router;
