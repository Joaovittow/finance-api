import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_aqui';

export class UserService {
  async registerUser(email, name, password) {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Usuário já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token,
      message: 'Usuário cadastrado com sucesso'
    };
  }

  async loginUser(email, password) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token,
      message: 'Login realizado com sucesso'
    };
  }

  async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  async setupUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const existingMonth = await prisma.mes.findFirst({
      where: {
        userId: user.id,
        ano: currentYear,
        mes: currentMonth
      }
    });

    let mesExemplo = existingMonth;

    if (!existingMonth) {
      mesExemplo = await prisma.mes.create({
        data: {
          ano: currentYear,
          mes: currentMonth,
          userId: user.id,
          ativo: true,
          quinzenas: {
            create: [
              { 
                tipo: 'primeira',
                saldoAnterior: 0
              },
              { 
                tipo: 'segunda',
                saldoAnterior: 0
              }
            ]
          }
        },
        include: {
          quinzenas: true
        }
      });
    }

    return {
      message: 'Setup completo! Mês exemplo criado/verificado.',
      mesExemplo: mesExemplo ? {
        id: mesExemplo.id,
        periodo: `${mesExemplo.mes}/${mesExemplo.ano}`
      } : null
    };
  }

  async getConfiguracoes(userId) {
    return await prisma.configuracao.findMany({
      where: { userId },
      select: {
        chave: true,
        valor: true,
        descricao: true
      }
    });
  }

  async updateConfiguracao(userId, chave, valor) {
    const configExistente = await prisma.configuracao.findFirst({
      where: {
        userId,
        chave
      }
    });

    if (!configExistente) {
      throw new Error('Configuração não encontrada');
    }

    return await prisma.configuracao.update({
      where: { id: configExistente.id },
      data: { valor },
      select: {
        chave: true,
        valor: true,
        descricao: true
      }
    });
  }

  async createConfiguracao(userId, chave, valor, descricao) {
    const configExistente = await prisma.configuracao.findFirst({
      where: {
        userId,
        chave
      }
    });

    if (configExistente) {
      throw new Error('Configuração já existe');
    }

    return await prisma.configuracao.create({
      data: {
        chave,
        valor,
        descricao,
        userId
      },
      select: {
        chave: true,
        valor: true,
        descricao: true
      }
    });
  }

  async deleteConfiguracao(userId, chave) {
    const configExistente = await prisma.configuracao.findFirst({
      where: {
        userId,
        chave
      }
    });

    if (!configExistente) {
      throw new Error('Configuração não encontrada');
    }

    await prisma.configuracao.delete({
      where: { id: configExistente.id }
    });
  }

  async getCategoriasPadrao(userId) {
    const config = await prisma.configuracao.findFirst({
      where: {
        userId,
        chave: 'categorias_padrao'
      }
    });

    if (!config) {
      return ['casa', 'alimentacao', 'transporte', 'saude', 'educacao', 'lazer', 'outros'];
    }

    return config.valor.split(',');
  }
}