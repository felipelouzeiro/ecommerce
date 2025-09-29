const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Estatísticas do vendedor
router.get('/stats', authenticateToken, requireRole(['SELLER']), async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Total de produtos vendidos
    const totalSold = await prisma.orderItem.aggregate({
      where: {
        product: { sellerId }
      },
      _sum: { quantity: true }
    });

    // Faturamento total
    const totalRevenue = await prisma.orderItem.aggregate({
      where: {
        product: { sellerId }
      },
      _sum: { 
        price: true 
      }
    });

    // Quantidade de produtos cadastrados
    const totalProducts = await prisma.product.count({
      where: { sellerId, active: true }
    });

    // Produto mais vendido
    const bestSeller = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        product: { sellerId }
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 1
    });

    let bestSellerProduct = null;
    if (bestSeller.length > 0) {
      bestSellerProduct = await prisma.product.findUnique({
        where: { id: bestSeller[0].productId },
        select: {
          id: true,
          name: true,
          imageUrl: true
        }
      });
    }

    res.json({
      totalSold: totalSold._sum.quantity || 0,
      totalRevenue: totalRevenue._sum.price || 0,
      totalProducts,
      bestSeller: bestSellerProduct
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
