require('dotenv').config();

async function testDwollaWithFetch() {
  console.log('🔄 Testando Dwolla com fetch API...');
  
  const credentials = Buffer.from(`${process.env.DWOLLA_KEY}:${process.env.DWOLLA_SECRET}`).toString('base64');
  
  try {
    // Teste 1: Obter token
    console.log('🧪 1. Testando obtenção de token...');
    const tokenResponse = await fetch('https://api-sandbox.dwolla.com/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token request failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Token obtido com sucesso:', {
      access_token: tokenData.access_token ? 'PRESENTE' : 'AUSENTE',
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in
    });

    // Teste 2: Testar API root
    console.log('🧪 2. Testando API root...');
    const rootResponse = await fetch('https://api-sandbox.dwolla.com/', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.dwolla.v1.hal+json'
      }
    });

    if (!rootResponse.ok) {
      throw new Error(`Root API request failed: ${rootResponse.status} ${rootResponse.statusText}`);
    }

    const rootData = await rootResponse.json();
    console.log('✅ API root acessível:', Object.keys(rootData._links || {}));

    // Teste 3: Criar cliente
    console.log('🧪 3. Testando criação de cliente...');
    const customerData = {
      firstName: 'Anderson',
      lastName: 'Lima',
      email: `andersonodev+test${Date.now()}@gmail.com`,
      type: 'personal',
      address1: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      dateOfBirth: '1990-01-01',
      ssn: '1234'
    };

    const customerResponse = await fetch('https://api-sandbox.dwolla.com/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/vnd.dwolla.v1.hal+json',
        'Accept': 'application/vnd.dwolla.v1.hal+json'
      },
      body: JSON.stringify(customerData)
    });

    console.log('📊 Customer response status:', customerResponse.status);
    console.log('📊 Customer response headers:', Object.fromEntries(customerResponse.headers.entries()));

    if (customerResponse.status === 201) {
      const location = customerResponse.headers.get('location');
      console.log('✅ Cliente criado com sucesso!');
      console.log('🔗 Customer URL:', location);
      return location;
    } else {
      const errorData = await customerResponse.text();
      console.log('❌ Erro na criação do cliente:', {
        status: customerResponse.status,
        statusText: customerResponse.statusText,
        body: errorData
      });
      
      try {
        const parsedError = JSON.parse(errorData);
        if (parsedError._embedded?.errors) {
          console.log('🔍 Detalhes dos erros:');
          parsedError._embedded.errors.forEach((err, index) => {
            console.log(`  ${index + 1}. ${err.code}: ${err.message}`);
            if (err.path) console.log(`     Path: ${err.path}`);
          });
        }
      } catch (parseError) {
        console.log('❌ Não foi possível parsear resposta de erro');
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testDwollaWithFetch();
