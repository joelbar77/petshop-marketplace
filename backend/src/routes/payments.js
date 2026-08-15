const express = require("express");
const prisma = require("../prismaClient");
const { preferenceClient, paymentClient } = require("../utils/mercadopago");

const router = express.Router();

// POST /api/payments/create-preference
// Body: { customerName, customerEmail, customerPhone, shippingAddress, items: [{productId, quantity}] }
// Crea el pedido en la base (status "pending") y una preferencia de pago en Mercado Pago.
// Mercado Pago Checkout Pro ya incluye tarjeta de crédito, débito y transferencia/pago
// en efectivo según el medio que elija el comprador en Argentina.
router.post("/create-preference", async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress, items } = req.body;

    if (!customerName || !customerEmail || !items || items.length === 0) {
      return res.status(400).json({ error: "Faltan datos del pedido" });
    }

    // Traemos los productos reales de la base para no confiar en precios del frontend
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: "Algún producto ya no está disponible" });
    }

    let total = 0;
    const orderItemsData = items.map((i) => {
      const product = products.find((p) => p.id === i.productId);
      total += product.price * i.quantity;
      return {
        productId: product.id,
        quantity: i.quantity,
        unitPrice: product.price,
      };
    });

    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        total,
        status: "pending",
        items: { create: orderItemsData },
      },
    });

    const preference = await preferenceClient.create({
      body: {
        items: items.map((i) => {
          const product = products.find((p) => p.id === i.productId);
          return {
            id: product.id,
            title: product.name,
            quantity: i.quantity,
            unit_price: product.price,
            currency_id: "ARS",
          };
        }),
        payer: { name: customerName, email: customerEmail },
        external_reference: order.id,
        back_urls: {
          success: `${process.env.FRONTEND_URL}/pedido/${order.id}?estado=exito`,
          failure: `${process.env.FRONTEND_URL}/pedido/${order.id}?estado=fallo`,
          pending: `${process.env.FRONTEND_URL}/pedido/${order.id}?estado=pendiente`,
        },
        auto_return: "approved",
        notification_url: `${process.env.BACKEND_PUBLIC_URL}/api/payments/webhook`,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: preference.id },
    });

    res.json({ orderId: order.id, initPoint: preference.init_point });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo generar el pago" });
  }
});

// POST /api/payments/webhook - Mercado Pago notifica acá los cambios de estado del pago
router.post("/webhook", async (req, res) => {
  try {
    const paymentId = req.query.id || req.body?.data?.id;
    const topic = req.query.topic || req.body?.type;

    if (topic !== "payment" || !paymentId) {
      return res.sendStatus(200); // ignoramos otros topics (ej: merchant_order)
    }

    const payment = await paymentClient.get({ id: paymentId });
    const orderId = payment.external_reference;
    if (!orderId) return res.sendStatus(200);

    let status = "pending";
    if (payment.status === "approved") status = "paid";
    else if (payment.status === "rejected") status = "rejected";
    else if (payment.status === "cancelled") status = "cancelled";

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        paymentMethod: payment.payment_type_id, // credit_card, debit_card, bank_transfer, etc.
        mpPaymentId: String(payment.id),
      },
    });

    // Si se pagó, descontamos stock
    if (status === "paid") {
      const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        }).catch(() => {}); // no cortamos el webhook si algún producto ya no existe
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Error en webhook de MP:", err.message);
    res.sendStatus(200); // igual respondemos 200 para que MP no reintente indefinidamente
  }
});

module.exports = router;
