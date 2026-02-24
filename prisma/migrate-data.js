/**
 * Script de migração: Quinzena → Modelo Mensal
 * 
 * INSTRUÇÕES:
 * 1. Antes de rodar, garanta que o schema.prisma AINDA tem os campos antigos (quinzenaId)
 *    E os novos campos (mesId) como nullable.
 * 2. Rode: node prisma/migrate-data.js
 * 3. Após confirmar sucesso, atualize o schema para remover quinzena e rode prisma db push
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  console.log('🚀 Iniciando migração de dados: Quinzena → Mensal\n');

  // 1. Migrar saldoAnterior da 1ª quinzena para o Mês
  console.log('📋 Etapa 1: Migrando saldoAnterior da 1ª quinzena para o Mês...');
  const meses = await prisma.mes.findMany({
    include: {
      quinzenas: true
    }
  });

  for (const mes of meses) {
    const primeiraQuinzena = mes.quinzenas.find(q => q.tipo === 'primeira');
    const saldoAnterior = primeiraQuinzena ? primeiraQuinzena.saldoAnterior : 0;

    await prisma.mes.update({
      where: { id: mes.id },
      data: { saldoAnterior }
    });

    console.log(`  ✅ Mês ${mes.mes}/${mes.ano} → saldoAnterior: ${saldoAnterior}`);
  }

  // 2. Migrar Receitas: quinzenaId → mesId
  console.log('\n📋 Etapa 2: Migrando Receitas...');
  const receitas = await prisma.receita.findMany({
    include: { quinzena: true }
  });

  for (const receita of receitas) {
    await prisma.receita.update({
      where: { id: receita.id },
      data: { mesId: receita.quinzena.mesId }
    });
  }
  console.log(`  ✅ ${receitas.length} receitas migradas`);

  // 3. Migrar Despesas: quinzenaId → mesId
  console.log('\n📋 Etapa 3: Migrando Despesas...');
  const despesas = await prisma.despesa.findMany({
    include: { quinzena: true }
  });

  for (const despesa of despesas) {
    await prisma.despesa.update({
      where: { id: despesa.id },
      data: { mesId: despesa.quinzena.mesId }
    });
  }
  console.log(`  ✅ ${despesas.length} despesas migradas`);

  // 4. Migrar Parcelas: quinzenaId → mesId
  console.log('\n📋 Etapa 4: Migrando Parcelas...');
  const parcelas = await prisma.parcela.findMany({
    include: { quinzena: true }
  });

  for (const parcela of parcelas) {
    await prisma.parcela.update({
      where: { id: parcela.id },
      data: { mesId: parcela.quinzena.mesId }
    });
  }
  console.log(`  ✅ ${parcelas.length} parcelas migradas`);

  // 5. Validação
  console.log('\n📋 Etapa 5: Validando migração...');
  const receitasSemMes = await prisma.receita.count({ where: { mesId: null } });
  const despesasSemMes = await prisma.despesa.count({ where: { mesId: null } });
  const parcelasSemMes = await prisma.parcela.count({ where: { mesId: null } });

  if (receitasSemMes > 0 || despesasSemMes > 0 || parcelasSemMes > 0) {
    console.error('❌ ERRO: Ainda existem registros sem mesId!');
    console.error(`  Receitas sem mesId: ${receitasSemMes}`);
    console.error(`  Despesas sem mesId: ${despesasSemMes}`);
    console.error(`  Parcelas sem mesId: ${parcelasSemMes}`);
    process.exit(1);
  }

  console.log('  ✅ Todos os registros possuem mesId');

  console.log('\n✅ Migração concluída com sucesso!');
  console.log('\n📌 Próximos passos:');
  console.log('  1. Atualize o schema.prisma para remover Quinzena');
  console.log('  2. Rode: npx prisma db push');
  console.log('  3. Rode: npx prisma generate');
}

migrate()
  .catch((error) => {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
