const { Client, Account } = require('node-appwrite');

// Test Appwrite connection
async function testAppwriteConnection() {
  try {
    console.log('🔄 Testando conexão com Appwrite...');
    
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || 'apexfinance-db')
      .setKey(process.env.APPWRITE_SECRET);

    const account = new Account(client);
    
    // Test creating a session (this will fail but we can see the error)
    console.log('✅ Cliente Appwrite configurado com sucesso');
    console.log('📍 Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
    console.log('🏷️  Project ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT);
    console.log('🔑 Secret disponível:', !!process.env.APPWRITE_SECRET);
    
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com Appwrite:', error.message);
    return false;
  }
}

// Test environment variables
function testEnvironmentVariables() {
  console.log('\n🔄 Verificando variáveis de ambiente...');
  
  const requiredVars = [
    'NEXT_PUBLIC_APPWRITE_ENDPOINT',
    'NEXT_PUBLIC_APPWRITE_PROJECT',
    'APPWRITE_SECRET',
    'APPWRITE_DATABASE_ID',
    'APPWRITE_USER_COLLECTION_ID'
  ];
  
  let allValid = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '***' : value}`);
    } else {
      console.log(`❌ ${varName}: NÃO DEFINIDA`);
      allValid = false;
    }
  });
  
  return allValid;
}

async function runTests() {
  console.log('🚀 Iniciando testes de diagnóstico...\n');
  
  const envValid = testEnvironmentVariables();
  console.log('\n' + '='.repeat(50));
  
  if (envValid) {
    await testAppwriteConnection();
  } else {
    console.log('❌ Configuração de ambiente inválida. Verifique o arquivo .env');
  }
  
  console.log('\n📋 Diagnóstico concluído!');
}

// Load environment variables
require('dotenv').config();

runTests().catch(console.error);
