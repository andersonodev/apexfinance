require('dotenv').config();

async function testDwollaHTTP() {
  console.log('🔄 Testando Dwolla com HTTP direto...');
  
  const credentials = Buffer.from(`${process.env.DWOLLA_KEY}:${process.env.DWOLLA_SECRET}`).toString('base64');
  
  console.log('📋 Credenciais:');
  console.log('- Key:', process.env.DWOLLA_KEY ? `${process.env.DWOLLA_KEY.substring(0, 10)}...` : 'MISSING');
  console.log('- Secret:', process.env.DWOLLA_SECRET ? `${process.env.DWOLLA_SECRET.substring(0, 10)}...` : 'MISSING');
  console.log('- Credentials Base64:', `${credentials.substring(0, 20)}...`);
  
  try {
    console.log('🧪 Fazendo requisição de token...');
    
    const response = await fetch('https://api-sandbox.dwolla.com/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    
    console.log('📊 Status da resposta:', response.status);
    console.log('📋 Headers da resposta:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('📄 Resposta raw:', data);
    
    if (response.ok) {
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ Token obtido com sucesso!');
        console.log('🔑 Token details:', {
          access_token: jsonData.access_token ? `${jsonData.access_token.substring(0, 10)}...` : 'AUSENTE',
          token_type: jsonData.token_type,
          expires_in: jsonData.expires_in
        });
        
        // Testar criação de cliente
        console.log('\n🧪 Testando criação de cliente...');
        const customerData = {
          firstName: 'Jane',
          lastName: 'Doe',
          email: `jane.doe+${Date.now()}@example.com`,
          type: 'personal',
          address1: '99-99 33rd St',
          city: 'Some City',
          state: 'NY',
          postalCode: '11101',
          dateOfBirth: '1970-01-01',  // Data válida para sandbox
          ssn: '1234'  // SSN de teste válido para sandbox
        };
        
        const customerResponse = await fetch('https://api-sandbox.dwolla.com/customers', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jsonData.access_token}`,
            'Content-Type': 'application/vnd.dwolla.v1.hal+json',
            'Accept': 'application/vnd.dwolla.v1.hal+json'
          },
          body: JSON.stringify(customerData)
        });
        
        console.log('📊 Status criação cliente:', customerResponse.status);
        console.log('📋 Headers criação cliente:', Object.fromEntries(customerResponse.headers.entries()));
        
        const customerResponseText = await customerResponse.text();
        console.log('📄 Resposta criação cliente:', customerResponseText);
        
        if (customerResponse.status === 201) {
          const location = customerResponse.headers.get('location');
          console.log('✅ Cliente criado com sucesso!');
          console.log('🔗 Customer URL:', location);
        } else {
          console.log('❌ Erro na criação do cliente');
        }
        
      } catch (parseError) {
        console.log('❌ Erro ao fazer parse da resposta:', parseError.message);
      }
    } else {
      console.log('❌ Erro na requisição de token');
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
    console.log('🔍 Stack:', error.stack);
  }
}

testDwollaHTTP();
