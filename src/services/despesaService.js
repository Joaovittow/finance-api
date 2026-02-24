import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DespesaService {
  async createDespesaComParcelas(data) {
    const { 
      mesId, 
      descricao, 
      valorTotal, 
      parcelas, 
      categoria, 
      observacao,
      ehParcelada,
      dataPrimeiraParcela
    } = data;

    const mes = await prisma.mes.findUnique({
      where: { id: mesId }
    });

    if (!mes) {
      throw new Error('Mês não encontrado');
    }

    const despesa = await prisma.despesa.create({
      data: {
        descricao,
        valorTotal,
        parcelas,
        categoria,
        observacao,
        ehParcelada: ehParcelada || false,
        dataPrimeiraParcela: ehParcelada ? dataPrimeiraParcela.split('T')[0] : null,
        mesId
      }
    });

    const valorParcela = valorTotal / parcelas;
    const parcelasData = [];

    for (let i = 1; i <= parcelas; i++) {
      let dataVencimento;

      if (ehParcelada && dataPrimeiraParcela) {
        const [ano, mesNum, dia] = dataPrimeiraParcela.split('-').map(Number);
        const dataBase = new Date(ano, mesNum - 1, dia);
        
        if (i > 1) {
          dataBase.setMonth(dataBase.getMonth() + (i - 1));
        }
        
        dataVencimento = this.formatarDataParaString(dataBase);
      } else {
        dataVencimento = (data.data || dataPrimeiraParcela).split('T')[0];
      }

      parcelasData.push({
        numeroParcela: i,
        valorParcela,
        dataVencimento,
        despesaId: despesa.id,
        mesId: i === 1 ? mesId : await this.encontrarMesParaParcela(dataVencimento, mes.userId)
      });
    }

    await prisma.parcela.createMany({
      data: parcelasData
    });

    const despesaCompleta = await prisma.despesa.findUnique({
      where: { id: despesa.id },
      include: {
        parcelasRelacao: {
          orderBy: { numeroParcela: 'asc' }
        },
        mes: true
      }
    });

    return despesaCompleta;
  }

  formatarDataParaString(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  corrigirTimezone(dataString) {
    let ano, mes, dia;

    if (dataString instanceof Date) {
      ano = dataString.getFullYear();
      mes = dataString.getMonth();
      dia = dataString.getDate();
    } else {
      [ano, mes, dia] = dataString.split('-').map(Number);
      mes = mes - 1;
    }

    const dataCorrigida = new Date(ano, mes, dia);
    
    return dataCorrigida;
  }

  async encontrarMesParaParcela(dataVencimentoString, userId) {
    const [ano, mesNum] = dataVencimentoString.split('-').map(Number);

    // Buscar mês existente para esse ano/mês
    const mesExistente = await prisma.mes.findFirst({
      where: {
        ano,
        mes: mesNum,
        userId
      }
    });

    if (mesExistente) {
      return mesExistente.id;
    }

    // Criar mês automaticamente se não existir
    const novoMes = await prisma.mes.create({
      data: {
        ano,
        mes: mesNum,
        userId,
        ativo: false
      }
    });

    return novoMes.id;
  }

  async updateDespesa(id, data) {
    const despesaExistente = await prisma.despesa.findUnique({
      where: { id },
      include: {
        parcelasRelacao: {
          orderBy: { numeroParcela: 'asc' }
        },
        mes: true
      }
    });

    if (!despesaExistente) {
      throw new Error('Despesa não encontrada');
    }

    const camposPermitidos = ['descricao', 'valorTotal', 'categoria', 'observacao', 'dataPrimeiraParcela'];
    const dadosAtualizacao = {};
    
    camposPermitidos.forEach(campo => {
      if (data[campo] !== undefined && data[campo] !== despesaExistente[campo]) {
        if (campo === 'valorTotal') {
          dadosAtualizacao[campo] = parseFloat(data[campo]);
        } else {
          dadosAtualizacao[campo] = data[campo];
        }
      }
    });

    if (dadosAtualizacao.valorTotal !== undefined) {
      const valorParcela = dadosAtualizacao.valorTotal / despesaExistente.parcelas;
      
      await prisma.parcela.updateMany({
        where: { despesaId: id },
        data: { valorParcela }
      });
    }

    if (dadosAtualizacao.dataPrimeiraParcela !== undefined) {
      await prisma.parcela.deleteMany({
        where: { despesaId: id }
      });

      const valorParcela = (dadosAtualizacao.valorTotal || despesaExistente.valorTotal) / despesaExistente.parcelas;
      const parcelasData = [];

      for (let i = 1; i <= despesaExistente.parcelas; i++) {
        let dataVencimento;

        if (despesaExistente.ehParcelada) {
          const [ano, mesNum, dia] = dadosAtualizacao.dataPrimeiraParcela.split('-').map(Number);
          const dataBase = new Date(ano, mesNum - 1, dia);
          
          if (i > 1) {
            dataBase.setMonth(dataBase.getMonth() + (i - 1));
          }
          
          dataVencimento = this.formatarDataParaString(dataBase);
        } else {
          dataVencimento = dadosAtualizacao.dataPrimeiraParcela.split('T')[0];
        }

        const mesId = i === 1 ? despesaExistente.mesId : await this.encontrarMesParaParcela(dataVencimento, despesaExistente.mes.userId);

        parcelasData.push({
          numeroParcela: i,
          valorParcela,
          dataVencimento,
          despesaId: id,
          mesId
        });
      }

      await prisma.parcela.createMany({
        data: parcelasData
      });
    }

    if (Object.keys(dadosAtualizacao).length === 0) {
      return await prisma.despesa.findUnique({
        where: { id },
        include: {
          parcelasRelacao: {
            orderBy: { numeroParcela: 'asc' }
          },
          mes: true
        }
      });
    }

    return await prisma.despesa.update({
      where: { id },
      data: dadosAtualizacao,
      include: {
        parcelasRelacao: {
          orderBy: { numeroParcela: 'asc' }
        },
        mes: true
      }
    });
  }

  async deleteDespesa(id) {
    const despesaExistente = await prisma.despesa.findUnique({
      where: { id }
    });

    if (!despesaExistente) {
      throw new Error('Despesa não encontrada');
    }

    await prisma.parcela.deleteMany({
      where: { despesaId: id }
    });

    return await prisma.despesa.delete({
      where: { id }
    });
  }
}