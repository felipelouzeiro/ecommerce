const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Registro de usuário
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validações básicas
    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    if (!['CLIENT', 'SELLER'].includes(role)) {
      return res.status(400).json({ message: 'Papel inválido' });
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user,
      token
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.active) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Exclusão de conta (cliente)
router.delete('/account', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Verificar se é cliente
    if (req.user.role !== 'CLIENT') {
      return res.status(403).json({ message: 'Apenas clientes podem excluir a conta' });
    }

    // Desativar usuário (manter histórico)
    await prisma.user.update({
      where: { id: userId },
      data: { active: false }
    });

    res.json({ message: 'Conta excluída com sucesso' });
  } catch (error) {
    console.error('Erro na exclusão:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Desativação de conta (vendedor)
router.patch('/deactivate', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Verificar se é vendedor
    if (req.user.role !== 'SELLER') {
      return res.status(403).json({ message: 'Apenas vendedores podem desativar a conta' });
    }

    // Desativar usuário e produtos
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { active: false }
      }),
      prisma.product.updateMany({
        where: { sellerId: userId },
        data: { active: false }
      })
    ]);

    res.json({ message: 'Conta desativada com sucesso' });
  } catch (error) {
    console.error('Erro na desativação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
