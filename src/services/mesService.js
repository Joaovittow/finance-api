import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MesService {
  async getMeses() {
    const user = await this.getUserTest();
    
    return await prisma.mes.findMany({
      where: { userId: user.id },
      include: {
        quinzenas: {
          include: {
            receitas: true,
            parcelas: {
              include: {
                despesa: true
              }
            }
          }
        }
      },
      orderBy: [
        { ano: 'desc' },
        { mes: 'desc' }
      ]
    });
  }

  async getMesById(id) {
    const mes = await prisma.mes.findUnique({
      where: { id },
      include: {
        quinzenas: {
          include: {
            receitas: true,
            parcelas: {
              include: {
                despesa: true
              }
            }
          }
        }
      }
    });

    if (!mes) {
      throw new Error('Mês não encontrado');
    }

    return mes;
  }

  async createMes(ano, mes) {
    const user = await this.getUserTest();

    // Verificar se mês já existe de forma mais flexível
    const mesExistente = await prisma.mes.findFirst({
      where: {
        ano,
        mes,
        userId: user.id
      }
    });

    if (mesExistente) {
      // Retornar o mês existente em vez de dar erro
      return await this.getMesById(mesExistente.id);
    }

    // Criar o próximo mês disponível
    const { proximoAno, proximoMes } = await this.encontrarProximoMesDisponivel(ano, mes);
    
    const novoMes = await prisma.mes.create({
      data: {
        ano: proximoAno,
        mes: proximoMes,
        userId: user.id,
        ativo: true,
        quinzenas: {
          create: [
            { tipo: 'primeira' },
            { tipo: 'segunda' }
          ]
        }
      },
      include: {
        quinzenas: true
      }
    });

    return novoMes;
  }

  async encontrarProximoMesDisponivel(anoSolicitado, mesSolicitado) {
    const user = await this.getUserTest();
    
    // Buscar todos os meses existentes do usuário
    const mesesExistentes = await prisma.mes.findMany({
      where: { userId: user.id },
      select: { ano: true, mes: true }
    });

    let anoAtual = anoSolicitado;
    let mesAtual = mesSolicitado;
    
    // Verificar se o mês solicitado já existe
    const mesJaExiste = mesesExistentes.some(
      m => m.ano === anoAtual && m.mes === mesAtual
    );

    if (!mesJaExiste) {
      return { proximoAno: anoAtual, proximoMes: mesAtual };
    }

    // Encontrar o próximo mês disponível
    for (let i = 1; i <= 24; i++) { // Buscar até 2 anos à frente
      const dataFutura = new Date(anoAtual, mesAtual - 1 + i, 1);
      const anoFuturo = dataFutura.getFullYear();
      const mesFuturo = dataFutura.getMonth() + 1;

      const mesExiste = mesesExistentes.some(
        m => m.ano === anoFuturo && m.mes === mesFuturo
      );

      if (!mesExiste) {
        return { proximoAno: anoFuturo, proximoMes: mesFuturo };
      }
    }

    // Se todos os meses estão ocupados, usar o próximo lógico
    const dataFutura = new Date(anoAtual, mesAtual - 1 + 1, 1);
    return {
      proximoAno: dataFutura.getFullYear(),
      proximoMes: dataFutura.getMonth() + 1
    };
  }

  async updateMes(id, data) {
    return await prisma.mes.update({
      where: { id },
      data,
      include: {
        quinzenas: true
      }
    });
  }

  async deleteMes(id) {
    return await prisma.mes.delete({
      where: { id }
    });
  }

  async getUserTest() {
    const user = await prisma.user.findUnique({
      where: { email: 'teste@finance.com' }
    });

    if (!user) {
      throw new Error('Usuário não encontrado. Execute /api/users/setup primeiro.');
    }

    return user;
  }

  // Novo método para obter ou criar o mês atual
  async getOuCriarMesAtual() {
    const anoAtual = new Date().getFullYear();
    const mesAtual = new Date().getMonth() + 1;
    
    try {
      return await this.createMes(anoAtual, mesAtual);
    } catch (error) {
      // Se já existe, retornar o existente
      const user = await this.getUserTest();
      const mesExistente = await prisma.mes.findFirst({
        where: {
          ano: anoAtual,
          mes: mesAtual,
          userId: user.id
        },
        include: {
          quinzenas: true
        }
      });
      
      if (mesExistente) {
        return mesExistente;
      }
      
      throw error;
    }
  }
}