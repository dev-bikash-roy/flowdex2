// Test the corrected symbol formats
import { getTimeSeries } from './server/services/twelveDataService';

async function testCorrectedSymbols() {
  console.log('🔍 Testing corrected symbols for client...');
  
  // Set the API key
  process.env.TWELVEDATA_API_KEY = '466bab77034f4e5d8c0235f32130817b';
  
  const tests = [
    { symbol: 'EUR/USD', description: 'Euro vs US Dollar' },
    { symbol: 'DAX', description: 'DAX Index (Germany)' },
  ];
  
  for (const test of tests) {
    try {
      console.log(`\n📊 Testing: ${test.description}`);
      const result = await getTimeSeries(test.symbol, '1h', 5);
      
      if (result.status === 'ok' && result.values && result.values.length > 0) {
        console.log(`✅ SUCCESS: ${test.symbol}`);
        console.log(`   Data Points: ${result.values.length}`);
        console.log(`   Latest: ${result.values[0].datetime}`);
        console.log(`   OHLC: O:${result.values[0].open} H:${result.values[0].high} L:${result.values[0].low} C:${result.values[0].close}`);
      } else {
        console.log(`❌ FAILED: ${test.symbol} - ${result.message || 'No data'}`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${test.symbol} - ${error}`);
    }
    
    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 8000)); // 8 second delay for rate limit
  }
  
  console.log('\n🎉 Symbol testing completed!');
}

testCorrectedSymbols();