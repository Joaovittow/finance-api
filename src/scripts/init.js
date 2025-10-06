import { UserService } from '../services/userService.js';

async function initializeDatabase() {
  try {
    console.log('🌱 Iniciando setup do banco de dados...');
    
    const userService = new UserService();
    const result = await userService.setupUser();
    
    console.log('✅ Setup completo!');
    console.log('📊 Resumo:');
    console.log(`   👤 Usuário: ${result.user.email}`);
    console.log(`   ⚙️  Configurações: ${result.configs.count} criadas`);
    console.log(`   📅 Mês exemplo: ${result.mesExemplo.periodo}`);
    console.log('🎉 O app está pronto para uso!');
    
  } catch (error) {
    console.error('❌ Erro durante o setup:', error.message);
    process.exit(1);
  }
}

initializeDatabase();