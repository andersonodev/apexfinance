require('dotenv').config();

const { Client, Account, Databases, Query } = require('node-appwrite');

async function testLogin() {
  console.log('🔐 Testando processo de login...');
  
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_SECRET);

  const account = new Account(client);
  const databases = new Databases(client);

  const email = 'andersonodev@gmail.com';
  console.log(`📧 Testando login para: ${email}`);
  
  try {
    // Step 1: Try to create session (this uses the correct authentication method)
    console.log('\n🔐 Passo 1: Criando sessão...');
    const session = await account.createEmailPasswordSession(email, 'senha123'); // Tente com senhas comuns
    console.log('✅ Sessão criada com sucesso!');
    console.log('🆔 Session ID:', session.$id);
    console.log('👤 User ID:', session.userId);
    
    // Step 2: Try to get user info from database
    console.log('\n📄 Passo 2: Buscando documento do usuário...');
    const userDocs = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USER_COLLECTION_ID,
      [Query.equal('userId', [session.userId])]
    );
    
    if (userDocs.total === 0) {
      console.log('❌ PROBLEMA ENCONTRADO: Usuário autenticado mas sem documento no banco!');
      console.log('🔧 Solução: Criar documento do usuário no banco de dados');
      
      // Let's create the missing document
      console.log('\n🛠️  Criando documento do usuário...');
      const newUserDoc = await databases.createDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_USER_COLLECTION_ID,
        session.userId, // Use the same ID
        {
          userId: session.userId,
          email: email,
          firstName: 'Anderson',
          lastName: 'Lima',
          address1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          dateOfBirth: '1990-01-01',
          ssn: '1234',
          dwollaCustomerId: '', // Será preenchido depois
          dwollaCustomerUrl: '' // Será preenchido depois
        }
      );
      console.log('✅ Documento criado com sucesso!');
      console.log('📄 Document ID:', newUserDoc.$id);
    } else {
      console.log('✅ Documento do usuário encontrado!');
      console.log('📄 Document:', userDocs.documents[0]);
    }
    
  } catch (error) {
    if (error.message.includes('Invalid credentials')) {
      console.log('❌ Senha incorreta. Tente uma das seguintes senhas comuns:');
      console.log('  - senha123');
      console.log('  - password123');
      console.log('  - 12345678');
      console.log('  - a senha que você usou ao criar o usuário');
    } else {
      console.log('❌ Erro no login:', error.message);
      console.log('🔍 Código:', error.code);
      console.log('🔍 Tipo:', error.type);
    }
  }
}

testLogin();
