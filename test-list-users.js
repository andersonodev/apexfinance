require('dotenv').config();

const { Client, Users, Databases, Query } = require('node-appwrite');

async function listUsersAndTest() {
  console.log('🔐 Listando usuários existentes...');
  
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_SECRET);

  const users = new Users(client);
  const databases = new Databases(client);

  try {
    // List all users
    const usersList = await users.list();
    console.log('👥 Usuários encontrados:', usersList.total);
    
    usersList.users.forEach((user, index) => {
      console.log(`\n👤 Usuário ${index + 1}:`);
      console.log('  - ID:', user.$id);
      console.log('  - Email:', user.email);
      console.log('  - Nome:', user.name);
      console.log('  - Status:', user.status ? 'Ativo' : 'Inativo');
      console.log('  - Email verificado:', user.emailVerification);
      console.log('  - Criado em:', new Date(user.$createdAt).toLocaleString());
    });

    // Check user collection documents
    console.log('\n📄 Verificando documentos na collection de usuários...');
    const userDocs = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USER_COLLECTION_ID
    );
    
    console.log('📊 Documentos de usuário:', userDocs.total);
    userDocs.documents.forEach((doc, index) => {
      console.log(`\n📄 Documento ${index + 1}:`);
      console.log('  - Document ID:', doc.$id);
      console.log('  - User ID:', doc.userId);
      console.log('  - Email:', doc.email);
      console.log('  - Nome:', doc.firstName, doc.lastName);
      console.log('  - Dwolla Customer ID:', doc.dwollaCustomerId);
    });

    // Try to authenticate with the first user if exists
    if (usersList.total > 0) {
      const firstUser = usersList.users[0];
      console.log(`\n🧪 Vou tentar testar login com o usuário: ${firstUser.email}`);
      console.log('⚠️  Para testar login, você precisa saber a senha do usuário');
      console.log('💡 Dica: Se você criou o usuário recentemente, tente usar a senha que você utilizou');
    }

  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

listUsersAndTest();
