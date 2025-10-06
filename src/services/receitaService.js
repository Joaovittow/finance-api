import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReceitaService {
  async createReceita(data) {
    const { quinzenaId, descricao, valor, tipo } = data;

    // Verificar se a quinzena existe
    const quinzena = await prisma.quinzena.findUnique({
      where: { id: quinzenaId }
    });

    if (!quinzena) {
      throw new Error('Quinzena não encontrada');
    }

    return await prisma.receita.create({
      data: {
        descricao,
        valor,
        tipo,
        quinzenaId
      }
    });
  }

async updateReceita(id, data) {
  const receitaExistente = await prisma.receita.findUnique({
    where: { id }
  });

  if (!receitaExistente) {
    throw new Error('Receita não encontrada');
  }

  const camposPermitidos = ['descricao', 'valor', 'tipo'];
  const dadosAtualizacao = {};
  
  camposPermitidos.forEach(campo => {
    if (data[campo] !== undefined && data[campo] !== receitaExistente[campo]) {
      if (campo === 'valor') {
        dadosAtualizacao[campo] = parseFloat(data[campo]);
      } else {
        dadosAtualizacao[campo] = data[campo];
      }
    }
  });

  if (Object.keys(dadosAtualizacao).length === 0) {
    return await prisma.receita.findUnique({
      where: { id },
      include: {
        quinzena: true
      }
    });
  }

  return await prisma.receita.update({
    where: { id },
    data: dadosAtualizacao,
    include: {
      quinzena: true
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

  async getReceitasPorQuinzena(quinzenaId) {
    return await prisma.receita.findMany({
      where: { quinzenaId },
      orderBy: { createdAt: 'desc' }
    });
  }
}