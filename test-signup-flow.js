// Test the exact flow that happens in the Next.js application
require('dotenv').config();

// Simulate the server action context
async function testSignUpFlow() {
  console.log('🚀 Simulando o fluxo exato da aplicação Next.js...');
  
  const userData = {
    firstName: 'Anderson',
    lastName: 'Lima',
    email: 'andersonodev+test3@gmail.com',
    password: '86833535@Junior',
    address1: '123 Main Street',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    dateOfBirth: '1990-01-01',
    ssn: '1234'
  };

  try {
    console.log('🔄 Iniciando processo de signup para:', userData.email);
    
    // Step 1: Test createDwollaCustomer function directly
    console.log('💳 Testando createDwollaCustomer...');
    
    // Import the function the same way as in user.actions.ts
    const { createDwollaCustomer } = require('./lib/actions/dwolla.actions');
    
    const dwollaCustomerUrl = await createDwollaCustomer({
      ...userData,
      type: 'personal'
    });

    if (!dwollaCustomerUrl) {
      throw new Error('Falha ao criar cliente Dwolla. Verifique se as credenciais do Dwolla estão corretas e se o serviço está disponível.');
    }
    
    console.log('✅ Cliente Dwolla criado com sucesso:', dwollaCustomerUrl);
    
    // Extract customer ID
    const dwollaCustomerId = dwollaCustomerUrl.split('/customers/')[1];
    console.log('🆔 Customer ID extraído:', dwollaCustomerId);
    
    console.log('🎉 Teste do fluxo completo bem-sucedido!');
    
    return {
      dwollaCustomerUrl,
      dwollaCustomerId
    };
    
  } catch (error) {
    console.error('❌ Erro no teste do fluxo:', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      type: error?.type,
      stack: error?.stack
    });
    
    // Let's also check if it's a Dwolla-specific error
    if (error?.message?.includes('Dwolla')) {
      console.log('🔍 Este é um erro específico do Dwolla');
    }
    
    throw error;
  }
}

testSignUpFlow().catch(console.error);
