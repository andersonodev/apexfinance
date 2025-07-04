require('dotenv').config();
const { Client } = require('dwolla-v2');

console.log('🔐 Testando autenticação Dwolla...');
console.log('📋 Credenciais:');
console.log('- Key:', process.env.DWOLLA_KEY ? `${process.env.DWOLLA_KEY.substring(0, 10)}...` : 'NÃO ENCONTRADA');
console.log('- Secret:', process.env.DWOLLA_SECRET ? `${process.env.DWOLLA_SECRET.substring(0, 10)}...` : 'NÃO ENCONTRADA');
console.log('- Environment:', process.env.DWOLLA_ENV);

// Configuração do Dwolla Client
const dwollaClient = new Client({
  environment: 'sandbox',
  key: process.env.DWOLLA_KEY,
  secret: process.env.DWOLLA_SECRET,
});

async function testAuth() {
  try {
    console.log('\n🧪 Testando token de acesso...');
    
    // Primeiro, vamos tentar obter um token de acesso
    const token = await dwollaClient.auth.client();
    console.log('✅ Token obtido com sucesso!');
    console.log('📍 Token details:', {
      access_token: token.access_token ? 'PRESENTE' : 'AUSENTE',
      token_type: token.token_type,
      expires_in: token.expires_in
    });
    
    // Agora vamos tentar fazer uma chamada simples para a API
    console.log('\n🧪 Testando chamada para a API...');
    const response = await dwollaClient.get('/');
    console.log('✅ Chamada para API bem-sucedida!');
    console.log('📊 Response:', response.body);
    
  } catch (error) {
    console.error('❌ Erro na autenticação:');
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.error('Body:', error.body);
  }
}

testAuth();
