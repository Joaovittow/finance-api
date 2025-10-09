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

```bash
finance-api/
├── src/
│ ├── controllers/ # Controladores das rotas
│ ├── services/ # Lógica de negócio
│ ├── routes/ # Definição de rotas
│ └── server.js # Arquivo principal
├── prisma/ # Schema e migrations do banco
└── package.json
```

---

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js (v20.19.5 ou superior)
- PostgreSQL
- npm ou yarn

### Passos para instalação
**Clone o repositório**
```bash
git clone [url-do-repositorio]
cd finance-api
```
   
**Instale as dependências**
```bash
npm install
```

**Crie um arquivo .env na raiz do projeto:** Configure as variáveis de ambiente
```bash
DATABASE_URL="..."
JWT_SECRET="seu_jwt_secret_aqui"
PORT=3001
```

**Configure o banco de dados**
```bash
npx prisma generate
npx prisma db push
```

**Inicie o servidor (Desenvolvimento)**
```bash
npm run dev
```

---

## 🎯 Funcionalidades Principais
**✅ Sistema de Autenticação**
Registro e login de usuários

Proteção de rotas com JWT

Senhas criptografadas com bcrypt

**✅ Organização por Períodos**
Controle financeiro por meses

Divisão em quinzenas (primeira e segunda)

Cálculo automático de saldos

**✅ Gestão de Despesas**
Despesas à vista e parceladas

Cálculo automático de parcelas

Categorização de despesas

Controle de vencimentos

**✅ Gestão de Receitas**
Diferentes tipos de receita

Associação com quinzenas

Cálculo de totais

**✅ Cálculos Automáticos**
Saldo disponível por quinzena

Total de receitas

Total de despesas pagas

Saldo anterior automático

# Banco de dados
```bash
npx prisma generate      # Gera cliente do Prisma
npx prisma db push       # Sincroniza schema com banco
npx prisma studio        # Abre Prisma Studio
```

---

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
