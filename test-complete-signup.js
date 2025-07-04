require('dotenv').config();

const { Client } = require('dwolla-v2');

async function testCompleteSignup() {
  console.log('🔧 Testando processo completo de signup...');

  try {
    // 1. Test Dwolla Client Initialization
    console.log('1️⃣ Testando inicialização do cliente Dwolla...');
    const dwollaClient = new Client({
      environment: process.env.DWOLLA_ENV === 'sandbox' ? 'sandbox' : 'production',
      key: process.env.DWOLLA_KEY,
      secret: process.env.DWOLLA_SECRET,
    });
    console.log('✅ Cliente Dwolla inicializado com sucesso');

    // 2. Test Authentication
    console.log('2️⃣ Testando autenticação...');
    const authResponse = await dwollaClient.auth.client();
    console.log('✅ Autenticação bem-sucedida, token:', authResponse.access_token ? 'PRESENTE' : 'AUSENTE');

    // 3. Test Customer Creation with real signup data
    console.log('3️⃣ Testando criação de cliente com dados de signup...');
    const testUserData = {
      firstName: 'Anderson',
      lastName: 'Lima', 
      email: 'andersonodev+teste2@gmail.com', // Email único
      type: 'personal',
      address1: '123 Test Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      dateOfBirth: '1990-01-01',
      ssn: '1234'
    };

    console.log('📝 Dados para criação:', {
      firstName: testUserData.firstName,
      lastName: testUserData.lastName,
      email: testUserData.email,
      type: testUserData.type
    });

    const customerResponse = await dwollaClient.post('customers', testUserData);
    const customerUrl = customerResponse.headers.get('location');
    
    console.log('✅ Cliente Dwolla criado com sucesso!');
    console.log('🔗 Customer URL:', customerUrl);
    console.log('🆔 Customer ID:', customerUrl?.split('/').pop());

    console.log('\n🎉 Teste completo bem-sucedido!');
    console.log('💡 O problema não está no Dwolla, deve estar na configuração do servidor Next.js');
    
    return true;

  } catch (error) {
    console.error('❌ Erro no teste:', {
      message: error?.message,
      body: error?.body,
      code: error?.code,
      status: error?.status
    });

    if (error?.body?._embedded?.errors) {
      console.log('🔍 Detalhes dos erros:');
      error.body._embedded.errors.forEach((err, index) => {
        console.log(`  ${index + 1}. ${err.code}: ${err.message}`);
      });
    }

    return false;
  }
}

testCompleteSignup();
