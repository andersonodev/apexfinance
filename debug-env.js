// Debug script to check environment variables in Next.js context
require('dotenv').config();

console.log('🔍 DEBUG - Todas as variáveis de ambiente:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);
console.log('');

console.log('📋 APPWRITE:');
console.log('NEXT_PUBLIC_APPWRITE_ENDPOINT:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
console.log('NEXT_PUBLIC_APPWRITE_PROJECT:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT);
console.log('APPWRITE_DATABASE_ID:', process.env.APPWRITE_DATABASE_ID);
console.log('APPWRITE_USER_COLLECTION_ID:', process.env.APPWRITE_USER_COLLECTION_ID);
console.log('APPWRITE_SECRET:', process.env.APPWRITE_SECRET ? `${process.env.APPWRITE_SECRET.substring(0, 20)}...` : 'MISSING');
console.log('');

console.log('💳 DWOLLA:');
console.log('DWOLLA_KEY:', process.env.DWOLLA_KEY ? `${process.env.DWOLLA_KEY.substring(0, 10)}...` : 'MISSING');
console.log('DWOLLA_SECRET:', process.env.DWOLLA_SECRET ? `${process.env.DWOLLA_SECRET.substring(0, 10)}...` : 'MISSING');
console.log('DWOLLA_ENV:', process.env.DWOLLA_ENV);
console.log('DWOLLA_BASE_URL:', process.env.DWOLLA_BASE_URL);
console.log('');

console.log('🏦 PLAID:');
console.log('PLAID_CLIENT_ID:', process.env.PLAID_CLIENT_ID ? `${process.env.PLAID_CLIENT_ID.substring(0, 10)}...` : 'MISSING');
console.log('PLAID_SECRET:', process.env.PLAID_SECRET ? `${process.env.PLAID_SECRET.substring(0, 10)}...` : 'MISSING');
console.log('PLAID_ENV:', process.env.PLAID_ENV);
console.log('');

// Test if we can create Dwolla client
try {
  const { Client } = require('dwolla-v2');
  
  console.log('🧪 Testando criação do cliente Dwolla...');
  const dwollaClient = new Client({
    environment: process.env.DWOLLA_ENV === 'sandbox' ? 'sandbox' : 'production',
    key: process.env.DWOLLA_KEY,
    secret: process.env.DWOLLA_SECRET,
  });
  
  console.log('✅ Cliente Dwolla criado com sucesso!');
  console.log('🔍 Cliente details:', {
    environment: dwollaClient.environment,
    key: dwollaClient.key ? `${dwollaClient.key.substring(0, 10)}...` : 'MISSING',
    secret: dwollaClient.secret ? 'PRESENTE' : 'MISSING'
  });
  
} catch (error) {
  console.log('❌ Erro ao criar cliente Dwolla:', error.message);
  console.log('🔍 Stack:', error.stack);
}
