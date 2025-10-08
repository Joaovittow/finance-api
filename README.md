# Finance Backend API

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
finance-api/
├── src/
│ ├── controllers/ # Controladores das rotas
│ ├── services/ # Lógica de negócio
│ ├── routes/ # Definição de rotas
│ └── server.js # Arquivo principal
├── prisma/ # Schema e migrations do banco
└── package.json

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js (versão 16 ou superior)
- PostgreSQL
- npm ou yarn

### Passos para instalação

1. **Clone o repositório**
   ```bash
   git clone [url-do-repositorio]
   cd finance-api
Instale as dependências

bash
npm install
Configure as variáveis de ambiente
Crie um arquivo .env na raiz do projeto:

env
DATABASE_URL="..."
JWT_SECRET="seu_jwt_secret_aqui"
PORT=3001
Configure o banco de dados

bash
npx prisma generate
npx prisma db push
Inicie o servidor

bash
# Desenvolvimento
npm run dev


🎯 Funcionalidades Principais
✅ Sistema de Autenticação
Registro e login de usuários

Proteção de rotas com JWT

Senhas criptografadas com bcrypt

✅ Organização por Períodos
Controle financeiro por meses

Divisão em quinzenas (primeira e segunda)

Cálculo automático de saldos

✅ Gestão de Despesas
Despesas à vista e parceladas

Cálculo automático de parcelas

Categorização de despesas

Controle de vencimentos

✅ Gestão de Receitas
Diferentes tipos de receita

Associação com quinzenas

Cálculo de totais

✅ Cálculos Automáticos
Saldo disponível por quinzena

Total de receitas

Total de despesas pagas

Saldo anterior automático

🛠 Comandos Úteis
bash
# Desenvolvimento
npm run dev              # Inicia servidor com nodemon

# Banco de dados
npm run db:generate      # Gera cliente do Prisma
npm run db:push          # Sincroniza schema com banco
npm run db:studio        # Abre Prisma Studio

🐛 Tratamento de Erros
Erros são logados no console

Respostas padronizadas para clientes

Status HTTP apropriados

Mensagens de erro claras

📝 Modelo de Dados
Principais entidades:

User - Usuários do sistema

Mes - Meses com ano e mês

Quinzena - Primeira ou segunda quinzena do mês

Receita - Entradas de dinheiro

Despesa - Saídas de dinheiro

Parcela - Parcelas de despesas

🔒 Segurança
Autenticação JWT

Senhas hash com bcrypt

CORS configurado

Validação de dados

Proteção contra SQL injection (Prisma)

🤝 Contribuição
Fork o projeto

Crie uma branch para sua feature (git checkout -b feature/AmazingFeature)

Commit suas mudanças (git commit -m 'Add some AmazingFeature')

Push para a branch (git push origin feature/AmazingFeature)

Abra um Pull Request