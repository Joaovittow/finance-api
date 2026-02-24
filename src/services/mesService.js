// services/mesService.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const hojeYMDLocal = () => new Date().toLocaleDateString('sv-SE');
const receitaContaNoTotal = (rec, hojeYMD) => !rec.dataDeposito || rec.dataDeposito <= hojeYMD;

export class MesService {
  async getMeses(userId) {
    const meses = await prisma.mes.findMany({
      where: { userId },
      include: {
        receitas: true,
        parcelas: {
          include: {
            despesa: true
          }
        }
      },
      orderBy: [
        { ano: 'desc' },
        { mes: 'desc' }
      ]
    });

    // Adicionar campos calculados
    return meses.map(mes => {
      const hojeYMD = hojeYMDLocal();
      const totalReceitas = mes.receitas
        .filter(rec => receitaContaNoTotal(rec, hojeYMD))
        .reduce((sum, rec) => sum + rec.valor, 0);
      const totalDespesas = mes.parcelas
        .filter(p => p.pago)
        .reduce((sum, parc) => sum + (parc.valorPago || parc.valorParcela), 0);
      const saldo = totalReceitas - totalDespesas;

      return {
        ...mes,
        totalReceitas,
        totalDespesas,
        saldo
      };
    });
  }

  async getMesById(id, userId) {
    const mes = await prisma.mes.findFirst({
      where: { 
        id,
        userId 
      },
      include: {
        receitas: true,
        parcelas: {
          include: {
            despesa: true
          }
        }
      }
    });

    if (!mes) {
      throw new Error('Mês não encontrado');
    }

    // Calcular saldoAnterior dinamicamente
    const saldoAnterior = await this.calcularSaldoAnterior(mes.ano, mes.mes, userId);
    
    // Atualizar saldoAnterior se mudou
    if (saldoAnterior !== mes.saldoAnterior) {
      await prisma.mes.update({
        where: { id },
        data: { saldoAnterior }
      });
      mes.saldoAnterior = saldoAnterior;
    }

    const hojeYMD = hojeYMDLocal();
    const totalReceitas = mes.receitas
      .filter(rec => receitaContaNoTotal(rec, hojeYMD))
      .reduce((sum, rec) => sum + rec.valor, 0);
    const totalDespesas = mes.parcelas
      .filter(p => p.pago)
      .reduce((sum, parc) => sum + (parc.valorPago || parc.valorParcela), 0);
    const saldo = totalReceitas - totalDespesas;

    return {
      ...mes,
      totalReceitas,
      totalDespesas,
      saldo
    };
  }

  async calcularSaldoAnterior(ano, mes, userId) {
    // Encontrar o mês imediatamente anterior
    let mesAnterior, anoAnterior;
    if (mes === 1) {
      mesAnterior = 12;
      anoAnterior = ano - 1;
    } else {
      mesAnterior = mes - 1;
      anoAnterior = ano;
    }

    const mesAnteriorRecord = await prisma.mes.findFirst({
      where: {
        ano: anoAnterior,
        mes: mesAnterior,
        userId
      },
      include: {
        receitas: true,
        parcelas: true
      }
    });

    if (!mesAnteriorRecord) {
      return 0;
    }

    const hojeYMD = hojeYMDLocal();
    const totalReceitas = mesAnteriorRecord.receitas
      .filter(rec => receitaContaNoTotal(rec, hojeYMD))
      .reduce((sum, rec) => sum + rec.valor, 0);
    const totalDespesasPagas = mesAnteriorRecord.parcelas
      .filter(p => p.pago)
      .reduce((sum, parc) => sum + (parc.valorPago || parc.valorParcela), 0);

    return totalReceitas - totalDespesasPagas;
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
    
    // Calcular saldoAnterior automaticamente
    const saldoAnterior = await this.calcularSaldoAnterior(proximoAno, proximoMes, userId);

    const novoMes = await prisma.mes.create({
      data: {
        ano: proximoAno,
        mes: proximoMes,
        userId: userId,
        ativo: true,
        saldoAnterior
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
      data
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

  // Método para obter ou criar o mês atual
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
        }
      });
      
      if (mesExistente) {
        return await this.getMesById(mesExistente.id, userId);
      }
      
      throw error;
    }
  }
}