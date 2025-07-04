require('dotenv').config();

const { Client, Account, Databases, Users } = require('node-appwrite');

async function testAppwriteConfig() {
  console.log('🔐 Validando configuração Appwrite...');
  
  // Test credentials
  console.log('📋 Credenciais:');
  console.log('- Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
  console.log('- Project:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT);
  console.log('- Database:', process.env.APPWRITE_DATABASE_ID);
  console.log('- Secret length:', process.env.APPWRITE_SECRET?.length || 0);
  
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_SECRET);

  try {
    console.log('\n🧪 Testando com Users API...');
    const users = new Users(client);
    const usersList = await users.list();
    console.log('✅ API Users funcionando!');
    console.log('👥 Total de usuários:', usersList.total);
  } catch (error) {
    console.log('❌ Erro na API Users:', error.message);
    console.log('🔍 Código do erro:', error.code);
    console.log('🔍 Tipo do erro:', error.type);
  }

  try {
    console.log('\n🧪 Testando com Databases API...');
    const databases = new Databases(client);
    const collections = await databases.listCollections(process.env.APPWRITE_DATABASE_ID);
    console.log('✅ API Databases funcionando!');
    console.log('📊 Collections encontradas:', collections.collections.length);
  } catch (error) {
    console.log('❌ Erro na API Databases:', error.message);
    console.log('🔍 Código do erro:', error.code);
    console.log('🔍 Tipo do erro:', error.type);
  }

  // Try to create a session using email/password method
  try {
    console.log('\n🧪 Testando criação de sessão diretamente...');
    const account = new Account(client);
    
    // This should fail because we're using API key, not session
    console.log('⚠️  Nota: Este teste deve falhar porque estamos usando API key, não sessão de usuário');
    const session = await account.createEmailPasswordSession('test@test.com', 'testpassword');
    console.log('✅ Sessão criada (inesperado!):', session);
  } catch (error) {
    console.log('❌ Erro esperado na criação de sessão:', error.message);
    console.log('💡 Isso é normal ao usar API key em vez de autenticação de usuário');
  }

  console.log('\n🔧 Diagnóstico:');
  console.log('1. Verifique se a API key tem as permissões corretas no Appwrite Console');
  console.log('2. A API key deve ter permissões para: Users, Databases, Account');
  console.log('3. Verifique se o projeto ID está correto');
  console.log('4. Verifique se o endpoint está correto');
}

testAppwriteConfig();
