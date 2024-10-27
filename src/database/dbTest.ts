import { sql } from './db';

async function testDatabaseConnection(): Promise<void> {
  try {
    const result = await sql`SELECT 1+1 AS result`;
    console.log('Database connection successful:', result);
  } catch (err) {
    console.error('Database connection failed:', err);
  } finally {
    await sql.end();
  }
}

testDatabaseConnection();
