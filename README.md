# Loja Online - E-commerce

## 📋 Descrição

Sistema de e-commerce completo desenvolvido com Next.js (frontend) e Node.js (backend), incluindo autenticação, gerenciamento de produtos, carrinho de compras e persistência de dados com PostgreSQL.

## 🏗️ Arquitetura do Sistema

### Frontend
- **Framework**: Next.js 14
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Ícones**: Material Icons (Google)
- **Autenticação**: JWT tokens

### Backend
- **Framework**: Node.js com Express
- **Linguagem**: JavaScript
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: JWT

### Infraestrutura
- **Banco de Dados**: PostgreSQL via Docker
- **Deploy Backend**: Render
- **Deploy Frontend**: Vercel/Netlify

## 🚀 Funcionalidades

### Autenticação & Papéis
- ✅ Cadastro de usuários (Cliente/Vendedor)
- ✅ Login/Logout
- ✅ Exclusão de conta (Cliente)
- ✅ Desativação de conta (Vendedor)
- ✅ Manutenção de histórico após exclusão

### Funcionalidades do Vendedor
- ✅ Dashboard com métricas
- ✅ Cadastro manual de produtos
- ✅ Upload CSV para múltiplos produtos
- ✅ Gerenciamento de produtos
- ✅ Suporte a grandes volumes de dados

### Funcionalidades do Cliente
- ✅ Busca e filtragem de produtos
- ✅ Paginação de resultados
- ✅ Sistema de favoritos
- ✅ Carrinho de compras persistente
- ✅ Finalização de compras
- ✅ Histórico de compras

## 📁 Estrutura do Projeto

```
loja-online/
├── backend/                 # API Node.js
│   ├── routes/              # Rotas da API
│   ├── middleware/          # Autenticação
│   ├── prisma/              # Schema do banco
│   └── package.json
├── frontend/                # App Next.js
│   ├── pages/               # Páginas
│   ├── components/          # Componentes
│   └── package.json
├── docker-compose.yml       # PostgreSQL
└── README.md
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM para PostgreSQL
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

### Frontend
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS
- **Material Icons** - Biblioteca de ícones
- **Axios** - Cliente HTTP
- **React Hook Form** - Gerenciamento de formulários
- **Zustand** - Estado global

### Banco de Dados
- **PostgreSQL** - Banco relacional
- **Docker** - Containerização

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- Git

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd loja-online
```

### 2. Configure o banco de dados
```bash
# Inicie o PostgreSQL via Docker
docker-compose up -d

# Execute as migrations
cd backend
npx prisma migrate dev
npx prisma generate
```

### 3. Configure o backend
```bash
cd backend
npm install
npm run dev
```

### 4. Configure o frontend
```bash
cd frontend
npm install
npm run dev
```

## 📊 Modelo de Dados

### Entidades Principais
- **User**: Usuários (Cliente/Vendedor)
- **Product**: Produtos
- **Cart**: Carrinho de compras
- **Order**: Pedidos
- **OrderItem**: Itens do pedido
- **Favorite**: Produtos favoritos

### Relacionamentos
- User 1:N Product (vendedor)
- User 1:N Order (cliente)
- User 1:N Favorite (cliente)
- Product 1:N OrderItem
- Order 1:N OrderItem

## 🔐 Autenticação

### Fluxo de Autenticação
1. Usuário se registra escolhendo papel (Cliente/Vendedor)
2. Sistema valida dados e cria conta
3. Usuário faz login
4. Sistema retorna JWT token
5. Token é usado para autenticar requisições

### Middleware de Autenticação
- Verifica JWT token
- Valida se usuário existe e está ativo
- Adiciona dados do usuário ao request

## 📈 Dashboard do Vendedor

### Métricas Exibidas
- **Total de produtos vendidos**: Soma de quantidades vendidas
- **Faturamento total**: Soma do valor total das vendas
- **Quantidade de produtos**: Total de produtos cadastrados
- **Produto mais vendido**: Produto com maior quantidade vendida

## 🛒 Sistema de Compras

### Fluxo de Compra
1. Cliente adiciona produtos ao carrinho
2. Carrinho persiste dados localmente
3. Cliente finaliza compra
4. Sistema cria pedido e itens
5. Produtos são removidos do carrinho
6. Histórico é atualizado

### Carrinho de Compras
- Persistência local (localStorage)
- Sincronização com backend
- Cálculo automático de totais
- Validação de estoque

## 📁 Upload de CSV

### Formato do Arquivo
```csv
nome,preco,descricao,url_imagem
Produto 1,29.90,Descrição do produto 1,https://exemplo.com/img1.jpg
```

## 🚀 Deploy

### Deploy
- **Backend**: Render
- **Frontend**: Vercel
- **Banco**: PostgreSQL via Docker

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `DELETE /api/auth/account` - Exclusão de conta

### Produtos
- `GET /api/products` - Listar produtos (com paginação e filtros)
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto
- `POST /api/products/upload-csv` - Upload CSV

### Carrinho
- `GET /api/cart` - Obter carrinho
- `POST /api/cart/add` - Adicionar item
- `PUT /api/cart/update` - Atualizar item
- `DELETE /api/cart/remove` - Remover item

### Pedidos
- `POST /api/orders` - Finalizar compra
- `GET /api/orders` - Histórico de compras

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas do vendedor

## 🔧 Configuração de Ambiente

### Desenvolvimento Local
```bash
# No diretório frontend, crie um arquivo .env.local:
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Produção no Vercel
1. Acesse o painel do Vercel
2. Vá em Settings > Environment Variables
3. Adicione:
   - `NEXT_PUBLIC_API_URL` = `https://seu-backend.onrender.com`

### Detecção Automática
O sistema detecta automaticamente se está rodando localmente ou no Vercel:
- **Local**: Usa `http://localhost:3001`
- **Vercel**: Usa a URL configurada em `NEXT_PUBLIC_API_URL`

## 📚 Documentação Adicional

- [API Documentation](docs/api.md)


