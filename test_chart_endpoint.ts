import fetch from 'node-fetch';

async function testChartEndpoint() {
  console.log('Testing chart data endpoint...');
  
  try {
    // Test the chart data endpoint
    const response = await fetch('http://localhost:5000/api/chart-data?symbol=EURUSD&interval=1h&limit=100');
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Chart data received:');
      console.log(`Symbol: ${data.symbol}`);
      console.log(`Interval: ${data.interval}`);
      console.log(`Data points: ${data.data.length}`);
      console.log('First data point:', data.data[0]);
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
  } catch (error) {
    console.error('Error testing chart endpoint:', error);
  }
}

testChartEndpoint();