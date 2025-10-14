import dotenv from 'dotenv';
dotenv.config();

console.log('Testing TwelveData Service...');
console.log('API Key:', process.env.TWELVEDATA_API_KEY ? 'Present' : 'Missing');
console.log('API Key Length:', process.env.TWELVEDATA_API_KEY?.length);

if (!process.env.TWELVEDATA_API_KEY) {
  console.error('TWELVEDATA_API_KEY is not set in environment variables');
  process.exit(1);
}

// Test our TwelveData service
import { getTimeSeries, getPrice } from './server/services/twelveDataService.js';

async function testService() {
  try {
    console.log('Testing TwelveData service...');
    
    // Test getting time series data
    console.log('Fetching AAPL data...');
    const data = await getTimeSeries('AAPL', '1h', 10);
    
    console.log('API Response:');
    console.log('Status:', data.status);
    console.log('Meta:', data.meta);
    console.log('Values count:', data.values?.length);
    
    if (data.values && data.values.length > 0) {
      console.log('First data point:', data.values[0]);
      console.log('Last data point:', data.values[data.values.length - 1]);
    }
    
    // Test getting price data
    console.log('Fetching AAPL price...');
    const priceData = await getPrice('AAPL');
    console.log('Price data:', priceData);
    
    console.log('✅ TwelveData service test completed successfully!');
    
  } catch (error) {
    console.error('❌ Service test error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  }
}

testService();