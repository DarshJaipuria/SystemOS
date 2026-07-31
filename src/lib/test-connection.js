import { db } from './db.js';

async function testConnection() {
  console.log('🔄 Checking database connection using Prisma ORM...');
  console.log('📍 Connection URL:', process.env.DATABASE_URL ? 'Defined (Hidden)' : 'NOT DEFINED ⚠️');

  try {
    // Attempt a simple query on the database
    const start = Date.now();
    await db.$connect();
    console.log('✨ Prisma successfully connected to the database server!');

    // Test querying the User table
    const count = await db.user.count();
    const duration = Date.now() - start;
    
    console.log(`✅ Database query successful!`);
    console.log(`👥 Total users in database: ${count}`);
    console.log(`⏱️ Query execution time: ${duration}ms`);
  } catch (error) {
    console.error('\n❌ Database Connection Failed!');
    console.error('===================================');
    console.error('Error Details:', error.message || error);
    console.error('===================================');
    console.error('\n💡 Troubleshooting Tips:');
    console.error('1. Make sure your MySQL database server is running.');
    console.error('2. Double-check your DATABASE_URL in the .env file.');
    console.error('   Format: mysql://username:password@host:port/database_name');
    console.error('3. Verify that the database "habit_tracker" (or whatever database name you chose) exists.');
    console.error('4. If this is a new setup, make sure you ran Prisma migrations:');
    console.error('   npx prisma migrate dev --name init');
  } finally {
    await db.$disconnect();
  }
}

testConnection();
