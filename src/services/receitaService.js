import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReceitaService {
  async createReceita(data) {
    const { mesId, descricao, valor, tipo, dataDeposito } = data;

    // Verificar se o mês existe
    const mes = await prisma.mes.findUnique({
      where: { id: mesId }
    });

    if (!mes) {
      throw new Error('Mês não encontrado');
    }

    const dataCriacao = {
      descricao,
      valor,
      dataDeposito,
      mesId
    };

    // Só envia tipo se definido; caso contrário, Prisma usa o default do schema
    if (typeof tipo !== 'undefined') {
      dataCriacao.tipo = tipo;
    }

    return await prisma.receita.create({
      data: dataCriacao
    });
  }

  async updateReceita(id, data) {
    const receitaExistente = await prisma.receita.findUnique({
      where: { id }
    });

    if (!receitaExistente) {
      throw new Error('Receita não encontrada');
    }

    const camposPermitidos = ['descricao', 'valor', 'tipo', 'dataDeposito'];
    const dadosAtualizacao = {};
    
    camposPermitidos.forEach(campo => {
      if (data[campo] !== undefined && data[campo] !== receitaExistente[campo]) {
        if (campo === 'valor') {
          dadosAtualizacao[campo] = parseFloat(data[campo]);
        } else if (campo === 'dataDeposito') {
          dadosAtualizacao[campo] = data[campo];
        } else {
          dadosAtualizacao[campo] = data[campo];
        }
      }
    });

    if (Object.keys(dadosAtualizacao).length === 0) {
      return await prisma.receita.findUnique({
        where: { id },
        include: {
          mes: true
        }
      });
    }

    return await prisma.receita.update({
      where: { id },
      data: dadosAtualizacao,
      include: {
        mes: true
      }
    });
  }

  async deleteReceita(id) {
    const receitaExistente = await prisma.receita.findUnique({
      where: { id }
    });

    if (!receitaExistente) {
      throw new Error('Receita não encontrada');
    }

    return await prisma.receita.delete({
      where: { id }
    });
  }
}