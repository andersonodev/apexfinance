require('dotenv').config();

const { Client, Account, Databases } = require('node-appwrite');

async function testAppwriteAuth() {
  console.log('🔐 Testando autenticação Appwrite...');
  
  // Test credentials
  console.log('📋 Credenciais:');
  console.log('- Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
  console.log('- Project:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT);
  console.log('- Database:', process.env.APPWRITE_DATABASE_ID);
  console.log('- Secret:', process.env.APPWRITE_SECRET ? 'PRESENTE' : 'AUSENTE');
  
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_SECRET);

  const account = new Account(client);
  const databases = new Databases(client);

  try {
    console.log('\n🧪 Testando conexão com o projeto...');
    // Try to get project details
    const project = await account.get();
    console.log('✅ Conexão estabelecida com sucesso!');
  } catch (error) {
    console.log('❌ Erro na conexão:', error.message);
    return;
  }

  try {
    console.log('\n🧪 Testando acesso ao banco de dados...');
    const collections = await databases.listCollections(process.env.APPWRITE_DATABASE_ID);
    console.log('✅ Banco de dados acessível!');
    console.log('📊 Collections encontradas:', collections.collections.map(c => c.name));
  } catch (error) {
    console.log('❌ Erro no banco de dados:', error.message);
  }

  // Test login with existing user (if any)
  try {
    console.log('\n🧪 Testando lista de usuários...');
    // We'll use the admin client to list users
    const { Users } = require('node-appwrite');
    const users = new Users(client);
    const usersList = await users.list();
    console.log('✅ Lista de usuários obtida!');
    console.log('👥 Total de usuários:', usersList.total);
    
    if (usersList.total > 0) {
      console.log('👤 Primeiro usuário:', {
        id: usersList.users[0].$id,
        email: usersList.users[0].email,
        name: usersList.users[0].name
      });
    }
  } catch (error) {
    console.log('❌ Erro ao listar usuários:', error.message);
  }
}

testAppwriteAuth();
