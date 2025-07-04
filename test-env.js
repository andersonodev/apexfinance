require('dotenv').config();

console.log('Testing environment variables:');
console.log('DWOLLA_ENV:', process.env.DWOLLA_ENV);
console.log('DWOLLA_KEY:', process.env.DWOLLA_KEY ? 'SET' : 'NOT SET');
console.log('DWOLLA_SECRET:', process.env.DWOLLA_SECRET ? 'SET' : 'NOT SET');
console.log('DWOLLA_BASE_URL:', process.env.DWOLLA_BASE_URL);

console.log('\nAll DWOLLA environment variables:');
Object.keys(process.env)
  .filter(key => key.startsWith('DWOLLA'))
  .forEach(key => {
    console.log(`${key}: ${process.env[key]}`);
  });