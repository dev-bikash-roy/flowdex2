import { db, pool } from './server/db';
import { users } from './shared/schema';
import dotenv from 'dotenv';

dotenv.config();

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await pool.query('SELECT 1');
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.log('Please check your DATABASE_URL in the .env file');
    console.log('Current DATABASE_URL:', process.env.DATABASE_URL);
    console.log('Make sure you have updated it with your actual database credentials');
  }
}

async function testTwelveDataConnection() {
  try {
    console.log('Testing TwelveData API connection...');
    
    // Check if API key is set
    if (!process.env.TWELVEDATA_API_KEY) {
      console.log('TwelveData API key not set in environment variables');
      return;
    }
    
    // Dynamic import to avoid errors if package is not installed
    const twelveDataService = await import('./server/services/twelveDataService');
    
    // Test API call
    const data = await twelveDataService.getTimeSeries('EURUSD', '1min', 5);
    console.log('TwelveData API connection successful!');
    console.log('Sample data received for symbol:', data.meta?.symbol || 'EURUSD');
  } catch (error) {
    console.error('TwelveData API connection failed:', error.message);
    console.log('Please check your TWELVEDATA_API_KEY in the .env file');
  }
}

async function main() {
  await testDatabaseConnection();
  console.log('---');
  await testTwelveDataConnection();
}

main();