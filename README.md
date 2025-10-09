# Finance API

Uma API RESTful para gerenciamento financeiro pessoal, desenvolvida em Node.js com Express e Prisma ORM.

## 📋 Descrição

Sistema de controle financeiro que organiza despesas e receitas por meses e quinzenas, com suporte a parcelamento de despesas, autenticação de usuários e cálculos automáticos de saldo.

## 🛠 Tecnologias Utilizadas

- **Node.js** - Ambiente de execução
- **Express** - Framework web
- **Prisma ORM** - ORM para banco de dados
- **PostgreSQL** - Banco de dados (assumido pelo Prisma)
- **JWT** - Autenticação
- **bcrypt** - Criptografia de senhas
- **CORS** - Controle de acesso entre origens

## 📦 Estrutura do Projeto
finance-api/ <br>
├── src/ <br>
│ ├── controllers/ # Controladores das rotas <br>
│ ├── services/ # Lógica de negócio <br>
│ ├── routes/ # Definição de rotas<br>
│ └── server.js # Arquivo principal <br>
├── prisma/ # Schema e migrations do banco <br>
└── package.json

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js (versão 16 ou superior)
- PostgreSQL
- npm ou yarn

### Passos para instalação
1. **Clone o repositório** <br>
   git clone [url-do-repositorio] <br>
   cd finance-api <br>
   
### Instale as dependências
npm install <br>
Configure as variáveis de ambiente

### Crie um arquivo .env na raiz do projeto:
DATABASE_URL="..." <br>
JWT_SECRET="seu_jwt_secret_aqui" <br>
PORT=3001

### Configure o banco de dados
npx prisma generate <br>
npx prisma db push

# Inicie o servidor (Desenvolvimento)
npm run dev

## 🎯 Funcionalidades Principais
### ✅ Sistema de Autenticação
Registro e login de usuários

Proteção de rotas com JWT

Senhas criptografadas com bcrypt

### ✅ Organização por Períodos
Controle financeiro por meses

Divisão em quinzenas (primeira e segunda)

Cálculo automático de saldos

### ✅ Gestão de Despesas
Despesas à vista e parceladas

Cálculo automático de parcelas

Categorização de despesas

Controle de vencimentos

### ✅ Gestão de Receitas
Diferentes tipos de receita

Associação com quinzenas

Cálculo de totais

### ✅ Cálculos Automáticos
Saldo disponível por quinzena

Total de receitas

Total de despesas pagas

Saldo anterior automático

# Banco de dados
npm run db:generate      # Gera cliente do Prisma <br>
npm run db:push          # Sincroniza schema com banco <br>
npm run db:studio        # Abre Prisma Studio

# 🔒 Segurança
Autenticação JWT

Senhas hash com bcrypt

CORS configurado

Validação de dados

Proteção contra SQL injection (Prisma)

# 🤝 Contribuição
Fork o projeto

Crie uma branch para sua feature (git checkout -b feature/AmazingFeature)

Commit suas mudanças (git commit -m 'Add some AmazingFeature')

Push para a branch (git push origin feature/AmazingFeature)

Abra um Pull Request
