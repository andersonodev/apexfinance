require('dotenv').config();

const { Client, Account } = require('node-appwrite');

async function testLogin() {
  console.log('🧪 Testando login completo...');
  
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_SECRET);

  const account = new Account(client);

  try {
    console.log('🔐 Tentando fazer login...');
    
    // Create a session using email and password
    const session = await account.createEmailPasswordSession(
      'andersonodev@gmail.com', 
      '86833535@Junior'
    );
    
    console.log('✅ Login bem-sucedido!');
    console.log('🎯 Session ID:', session.$id);
    console.log('👤 User ID:', session.userId);
    
    // Get user info
    console.log('\n📄 Buscando informações do usuário...');
    const { Databases, Query } = require('node-appwrite');
    const databases = new Databases(client);
    
    const userInfo = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USER_COLLECTION_ID,
      [Query.equal('userId', [session.userId])]
    );
    
    if (userInfo.total > 0) {
      console.log('✅ Documento do usuário encontrado!');
      console.log('📋 User Info:', userInfo.documents[0]);
    } else {
      console.log('❌ Documento do usuário não encontrado');
    }
    
    // Clean up - delete the test session
    await account.deleteSession(session.$id);
    console.log('\n🧹 Session de teste removida');
    
    console.log('\n🎉 Teste completo! O login está funcionando corretamente.');
    
  } catch (error) {
    console.log('❌ Erro no login:', error.message);
    if (error.type) {
      console.log('🔍 Tipo do erro:', error.type);
    }
    if (error.code) {
      console.log('🔢 Código do erro:', error.code);
    }
  }
}

testLogin();
