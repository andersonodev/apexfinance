require('dotenv').config();
const { Client } = require('dwolla-v2');

// Configuração do Dwolla Client
const dwollaClient = new Client({
  environment: 'sandbox',
  key: process.env.DWOLLA_KEY,
  secret: process.env.DWOLLA_SECRET,
});

// Dados de teste válidos para o sandbox Dwolla
const testCustomerData = {
  firstName: "John",
  lastName: "Doe", 
  email: "john.doe@example.com",
  type: "personal",
  address1: "123 Main Street",
  city: "New York",
  state: "NY",
  postalCode: "10001",
  dateOfBirth: "1990-01-01",
  ssn: "1234"  // Para sandbox, use "1234" que é um SSN de teste válido
};

async function testDwollaCustomer() {
  try {
    console.log('🧪 Testando criação de cliente Dwolla...');
    console.log('📤 Dados a serem enviados:');
    console.log(JSON.stringify(testCustomerData, null, 2));
    
    const response = await dwollaClient.post("customers", testCustomerData);
    const customerUrl = response.headers.get("location");
    
    console.log('✅ Cliente criado com sucesso!');
    console.log('🔗 URL do cliente:', customerUrl);
    
  } catch (error) {
    console.error('❌ Erro ao criar cliente Dwolla:');
    console.error('Status:', error.status);
    console.error('Body:', error.body);
    
    if (error.body && error.body._embedded && error.body._embedded.errors) {
      console.error('📋 Detalhes dos erros de validação:');
      error.body._embedded.errors.forEach((err, index) => {
        console.error(`  ${index + 1}. Campo: ${err.path} - ${err.message}`);
      });
    }
  }
}

testDwollaCustomer();
