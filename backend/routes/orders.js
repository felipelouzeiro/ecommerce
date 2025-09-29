const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Finalizar compra
router.post('/', authenticateToken, requireRole(['CLIENT']), async (req, res) => {
  try {
    // Obter itens do carrinho
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Carrinho vazio' });
    }

    // Calcular total
    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // Criar pedido e itens em transação
    const order = await prisma.$transaction(async (tx) => {
      // Criar pedido
      const newOrder = await tx.order.create({
        data: {
          customerId: req.user.id,
          total: parseFloat(total.toFixed(2)),
          status: 'PENDING'
        }
      });

      // Criar itens do pedido
      const orderItems = await Promise.all(
        cartItems.map(item =>
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }
          })
        )
      );

      // Limpar carrinho
      await tx.cartItem.deleteMany({
        where: { userId: req.user.id }
      });

      return { order: newOrder, items: orderItems };
    });

    res.status(201).json({
      message: 'Compra finalizada com sucesso',
      order: order.order,
      items: order.items
    });
  } catch (error) {
    console.error('Erro ao finalizar compra:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Histórico de compras
router.get('/', authenticateToken, requireRole(['CLIENT']), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId: req.user.id },
        skip,
        take: parseInt(limit),
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({
        where: { customerId: req.user.id }
      })
    ]);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
