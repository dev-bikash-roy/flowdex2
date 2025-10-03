import dotenv from 'dotenv';
dotenv.config();

console.log('Testing TwelveData API connection...');
console.log('API Key:', process.env.TWELVEDATA_API_KEY ? 'Present' : 'Missing');
console.log('API Key Length:', process.env.TWELVEDATA_API_KEY?.length);

if (!process.env.TWELVEDATA_API_KEY) {
  console.error('TWELVEDATA_API_KEY is not set in environment variables');
  process.exit(1);
}

// Test TwelveData API directly
import twelvedata from 'twelvedata';

try {
  console.log('Initializing TwelveData client...');
  const td = twelvedata({
    key: process.env.TWELVEDATA_API_KEY,
    timezone: 'UTC'
  });
  
  console.log('Client initialized successfully');
  
  // Test a simple API call
  console.log('Fetching EURUSD data...');
  td.timeSeries({
    symbol: 'EURUSD',
    interval: '1h',
    outputsize: 10,
    format: 'json'
  }).then((response: any) => {
    console.log('API Response:');
    console.log('Status:', response.status);
    console.log('Meta:', response.meta);
    console.log('Values count:', response.values?.length);
    if (response.values && response.values.length > 0) {
      console.log('First data point:', response.values[0]);
    }
  }).catch((error: any) => {
    console.error('API Error:', error);
  });
  
} catch (error) {
  console.error('Client initialization error:', error);
}