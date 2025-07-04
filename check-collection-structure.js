require('dotenv').config();

const { Client, Databases } = require('node-appwrite');

async function checkCollectionStructure() {
  console.log('🔍 Verificando estrutura da collection...');
  
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_SECRET);

  const databases = new Databases(client);

  try {
    // Get collection info
    const collection = await databases.getCollection(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USER_COLLECTION_ID
    );

    console.log('📋 Collection Name:', collection.name);
    console.log('🆔 Collection ID:', collection.$id);
    console.log('\n📝 Attributes:');
    
    collection.attributes.forEach(attr => {
      console.log(`  - ${attr.key}: ${attr.type} ${attr.required ? '(required)' : '(optional)'}`);
    });

    console.log('\n🔑 Indexes:');
    collection.indexes.forEach(index => {
      console.log(`  - ${index.key}: ${index.type} on [${index.attributes.join(', ')}]`);
    });

  } catch (error) {
    console.log('❌ Erro:', error.message);
    console.log('🔍 Details:', error);
  }
}

checkCollectionStructure();
