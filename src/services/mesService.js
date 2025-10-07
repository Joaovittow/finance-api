// services/mesService.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MesService {
  async getMeses(userId) {
    return await prisma.mes.findMany({
      where: { userId },
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

  async getMesById(id, userId) {
    const mes = await prisma.mes.findFirst({
      where: { 
        id,
        userId 
      },
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

  async createMes(ano, mes, userId) {
    // Verificar se mês já existe
    const mesExistente = await prisma.mes.findFirst({
      where: {
        ano,
        mes,
        userId
      }
    });

    if (mesExistente) {
      // Retornar o mês existente em vez de dar erro
      return await this.getMesById(mesExistente.id, userId);
    }

    // Criar o próximo mês disponível
    const { proximoAno, proximoMes } = await this.encontrarProximoMesDisponivel(ano, mes, userId);
    
    const novoMes = await prisma.mes.create({
      data: {
        ano: proximoAno,
        mes: proximoMes,
        userId: userId,
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

  async encontrarProximoMesDisponivel(anoSolicitado, mesSolicitado, userId) {
    // Buscar todos os meses existentes do usuário
    const mesesExistentes = await prisma.mes.findMany({
      where: { userId },
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

  async updateMes(id, data, userId) {
    // Verificar se o mês pertence ao usuário
    const mesExistente = await prisma.mes.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!mesExistente) {
      throw new Error('Mês não encontrado');
    }

    return await prisma.mes.update({
      where: { id },
      data,
      include: {
        quinzenas: true
      }
    });
  }

  async deleteMes(id, userId) {
    // Verificar se o mês pertence ao usuário
    const mesExistente = await prisma.mes.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!mesExistente) {
      throw new Error('Mês não encontrado');
    }

    return await prisma.mes.delete({
      where: { id }
    });
  }

  // Novo método para obter ou criar o mês atual
  async getOuCriarMesAtual(userId) {
    const anoAtual = new Date().getFullYear();
    const mesAtual = new Date().getMonth() + 1;
    
    try {
      return await this.createMes(anoAtual, mesAtual, userId);
    } catch (error) {
      // Se já existe, retornar o existente
      const mesExistente = await prisma.mes.findFirst({
        where: {
          ano: anoAtual,
          mes: mesAtual,
          userId
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