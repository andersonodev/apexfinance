require('dotenv').config();
const { Client } = require('dwolla-v2');

console.log('🔐 Testando credenciais Dwolla...');

// Usar as credenciais do .env.example que funcionam
const dwollaClient = new Client({
  environment: 'sandbox',
  key: '6ZP0v663E62frcwkYmof79jbWQX0TKnL3ZH1RWk4hIPNx2Wa4F',
  secret: 'Yh1hCVOrEtkEWfGhwqbOYoelNfJlCrZjRs4zot3mNS3U9DB92y',
});

async function testSimple() {
  try {
    console.log('🧪 Tentando obter token...');
    
    // Teste simples de autenticação
    const auth = await dwollaClient.auth.client();
    console.log('✅ Autenticação bem-sucedida!');
    console.log('Token type:', auth.token_type);
    console.log('Expires in:', auth.expires_in, 'segundos');
    
  } catch (error) {
    console.error('❌ Erro na autenticação:');
    console.error('Status:', error.status || 'N/A');
    console.error('Message:', error.message || 'N/A');
    if (error.body) {
      console.error('Body:', JSON.stringify(error.body, null, 2));
    }
  }
}

// Executar com timeout
const timeout = setTimeout(() => {
  console.log('⏰ Timeout - a requisição demorou mais de 10 segundos');
  process.exit(1);
}, 10000);

testSimple().then(() => {
  clearTimeout(timeout);
  console.log('🏁 Teste concluído');
}).catch(err => {
  clearTimeout(timeout);
  console.error('💥 Erro não capturado:', err);
});
