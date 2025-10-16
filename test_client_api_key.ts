// Test script to verify client's Twelve Data API key
import { getTimeSeries, getPrice } from './server/services/twelveDataService';

async function testClientApiKey() {
  console.log('🔍 Testing client\'s Twelve Data API key...');
  console.log('API Key:', process.env.TWELVEDATA_API_KEY?.substring(0, 8) + '...');
  
  try {
    // Test 1: Get EUR/USD data
    console.log('\n📊 Test 1: Fetching EUR/USD time series...');
    const eurusdData = await getTimeSeries('EURUSD', '1h', 10);
    console.log('EUR/USD Status:', eurusdData.status);
    if (eurusdData.values) {
      console.log('EUR/USD Data Points:', eurusdData.values.length);
      console.log('Latest EUR/USD:', eurusdData.values[0]);
    }
    
    // Test 2: Get GER40 (DAX) data
    console.log('\n📈 Test 2: Fetching GER40 (DAX) time series...');
    const ger40Data = await getTimeSeries('GER40', '1h', 10);
    console.log('GER40 Status:', ger40Data.status);
    if (ger40Data.values) {
      console.log('GER40 Data Points:', ger40Data.values.length);
      console.log('Latest GER40:', ger40Data.values[0]);
    }
    
    // Test 3: Get real-time price
    console.log('\n💰 Test 3: Fetching EUR/USD real-time price...');
    const priceData = await getPrice('EURUSD');
    console.log('EUR/USD Price:', priceData);
    
    console.log('\n✅ API Key test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ API Key test failed:', error);
  }
}

// Set the API key for testing
process.env.TWELVEDATA_API_KEY = '466bab77034f4e5d8c0235f32130817b';

testClientApiKey();