import { storage } from './server/storage';

async function testStorageDirect() {
  try {
    console.log('Testing storage implementation directly...');
    
    const testData = {
      name: 'Direct Test',
      pair: 'EURUSD',
      startingBalance: 1000,
      currentBalance: 1000,
      startDate: new Date(),
      description: 'Testing direct storage call'
    };
    
    console.log('Test data:', testData);
    
    const result = await storage.createTradingSession('8aad9c5e-6649-4570-8bac-8c89b4cc9819', testData);
    console.log('✅ Storage call successful');
    console.log('Result:', result);
    
    // Clean up
    if (result?.id) {
      const deleted = await storage.deleteTradingSession(result.id, '8aad9c5e-6649-4570-8bac-8c89b4cc9819');
      if (deleted) {
        console.log('✅ Test session deleted');
      }
    }
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
  }
}

testStorageDirect();