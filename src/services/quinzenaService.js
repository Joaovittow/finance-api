import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class QuinzenaService {
  async getQuinzenaById(id) {
    const quinzena = await prisma.quinzena.findUnique({
      where: { id },
      include: {
        receitas: true,
        parcelas: {
          include: {
            despesa: true
          }
        },
        mes: true
      }
    });

    if (!quinzena) {
      throw new Error('Quinzena não encontrada');
    }

    const calculos = await this.calcularSaldoDisponivel(quinzena);

    return {
      ...quinzena,
      calculos
    };
  }

  async getCalculosQuinzena(id) {
    const quinzena = await prisma.quinzena.findUnique({
      where: { id },
      include: {
        receitas: true,
        parcelas: {
          include: {
            despesa: true
          }
        }
      }
    });

    if (!quinzena) {
      throw new Error('Quinzena não encontrada');
    }

    return await this.calcularSaldoDisponivel(quinzena);
  }

  async calcularSaldoDisponivel(quinzena) {
    const totalReceitas = quinzena.receitas.reduce((sum, rec) => sum + rec.valor, 0);
    const totalDespesasPagas = quinzena.parcelas
      .filter(p => p.pago)
      .reduce((sum, parc) => sum + (parc.valorPago || parc.valorParcela), 0);
    
    const saldoDisponivel = quinzena.saldoAnterior + totalReceitas - totalDespesasPagas;

    return {
      totalReceitas,
      totalDespesasPagas,
      saldoDisponivel
    };
  }

  async updateQuinzena(id, data) {
    return await prisma.quinzena.update({
      where: { id },
      data,
      include: {
        receitas: true,
        parcelas: {
          include: {
            despesa: true
          }
        }
      }
    });
  }
}