const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Configuração do multer para upload
const upload = multer({ dest: 'uploads/' });

// Listar produtos (com paginação e filtros)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', minPrice, maxPrice } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      active: true,
      seller: { active: true }
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          seller: {
            select: { name: true }
          }
        },
        orderBy: { publishedAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: { name: true }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar produto
router.post('/', authenticateToken, requireRole(['SELLER']), async (req, res) => {
  try {
    const { name, price, description, imageUrl } = req.body;

    if (!name || !price || !description || !imageUrl) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        description,
        imageUrl,
        sellerId: req.user.id
      },
      include: {
        seller: {
          select: { name: true }
        }
      }
    });

    res.status(201).json({
      message: 'Produto criado com sucesso',
      product
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Upload CSV
router.post('/upload-csv', authenticateToken, requireRole(['SELLER']), upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Arquivo CSV é obrigatório' });
    }

    const products = [];
    const errors = [];

    // Processar CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          const { nome, preco, descricao, url_imagem } = row;
          
          if (!nome || !preco || !descricao || !url_imagem) {
            errors.push(`Linha inválida: ${JSON.stringify(row)}`);
            return;
          }

          products.push({
            name: nome,
            price: parseFloat(preco),
            description: descricao,
            imageUrl: url_imagem,
            sellerId: req.user.id
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (products.length === 0) {
      return res.status(400).json({ message: 'Nenhum produto válido encontrado no CSV' });
    }

    // Inserir produtos em lote
    const createdProducts = await prisma.product.createMany({
      data: products
    });

    // Limpar arquivo temporário
    fs.unlinkSync(req.file.path);

    res.json({
      message: `${createdProducts.count} produtos criados com sucesso`,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Erro no upload CSV:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar produto
router.put('/:id', authenticateToken, requireRole(['SELLER']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, imageUrl } = req.body;

    // Verificar se o produto pertence ao vendedor
    const existingProduct = await prisma.product.findFirst({
      where: { id, sellerId: req.user.id }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: parseFloat(price),
        description,
        imageUrl
      }
    });

    res.json({
      message: 'Produto atualizado com sucesso',
      product
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar produtos do vendedor
router.get('/seller/products', authenticateToken, requireRole(['SELLER']), async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { sellerId: req.user.id },
      include: {
        seller: {
          select: { name: true }
        }
      },
      orderBy: { publishedAt: 'desc' }
    });

    res.json({ products });
  } catch (error) {
    console.error('Erro ao listar produtos do vendedor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar produto
router.delete('/:id', authenticateToken, requireRole(['SELLER']), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o produto pertence ao vendedor
    const existingProduct = await prisma.product.findFirst({
      where: { id, sellerId: req.user.id }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
