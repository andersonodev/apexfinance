// Test signup with skip bank connection option
require('dotenv').config();

async function testSignupWithSkipOption() {
  console.log('🚀 Testando signup com opção de pular conexão bancária...');
  
  const { signUp } = require('./lib/actions/user.actions');
  
  // Teste 1: Signup SEM pular conexão bancária (deve criar Dwolla)
  console.log('\n📝 Teste 1: Signup com criação do cliente Dwolla...');
  try {
    const userData1 = {
      firstName: 'Anderson',
      lastName: 'Silva',
      email: `anderson.test.dwolla+${Date.now()}@gmail.com`,
      password: '12345678',
      address1: '99-99 33rd St', // Endereço válido para sandbox
      city: 'Some City',
      state: 'NY',
      postalCode: '11101',
      dateOfBirth: '1970-01-01', // Data válida para sandbox
      ssn: '1234', // SSN válido para sandbox
      skipBankConnection: false
    };

    const result1 = await signUp(userData1);
    console.log('✅ Resultado teste 1:', result1 ? 'Sucesso' : 'Falha');
    
    if (result1?.dwollaCustomerId) {
      console.log('🎉 Cliente Dwolla criado:', result1.dwollaCustomerId);
    }
  } catch (error) {
    console.log('❌ Erro no teste 1:', error.message);
  }

  // Teste 2: Signup PULANDO conexão bancária (não deve criar Dwolla)
  console.log('\n📝 Teste 2: Signup pulando criação do cliente Dwolla...');
  try {
    const userData2 = {
      firstName: 'Maria',
      lastName: 'Santos',
      email: `maria.test.skip+${Date.now()}@gmail.com`,
      password: '12345678',
      address1: '123 Main Street',
      city: 'Test City',
      state: 'CA',
      postalCode: '90210',
      dateOfBirth: '1985-05-15',
      ssn: '5678',
      skipBankConnection: true
    };

    const result2 = await signUp(userData2);
    console.log('✅ Resultado teste 2:', result2 ? 'Sucesso' : 'Falha');
    
    if (result2) {
      console.log('🏦 Dwolla Customer ID:', result2.dwollaCustomerId || 'Nenhum (como esperado)');
      console.log('🔗 Dwolla Customer URL:', result2.dwollaCustomerUrl || 'Nenhuma (como esperado)');
    }
  } catch (error) {
    console.log('❌ Erro no teste 2:', error.message);
  }

  console.log('\n🎯 Testes concluídos!');
}

testSignupWithSkipOption().catch(console.error);
