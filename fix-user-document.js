require('dotenv').config();

const { Client, Users, Databases, ID } = require('node-appwrite');

async function fixUserDocument() {
  console.log('🔧 Corrigindo documento do usuário...');
  
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_SECRET);

  const users = new Users(client);
  const databases = new Databases(client);

  try {
    // Get the existing user
    const usersList = await users.list();
    if (usersList.total === 0) {
      console.log('❌ Nenhum usuário encontrado');
      return;
    }

    const user = usersList.users[0];
    console.log('👤 Usuário encontrado:', user.email);
    console.log('🆔 User ID:', user.$id);

    // Check if document already exists
    const { Query } = require('node-appwrite');
    const existingDocs = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USER_COLLECTION_ID,
      [Query.equal('userId', [user.$id])]
    );

    if (existingDocs.total > 0) {
      console.log('✅ Documento já existe!');
      console.log('📄 Document:', existingDocs.documents[0]);
      return;
    }

    // Create the missing user document
    console.log('📄 Criando documento do usuário...');
    
    const userData = {
      userId: user.$id,
      email: user.email,
      firstName: 'Anderson',
      lastName: 'Lima',
      dwollaCustomerId: '',
      dwollaCustomerUrl: ''
    };

    const newDoc = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USER_COLLECTION_ID,
      ID.unique(),
      userData
    );

    console.log('✅ Documento criado com sucesso!');
    console.log('📄 Document ID:', newDoc.$id);
    console.log('🔗 Linked to User ID:', newDoc.userId);

    console.log('\n🎉 Problema resolvido! Agora você pode tentar fazer login novamente.');
    console.log('💡 Use as seguintes credenciais:');
    console.log('📧 Email: ' + user.email);
    console.log('🔑 Senha: 86833535@Junior');

    // Test login
    console.log('\n🧪 Testando login...');
    const { Account } = require('node-appwrite');
    const account = new Account(client);
    
    try {
      const session = await account.createEmailSession(user.email, '86833535@Junior');
      console.log('✅ Login teste funcionou!');
      console.log('🎯 Session ID:', session.$id);
      
      // Delete test session
      await account.deleteSession(session.$id);
      console.log('🧹 Session de teste removida');
    } catch (loginError) {
      console.log('❌ Erro no teste de login:', loginError.message);
    }

  } catch (error) {
    console.log('❌ Erro:', error.message);
    console.log('🔍 Details:', error);
  }
}

fixUserDocument();
