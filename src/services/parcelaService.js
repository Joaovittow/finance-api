import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ParcelaService {
  async getParcelasPorMes(mesId) {
    return await prisma.parcela.findMany({
      where: { mesId },
      include: {
        despesa: true,
        mes: true
      },
      orderBy: { dataVencimento: 'asc' }
    });
  }

  async marcarComoPaga(id, valorPago = null) {
    // Verificar se a parcela existe
    const parcelaExistente = await prisma.parcela.findUnique({
      where: { id },
      include: {
        despesa: true,
        mes: true
      }
    });

    if (!parcelaExistente) {
      throw new Error('Parcela não encontrada');
    }

    if (parcelaExistente.pago) {
      throw new Error('Parcela já está paga');
    }

    return await prisma.parcela.update({
      where: { id },
      data: {
        pago: true,
        valorPago: valorPago ? parseFloat(valorPago) : parcelaExistente.valorParcela,
        dataPagamento: new Date()
      },
      include: {
        despesa: true,
        mes: true
      }
    });
  }

  async updateParcela(id, data) {
    // Verificar se a parcela existe
    const parcelaExistente = await prisma.parcela.findUnique({
      where: { id }
    });

    if (!parcelaExistente) {
      throw new Error('Parcela não encontrada');
    }

    // Validar dados
    if (data.valorParcela && data.valorParcela <= 0) {
      throw new Error('Valor da parcela deve ser maior que zero');
    }

    if (data.dataVencimento && new Date(data.dataVencimento) < new Date()) {
      throw new Error('Data de vencimento não pode ser no passado');
    }

    return await prisma.parcela.update({
      where: { id },
      data: {
        ...data,
        valorParcela: data.valorParcela ? parseFloat(data.valorParcela) : undefined,
        dataVencimento: data.dataVencimento ? new Date(data.dataVencimento) : undefined
      },
      include: {
        despesa: true,
        mes: true
      }
    });
  }

  async getParcelasPendentes() {
    return await prisma.parcela.findMany({
      where: {
        pago: false,
        dataVencimento: {
          lte: new Date(new Date().setDate(new Date().getDate() + 7)) // Próximos 7 dias
        }
      },
      include: {
        despesa: true,
        mes: true
      },
      orderBy: { dataVencimento: 'asc' }
    });
  }

  async getParcelasPorDespesa(despesaId) {
    return await prisma.parcela.findMany({
      where: { despesaId },
      include: {
        mes: true
      },
      orderBy: { numeroParcela: 'asc' }
    });
  }
}