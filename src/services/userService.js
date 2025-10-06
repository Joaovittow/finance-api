import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
  async setupUser() {
    // Criar usuário de teste
    const user = await prisma.user.upsert({
      where: { email: 'teste@finance.com' },
      update: {},
      create: {
        email: 'teste@finance.com',
        name: 'Usuário Teste',
        password: '123456' // Em produção, usar bcrypt
      }
    });

    // Criar entradas fixas de configuração
    const configs = await prisma.configuracao.createMany({
      data: [
        {
          chave: 'adiantamento_joao',
          valor: '527',
          descricao: 'Adiantamento fixo do João (Dia 15)',
          userId: user.id
        },
        {
          chave: 'salario_joao',
          valor: '1200', 
          descricao: 'Salário fixo do João (Dia 30)',
          userId: user.id
        },
        {
          chave: 'salario_raquel',
          valor: '594',
          descricao: 'Salário fixo da Raquel (Dia 30)',
          userId: user.id
        },
        {
          chave: 'categorias_padrao',
          valor: 'casa,alimentacao,transporte,saude,educacao,lazer,outros',
          descricao: 'Categorias padrão para despesas',
          userId: user.id
        }
      ]
    });

    // Criar um mês de exemplo
    const mesExemplo = await prisma.mes.create({
      data: {
        ano: new Date().getFullYear(),
        mes: new Date().getMonth() + 1,
        userId: user.id,
        ativo: true,
        quinzenas: {
          create: [
            { 
              tipo: 'primeira',
              saldoAnterior: 0,
              receitas: {
                create: [
                  {
                    descricao: 'Adiantamento João',
                    valor: 527,
                    tipo: 'fixa'
                  },
                  {
                    descricao: 'Ifood Extra',
                    valor: 163.90,
                    tipo: 'variavel'
                  }
                ]
              }
            },
            { 
              tipo: 'segunda',
              saldoAnterior: 0,
              receitas: {
                create: [
                  {
                    descricao: 'Salário João',
                    valor: 1200,
                    tipo: 'fixa'
                  },
                  {
                    descricao: 'Salário Raquel', 
                    valor: 594,
                    tipo: 'fixa'
                  }
                ]
              }
            }
          ]
        }
      },
      include: {
        quinzenas: {
          include: {
            receitas: true
          }
        }
      }
    });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      configs: {
        count: configs.count,
        messages: 'Configurações padrão criadas'
      },
      mesExemplo: {
        id: mesExemplo.id,
        periodo: `${mesExemplo.mes}/${mesExemplo.ano}`
      },
      message: 'Setup completo! Usuário, configurações e mês exemplo criados.'
    };
  }

  async getUserTest() {
    const user = await prisma.user.findUnique({
      where: { email: 'teste@finance.com' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('Usuário de teste não encontrado. Execute /api/users/setup primeiro.');
    }

    return user;
  }

  async getConfiguracoes() {
    const user = await this.getUserTest();
    
    return await prisma.configuracao.findMany({
      where: { userId: user.id },
      select: {
        chave: true,
        valor: true,
        descricao: true
      }
    });
  }

  async updateConfiguracao(chave, valor) {
    const user = await this.getUserTest();

    const configExistente = await prisma.configuracao.findFirst({
      where: {
        userId: user.id,
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

  async getCategoriasPadrao() {
    const config = await prisma.configuracao.findFirst({
      where: {
        chave: 'categorias_padrao'
      }
    });

    if (!config) {
      return ['casa', 'alimentacao', 'transporte', 'saude', 'educacao', 'lazer', 'outros'];
    }

    return config.valor.split(',');
  }
}