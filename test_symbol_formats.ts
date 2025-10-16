// Test different symbol formats for Twelve Data
import { getTimeSeries } from './server/services/twelveDataService';

async function testSymbolFormats() {
  console.log('🔍 Testing different symbol formats...');
  
  // Set the API key
  process.env.TWELVEDATA_API_KEY = '466bab77034f4e5d8c0235f32130817b';
  
  const symbolTests = [
    // EUR/USD variations
    { symbol: 'EURUSD', description: 'EUR/USD (no separator)' },
    { symbol: 'EUR/USD', description: 'EUR/USD (with slash)' },
    { symbol: 'EURUSD=X', description: 'EUR/USD (Yahoo format)' },
    
    // GER40/DAX variations  
    { symbol: 'GER40', description: 'GER40 (direct)' },
    { symbol: 'DAX', description: 'DAX (direct)' },
    { symbol: 'GER30', description: 'GER30 (alternative)' },
    { symbol: 'DE40', description: 'DE40 (alternative)' },
    
    // Try some known working symbols
    { symbol: 'AAPL', description: 'Apple Stock (test)' },
    { symbol: 'MSFT', description: 'Microsoft Stock (test)' },
  ];
  
  for (const test of symbolTests) {
    try {
      console.log(`\n📊 Testing: ${test.description}`);
      const result = await getTimeSeries(test.symbol, '1day', 5);
      
      if (result.status === 'ok' && result.values && result.values.length > 0) {
        console.log(`✅ SUCCESS: ${test.symbol} - Got ${result.values.length} data points`);
        console.log(`   Latest: ${result.values[0].datetime} - Close: ${result.values[0].close}`);
      } else {
        console.log(`❌ FAILED: ${test.symbol} - ${result.message || 'No data'}`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${test.symbol} - ${error}`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

testSymbolFormats();