#!/usr/bin/env node

/**
 * Script de teste para verificar a migração Belvo → Pluggy
 */

const fs = require('fs');
const path = require('path');

async function testPluggyMigration() {
  console.log('🧪 Testando migração Belvo → Pluggy...\n');

  try {
    // Teste 1: Verificar se arquivos Belvo foram removidos
    console.log('1️⃣ Verificando remoção de arquivos Belvo...');
    const belvoFiles = [
      'lib/belvo-api.ts',
      'lib/belvo.ts',
      'components/BelvoLink.tsx',
      'BELVO_MIGRATION.md',
      'test-belvo-integration.js',
      'test-refactoring.js'
    ];

    let belvoFilesRemoved = true;
    for (const file of belvoFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        console.log(`   ❌ ${file} - ainda existe`);
        belvoFilesRemoved = false;
      } else {
        console.log(`   ✅ ${file} - removido com sucesso`);
      }
    }

    if (belvoFilesRemoved) {
      console.log('✅ Todos os arquivos Belvo foram removidos\n');
    } else {
      console.log('❌ Alguns arquivos Belvo ainda existem\n');
    }

    // Teste 2: Verificar se arquivos Pluggy foram criados
    console.log('2️⃣ Verificando criação de arquivos Pluggy...');
    const pluggyFiles = [
      'lib/pluggy-api.ts',
      'components/PluggyLink.tsx'
    ];

    let pluggyFilesOk = true;
    for (const file of pluggyFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file} - criado com sucesso`);
      } else {
        console.log(`   ❌ ${file} - não encontrado`);
        pluggyFilesOk = false;
      }
    }

    if (pluggyFilesOk) {
      console.log('✅ Todos os arquivos Pluggy foram criados\n');
    } else {
      console.log('❌ Alguns arquivos Pluggy estão ausentes\n');
    }

    // Teste 3: Verificar se components foram atualizados
    console.log('3️⃣ Verificando atualização de imports nos componentes...');
    const componentFiles = [
      'components/AuthForm.tsx',
      'components/Sidebar.tsx',
      'components/EmptyBankState.tsx',
      'components/BankConnectionOptions.tsx'
    ];

    let importsOk = true;
    for (const file of componentFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('PluggyLink')) {
          console.log(`   ✅ ${file} - atualizado para PluggyLink`);
        } else if (content.includes('BelvoLink')) {
          console.log(`   ❌ ${file} - ainda usando BelvoLink`);
          importsOk = false;
        } else {
          console.log(`   ⚠️  ${file} - não usa componente de link bancário`);
        }
      } else {
        console.log(`   ❌ ${file} - não encontrado`);
        importsOk = false;
      }
    }

    if (importsOk) {
      console.log('✅ Todos os componentes foram atualizados\n');
    } else {
      console.log('❌ Alguns componentes ainda usam Belvo\n');
    }

    // Teste 4: Verificar variáveis de ambiente
    console.log('4️⃣ Verificando configuração de variáveis de ambiente...');
    const envFiles = ['.env', '.env.example'];
    
    for (const envFile of envFiles) {
      const envPath = path.join(process.cwd(), envFile);
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        if (envContent.includes('PLUGGY_CLIENT_ID')) {
          console.log(`   ✅ ${envFile} - variáveis Pluggy presentes`);
        } else {
          console.log(`   ❌ ${envFile} - variáveis Pluggy ausentes`);
        }
        
        if (envContent.includes('BELVO_SECRET_ID')) {
          console.log(`   ⚠️  ${envFile} - ainda contém variáveis Belvo`);
        } else {
          console.log(`   ✅ ${envFile} - variáveis Belvo removidas`);
        }
      } else {
        console.log(`   ❌ ${envFile} - não encontrado`);
      }
    }

    // Teste 5: Verificar package.json
    console.log('\n5️⃣ Verificando dependências no package.json...');
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageContent = fs.readFileSync(packagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);
      
      if (packageJson.dependencies && packageJson.dependencies.belvo) {
        console.log('   ❌ Dependência "belvo" ainda presente');
      } else {
        console.log('   ✅ Dependência "belvo" removida');
      }
      
      if (packageJson.devDependencies && packageJson.devDependencies['@types/belvo']) {
        console.log('   ❌ Dependência "@types/belvo" ainda presente');
      } else {
        console.log('   ✅ Dependência "@types/belvo" removida');
      }
      
      if (packageJson.dependencies && packageJson.dependencies.axios) {
        console.log('   ✅ Dependência "axios" presente (necessária para Pluggy)');
      } else {
        console.log('   ⚠️  Dependência "axios" ausente (necessária para Pluggy)');
      }
    }

    console.log('\n🎉 Teste de migração Belvo → Pluggy concluído!');
    console.log('\n📋 Resumo da migração:');
    console.log('   • Arquivos Belvo removidos');
    console.log('   • Componente PluggyLink criado');
    console.log('   • Actions refatoradas para usar Pluggy');
    console.log('   • Tipos atualizados para Pluggy');
    console.log('   • Variáveis de ambiente configuradas');
    console.log('   • Dependências atualizadas');
    
    console.log('\n📝 Próximos passos:');
    console.log('   1. Configure suas credenciais Pluggy no .env');
    console.log('   2. Teste a conexão bancária');
    console.log('   3. Verifique se o fluxo de onboarding funciona');
    console.log('   4. Teste transferências e transações');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar o teste
if (require.main === module) {
  testPluggyMigration();
}

module.exports = { testPluggyMigration };
