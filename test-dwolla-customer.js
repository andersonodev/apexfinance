require('dotenv').config();

const { Client } = require('dwolla-v2');

async function testDwollaCustomerCreation() {
  console.log('🔄 Testando criação de cliente Dwolla...');
  
  // Verificar variáveis de ambiente
  console.log('📋 Credenciais Dwolla:');
  console.log('- Key:', process.env.DWOLLA_KEY ? `${process.env.DWOLLA_KEY.substring(0, 10)}...` : 'MISSING');
  console.log('- Secret:', process.env.DWOLLA_SECRET ? `${process.env.DWOLLA_SECRET.substring(0, 10)}...` : 'MISSING');
  console.log('- Environment:', process.env.DWOLLA_ENV);
  console.log('- Base URL:', process.env.DWOLLA_BASE_URL);

  try {
    const dwollaClient = new Client({
      environment: process.env.DWOLLA_ENV === 'sandbox' ? 'sandbox' : 'production',
      key: process.env.DWOLLA_KEY,
      secret: process.env.DWOLLA_SECRET,
    });

    console.log('✅ Cliente Dwolla inicializado com sucesso');

    // Teste de autenticação
    console.log('🧪 Testando autenticação...');
    try {
      const authResponse = await Promise.race([
        dwollaClient.auth.client(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na autenticação')), 10000)
        )
      ]);
      
      console.log('🔍 Debug - Tipo da resposta:', typeof authResponse);
      console.log('🔍 Debug - Resposta completa da autenticação:', JSON.stringify(authResponse, null, 2));
      console.log('🔍 Debug - Keys da resposta:', authResponse ? Object.keys(authResponse) : 'Resposta é null/undefined');
      
      if (authResponse && authResponse.body) {
        console.log('🔍 Debug - Body da resposta:', JSON.stringify(authResponse.body, null, 2));
        console.log('🔍 Debug - Keys do body:', Object.keys(authResponse.body));
      }
      
      // Tentar diferentes formas de acessar o token
      let token = null;
      if (authResponse) {
        token = authResponse.access_token || 
                authResponse.body?.access_token || 
                authResponse.token ||
                authResponse.body?.token;
      }
      
      console.log('🔍 Debug - Token encontrado:', token ? `${token.substring(0, 10)}...` : 'NENHUM');
      
      if (!token) {
        throw new Error('Token de acesso não encontrado na resposta');
      }
      
      console.log('✅ Autenticação bem-sucedida com token!');
    } catch (authError) {
      console.error('❌ Erro na autenticação:', {
        message: authError.message,
        stack: authError.stack,
        error: authError
      });
      throw authError;
    }

    // Teste de criação de cliente
    console.log('🧪 Testando criação de cliente...');
    const customerData = {
      firstName: 'Anderson',
      lastName: 'Lima',
      email: 'andersonodev+test@gmail.com', // Email diferente para evitar duplicação
      type: 'personal',
      address1: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      dateOfBirth: '1990-01-01',
      ssn: '1234'
    };

    console.log('📝 Dados do cliente:', customerData);

    const response = await Promise.race([
      dwollaClient.post('customers', customerData),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na criação do cliente')), 15000)
      )
    ]);
    const customerUrl = response.headers.get('location');
    
    console.log('✅ Cliente criado com sucesso!');
    console.log('🔗 Customer URL:', customerUrl);

    // Extrair customer ID
    const customerId = customerUrl ? customerUrl.split('/').pop() : null;
    console.log('🆔 Customer ID:', customerId);

    return customerUrl;

  } catch (error) {
    console.error('❌ Erro na criação do cliente Dwolla:', {
      message: error?.message,
      body: error?.body,
      code: error?.code,
      status: error?.status,
      headers: error?.headers,
      full_error: error
    });

    // Verificar se é erro de duplicação
    if (error?.body?._embedded?.errors) {
      console.log('🔍 Detalhes dos erros:');
      error.body._embedded.errors.forEach((err, index) => {
        console.log(`  ${index + 1}. ${err.code}: ${err.message}`);
        if (err.path) console.log(`     Path: ${err.path}`);
      });
    }

    return null;
  }
}

testDwollaCustomerCreation();
