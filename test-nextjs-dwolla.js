require('dotenv').config();

// Simular o ambiente Next.js server-side
process.env.NODE_ENV = 'development';

// Importar o Client de forma similar à aplicação
const { Client } = require('dwolla-v2');

// Simular a função getEnvironment
const getEnvironment = () => {
  const environment = process.env.DWOLLA_ENV;
  
  console.log("🔍 DWOLLA_ENV from process.env:", environment);
  console.log("🔍 All DWOLLA env vars:", {
    DWOLLA_ENV: process.env.DWOLLA_ENV,
    DWOLLA_KEY: process.env.DWOLLA_KEY ? 'exists' : 'missing',
    DWOLLA_SECRET: process.env.DWOLLA_SECRET ? 'exists' : 'missing',
    DWOLLA_BASE_URL: process.env.DWOLLA_BASE_URL
  });

  switch (environment) {
    case "sandbox":
      return "sandbox";
    case "production":
      return "production";
    default:
      throw new Error(
        `Dwolla environment should either be set to 'sandbox' or 'production'. Current value: '${environment}'`
      );
  }
};

// Simular a função getDwollaClient
const getDwollaClient = () => {
  try {
    console.log('🔧 Obtendo configuração do ambiente...');
    const environment = getEnvironment();
    const key = process.env.DWOLLA_KEY;
    const secret = process.env.DWOLLA_SECRET;

    if (!key || !secret) {
      const missingVars = [];
      if (!key) missingVars.push('DWOLLA_KEY');
      if (!secret) missingVars.push('DWOLLA_SECRET');
      throw new Error(`Variáveis de ambiente ausentes: ${missingVars.join(', ')}`);
    }

    console.log('🔄 Inicializando cliente Dwolla...', {
      environment,
      keyLength: key.length,
      secretLength: secret.length,
      keyPrefix: key.substring(0, 8)
    });

    const client = new Client({
      environment,
      key,
      secret,
    });

    console.log('✅ Cliente Dwolla criado com sucesso');
    return client;
  } catch (error) {
    console.error('❌ Erro ao inicializar cliente Dwolla:', error);
    throw new Error(`Falha ao inicializar cliente Dwolla: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

// Simular a função createDwollaCustomer
const createDwollaCustomer = async (newCustomer) => {
  try {
    console.log('🔄 Iniciando criação de cliente Dwolla...');
    console.log('📋 Dados do cliente:', {
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      email: newCustomer.email,
      type: newCustomer.type,
      hasAddress1: !!newCustomer.address1,
      hasCity: !!newCustomer.city,
      hasState: !!newCustomer.state,
      hasPostalCode: !!newCustomer.postalCode,
      hasDateOfBirth: !!newCustomer.dateOfBirth,
      hasSsn: !!newCustomer.ssn
    });

    // Step 1: Initialize Dwolla client
    console.log('🔧 Inicializando cliente Dwolla...');
    const dwollaClient = getDwollaClient();
    console.log('✅ Cliente Dwolla inicializado com sucesso');

    // Step 2: Create customer
    console.log('👤 Criando cliente no Dwolla...');
    const response = await dwollaClient.post("customers", newCustomer);
    
    const location = response.headers.get("location");
    console.log('✅ Cliente Dwolla criado com sucesso!');
    console.log('🔗 Location URL:', location);
    
    if (!location) {
      throw new Error('Location header não retornado pelo Dwolla');
    }

    return location;
  } catch (err) {
    console.error("❌ Erro detalhado ao criar cliente Dwolla:");
    console.error("🔍 Tipo do erro:", typeof err);
    console.error("🔍 Mensagem:", err?.message);
    console.error("🔍 Status:", err?.status);
    console.error("🔍 Code:", err?.code);
    console.error("🔍 Body:", err?.body);
    
    if (err?.body?._embedded?.errors) {
      console.error("🔍 Erros de validação do Dwolla:");
      err.body._embedded.errors.forEach((error, index) => {
        console.error(`  ${index + 1}. ${error.code}: ${error.message}`);
        if (error.path) console.error(`     Campo: ${error.path}`);
      });
    }
    
    // Log the full error object for debugging
    console.error("🔍 Objeto de erro completo:", JSON.stringify(err, null, 2));
    
    // Throw a more descriptive error
    const errorMessage = err?.body?._embedded?.errors?.[0]?.message || 
                        err?.message || 
                        'Erro desconhecido ao criar cliente Dwolla';
                        
    throw new Error(`Falha ao criar cliente Dwolla: ${errorMessage}`);
  }
};

// Simular exatamente os dados que vem da aplicação
async function testNextJSDwolla() {
  console.log('🚀 Testando Dwolla como seria na aplicação Next.js...');
  
  const userData = {
    firstName: 'Anderson',
    lastName: 'Lima',
    email: 'andersonodev+nextjs@gmail.com',
    type: 'personal',
    address1: '123 Test Street',
    city: 'New York', 
    state: 'NY',
    postalCode: '10001',
    dateOfBirth: '1990-01-01',
    ssn: '1234'
  };

  try {
    const dwollaCustomerUrl = await createDwollaCustomer(userData);
    
    if (!dwollaCustomerUrl) {
      throw new Error('Falha ao criar cliente Dwolla. Verifique se as credenciais do Dwolla estão corretas e se o serviço está disponível.');
    }

    console.log('🎉 Teste bem-sucedido!');
    console.log('✅ URL do cliente Dwolla:', dwollaCustomerUrl);
    
    // Extrair customer ID
    const customerId = dwollaCustomerUrl.split('/').pop();
    console.log('🆔 Customer ID extraído:', customerId);
    
    return {
      dwollaCustomerUrl,
      dwollaCustomerId: customerId
    };

  } catch (error) {
    console.error('❌ Erro no teste Next.js Dwolla:', error.message);
    console.error('🔍 Stack trace:', error.stack);
    throw error;
  }
}

// Executar teste
testNextJSDwolla()
  .then(result => {
    console.log('\n🎯 Resultado final:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Falha no teste:', error.message);
    process.exit(1);
  });
