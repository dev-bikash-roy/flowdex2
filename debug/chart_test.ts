import { createChart } from 'lightweight-charts';

// Create a simple test to see what methods are available
const container = document.createElement('div');
container.style.width = '800px';
container.style.height = '600px';

document.body.appendChild(container);

const chart = createChart(container, {
  width: 800,
  height: 600,
  layout: {
    background: { color: '#131722' },
    textColor: '#d1d4dc',
  },
  grid: {
    vertLines: { color: '#2a2e39' },
    horzLines: { color: '#2a2e39' },
  },
  timeScale: { timeVisible: true },
});

console.log('Chart object methods:');
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(chart)));

// Try to create a candlestick series
try {
  // @ts-ignore
  const series = chart.addCandlestickSeries();
  console.log('Successfully created candlestick series');
  console.log('Series methods:');
  console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(series)));
} catch (error) {
  console.error('Error creating candlestick series:', error);
}

// Clean up
chart.remove();
container.remove();