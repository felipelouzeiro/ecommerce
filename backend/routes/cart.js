const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Obter carrinho
router.get('/', authenticateToken, requireRole(['CLIENT']), async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            seller: {
              select: { name: true }
            }
          }
        }
      }
    });

    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    res.json({
      items: cartItems,
      total: parseFloat(total.toFixed(2))
    });
  } catch (error) {
    console.error('Erro ao obter carrinho:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Adicionar item ao carrinho
router.post('/add', authenticateToken, requireRole(['CLIENT']), async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'ID do produto é obrigatório' });
    }

    // Verificar se o produto existe e está ativo
    const product = await prisma.product.findFirst({
      where: { id: productId, active: true }
    });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // Verificar se já existe no carrinho
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    });

    if (existingItem) {
      // Atualizar quantidade
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + parseInt(quantity) }
      });

      return res.json({
        message: 'Item atualizado no carrinho',
        item: updatedItem
      });
    }

    // Adicionar novo item
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: req.user.id,
        productId,
        quantity: parseInt(quantity)
      },
      include: {
        product: true
      }
    });

    res.status(201).json({
      message: 'Item adicionado ao carrinho',
      item: cartItem
    });
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar quantidade
router.put('/update', authenticateToken, requireRole(['CLIENT']), async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity < 0) {
      return res.status(400).json({ message: 'Dados inválidos' });
    }

    if (quantity === 0) {
      // Remover item
      await prisma.cartItem.deleteMany({
        where: {
          userId: req.user.id,
          productId
        }
      });

      return res.json({ message: 'Item removido do carrinho' });
    }

    // Atualizar quantidade
    const updatedItem = await prisma.cartItem.updateMany({
      where: {
        userId: req.user.id,
        productId
      },
      data: { quantity: parseInt(quantity) }
    });

    if (updatedItem.count === 0) {
      return res.status(404).json({ message: 'Item não encontrado no carrinho' });
    }

    res.json({ message: 'Carrinho atualizado' });
  } catch (error) {
    console.error('Erro ao atualizar carrinho:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Remover item
router.delete('/remove', authenticateToken, requireRole(['CLIENT']), async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'ID do produto é obrigatório' });
    }

    const deletedItem = await prisma.cartItem.deleteMany({
      where: {
        userId: req.user.id,
        productId
      }
    });

    if (deletedItem.count === 0) {
      return res.status(404).json({ message: 'Item não encontrado no carrinho' });
    }

    res.json({ message: 'Item removido do carrinho' });
  } catch (error) {
    console.error('Erro ao remover do carrinho:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
