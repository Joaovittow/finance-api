import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DespesaService {
  async createDespesaComParcelas(data) {
    const { 
      quinzenaId, 
      descricao, 
      valorTotal, 
      parcelas, 
      categoria, 
      observacao,
      ehParcelada,
      dataPrimeiraParcela
    } = data;

    const quinzena = await prisma.quinzena.findUnique({
      where: { id: quinzenaId },
      include: { mes: true }
    });

    if (!quinzena) {
      throw new Error('Quinzena não encontrada');
    }

    const despesa = await prisma.despesa.create({
      data: {
        descricao,
        valorTotal,
        parcelas,
        categoria,
        observacao,
        ehParcelada: ehParcelada || false,
        dataPrimeiraParcela: ehParcelada ? new Date(dataPrimeiraParcela) : null,
        quinzenaId
      }
    });

    const valorParcela = valorTotal / parcelas;
    const parcelasData = [];

for (let i = 1; i <= parcelas; i++) {
  let dataVencimento;

  console.log(`\n📦 Processando parcela ${i} de ${parcelas}`);
  
  if (ehParcelada && dataPrimeiraParcela) {
    console.log('🔄 Despesa parcelada, dataPrimeiraParcela:', dataPrimeiraParcela);
    dataVencimento = this.corrigirTimezone(dataPrimeiraParcela);
    
    if (i > 1) {
      console.log(`📅 Adicionando ${i - 1} meses à data`);
      const mesOriginal = dataVencimento.getMonth();
      dataVencimento.setMonth(dataVencimento.getMonth() + (i - 1));
      console.log(`📅 Mês original: ${mesOriginal + 1}, Mês após adição: ${dataVencimento.getMonth() + 1}`);
    }
  } else {
    console.log('💳 Despesa à vista, data:', data.data || dataPrimeiraParcela);
    dataVencimento = this.corrigirTimezone(data.data || dataPrimeiraParcela);
  }

  console.log(`🎯 Data de vencimento final da parcela ${i}:`, dataVencimento.toLocaleDateString('pt-BR'));

  parcelasData.push({
    numeroParcela: i,
    valorParcela,
    dataVencimento,
    despesaId: despesa.id,
    quinzenaId: i === 1 ? quinzenaId : await this.encontrarQuinzenaParaParcela(dataVencimento)
  });
}

    await prisma.parcela.createMany({
      data: parcelasData
    });

    const despesaCompleta = await prisma.despesa.findUnique({
      where: { id: despesa.id },
      include: {
        parcelasRelacao: {
          orderBy: { numeroParcela: 'asc' },
          include: {
            quinzena: true
          }
        },
        quinzena: {
          include: {
            mes: true
          }
        }
      }
    });

    return despesaCompleta;
  }

// Método para corrigir problema de timezone
corrigirTimezone(dataString) {
  console.log('🔧 Data recebida no corrigirTimezone:', dataString, typeof dataString);
  
  let ano, mes, dia;

  if (dataString instanceof Date) {
    ano = dataString.getFullYear();
    mes = dataString.getMonth();
    dia = dataString.getDate();
    console.log('📅 De Date object - ano:', ano, 'mes:', mes, 'dia:', dia);
  } else {
    // Para strings YYYY-MM-DD
    [ano, mes, dia] = dataString.split('-').map(Number);
    mes = mes - 1; // Ajuste para JavaScript (0-11)
    console.log('📅 De string - ano:', ano, 'mes:', mes + 1, 'dia:', dia);
  }

  // Força a data exata, ignorando completamente timezone
  const dataCorrigida = new Date(ano, mes, dia);
  
  console.log('✅ Data corrigida final:', dataCorrigida);
  console.log('📋 Data local (pt-BR):', dataCorrigida.toLocaleDateString('pt-BR'));
  console.log('🌐 Data ISO:', dataCorrigida.toISOString());
  
  return dataCorrigida;
}

  async encontrarQuinzenaParaParcela(dataVencimento) {
    const dia = dataVencimento.getDate();
    const mes = dataVencimento.getMonth() + 1;
    const ano = dataVencimento.getFullYear();
    
    const tipoQuinzena = dia <= 15 ? 'primeira' : 'segunda';

    const quinzena = await prisma.quinzena.findFirst({
      where: {
        mes: {
          ano,
          mes
        },
        tipo: tipoQuinzena
      }
    });

    if (quinzena) {
      return quinzena.id;
    }

    const user = await prisma.user.findFirst();

    const novoMes = await prisma.mes.create({
      data: {
        ano,
        mes,
        userId: user.id,
        ativo: false,
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

    const quinzenaEncontrada = novoMes.quinzenas.find(q => q.tipo === tipoQuinzena);
    return quinzenaEncontrada.id;
  }

async updateDespesa(id, data) {
  const despesaExistente = await prisma.despesa.findUnique({
    where: { id }
  });

  if (!despesaExistente) {
    throw new Error('Despesa não encontrada');
  }

  const camposPermitidos = ['descricao', 'valorTotal', 'categoria', 'observacao'];
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
    const valorParcela = dadosAtualizacao.valorTotal;
    
    await prisma.parcela.updateMany({
      where: { despesaId: id },
      data: { valorParcela }
    });
  }

  if (Object.keys(dadosAtualizacao).length === 0) {
    return await prisma.despesa.findUnique({
      where: { id },
      include: {
        parcelasRelacao: {
          orderBy: { numeroParcela: 'asc' }
        },
        quinzena: true
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
      quinzena: true
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

  async getDespesasPorQuinzena(quinzenaId) {
    return await prisma.despesa.findMany({
      where: { quinzenaId },
      include: {
        parcelasRelacao: {
          orderBy: { numeroParcela: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}