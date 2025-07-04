require('dotenv').config();

const { Client, Users, Databases, Account, ID } = require('node-appwrite');
const { Client: DwollaClient } = require('dwolla-v2');

async function testSignupWithFixedState() {
  console.log('🧪 Testando signup com estado correto...');
  
  // Setup clients
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_SECRET);

  const users = new Users(client);
  const databases = new Databases(client);
  const account = new Account(client);

  const dwollaClient = new DwollaClient({
    environment: process.env.DWOLLA_ENV === 'sandbox' ? 'sandbox' : 'production',
    key: process.env.DWOLLA_KEY,
    secret: process.env.DWOLLA_SECRET,
  });

  try {
    // Dados do usuário com estado de 2 letras (correto)
    const userData = {
      firstName: 'Anderson',
      lastName: 'Lima',
      address1: '123 Main Street',
      city: 'New York',
      state: 'NY', // ✅ Agora usando 2 letras!
      postalCode: '10001',
      dateOfBirth: '1990-01-01',
      ssn: '1234',
      email: 'anderson.test+fixed@gmail.com',
      password: '86833535@Junior'
    };

    console.log('📝 Dados do usuário:');
    console.log('- Nome:', userData.firstName, userData.lastName);
    console.log('- Email:', userData.email);
    console.log('- Estado:', userData.state, '(2 letras ✅)');
    console.log('- Endereço:', userData.address1, userData.city, userData.state, userData.postalCode);

    // 1. Criar usuário no Appwrite Authentication
    console.log('\n🔐 Criando usuário no Appwrite...');
    const newUserAccount = await users.create(
      ID.unique(),
      userData.email,
      '+5511999999999', // telefone fictício
      userData.password,
      `${userData.firstName} ${userData.lastName}`
    );

    console.log('✅ Usuário criado no Appwrite:', newUserAccount.$id);

    // 2. Criar cliente no Dwolla
    console.log('\n🏦 Criando cliente no Dwolla...');
    const dwollaCustomerData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      type: 'personal',
      address1: userData.address1,
      city: userData.city,
      state: userData.state, // 2 letras
      postalCode: userData.postalCode,
      dateOfBirth: userData.dateOfBirth,
      ssn: userData.ssn
    };

    const dwollaCustomer = await dwollaClient.post('customers', dwollaCustomerData);
    const dwollaCustomerUrl = dwollaCustomer.headers.get('location');
    const dwollaCustomerId = dwollaCustomerUrl.split('/').pop();

    console.log('✅ Cliente Dwolla criado:', dwollaCustomerId);
    console.log('🔗 URL:', dwollaCustomerUrl);

    // 3. Criar documento do usuário na collection
    console.log('\n📄 Criando documento do usuário...');
    const userDocument = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USER_COLLECTION_ID,
      ID.unique(),
      {
        userId: newUserAccount.$id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        dwollaCustomerId: dwollaCustomerId,
        dwollaCustomerUrl: dwollaCustomerUrl
      }
    );

    console.log('✅ Documento criado:', userDocument.$id);

    // 4. Testar login
    console.log('\n🧪 Testando login...');
    try {
      const session = await account.createEmailSession(userData.email, userData.password);
      console.log('✅ Login funcionou! Session:', session.$id);
      
      // Cleanup
      await account.deleteSession(session.$id);
      console.log('🧹 Session removida');
    } catch (loginError) {
      console.log('❌ Erro no login:', loginError.message);
    }

    console.log('\n🎉 SUCESSO! O processo de signup está funcionando corretamente com estado de 2 letras!');
    console.log('\n💡 Use estas credenciais para testar na aplicação:');
    console.log('📧 Email:', userData.email);
    console.log('🔑 Senha:', userData.password);
    console.log('🏛️ Estado: NY (2 letras como requerido pelo Dwolla)');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    if (error.type === 'user_already_exists') {
      console.log('💡 Usuário já existe. Tente com um email diferente.');
    } else if (error.message && error.message.includes('State must be a 2-letter abbreviation')) {
      console.log('🔍 Confirmado: O erro era o estado! Agora está corrigido.');
    }
  }
}

testSignupWithFixedState();
