#!/usr/bin/env tsx

/**
 * FlowdeX Setup Verification Script
 * 
 * This script verifies that all required services are properly
 * configured and integrated with the FlowdeX application.
 */

import dotenv from 'dotenv';
dotenv.config();

interface ServiceStatus {
  name: string;
  status: 'ok' | 'error' | 'not-configured';
  message: string;
  details?: any;
}

async function verifyDatabase(): Promise<ServiceStatus> {
  try {
    // Dynamic import to avoid errors if not installed
    const { pool } = await import('./server/db');
    
    if (!process.env.DATABASE_URL) {
      return {
        name: 'Database',
        status: 'not-configured',
        message: 'DATABASE_URL not set in environment variables'
      };
    }
    
    // Test connection
    await pool.query('SELECT 1');
    
    return {
      name: 'Database',
      status: 'ok',
      message: 'Connected successfully',
      details: {
        url: process.env.DATABASE_URL.replace(/:\/\/.*@/, '://***:***@') // Hide credentials
      }
    };
  } catch (error: any) {
    return {
      name: 'Database',
      status: 'error',
      message: error.message
    };
  }
}

async function verifyTwelveData(): Promise<ServiceStatus> {
  try {
    if (!process.env.TWELVEDATA_API_KEY) {
      return {
        name: 'TwelveData API',
        status: 'not-configured',
        message: 'TWELVEDATA_API_KEY not set in environment variables'
      };
    }
    
    // Dynamic import to avoid errors if not installed
    const twelveDataService = await import('./server/services/twelveDataService');
    
    // Test API call
    const data = await twelveDataService.getTimeSeries('EURUSD', '1min', 2);
    
    return {
      name: 'TwelveData API',
      status: 'ok',
      message: 'API key valid',
      details: {
        symbol: data.meta?.symbol || 'EURUSD',
        interval: data.meta?.interval || '1min'
      }
    };
  } catch (error: any) {
    return {
      name: 'TwelveData API',
      status: 'error',
      message: error.message
    };
  }
}

async function verifyStripe(): Promise<ServiceStatus> {
  try {
    // Dynamic import to avoid errors if not installed
    const stripeService = await import('./server/services/stripeService');
    
    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        name: 'Stripe',
        status: 'not-configured',
        message: 'STRIPE_SECRET_KEY not set in environment variables'
      };
    }
    
    // Just verify the module loads
    return {
      name: 'Stripe',
      status: 'ok',
      message: 'Service loaded successfully',
      details: {
        plans: stripeService.subscriptionPlans.length
      }
    };
  } catch (error: any) {
    return {
      name: 'Stripe',
      status: 'error',
      message: error.message
    };
  }
}

async function verifyS3(): Promise<ServiceStatus> {
  try {
    // Dynamic import to avoid errors if not installed
    const s3Service = await import('./server/services/s3Service');
    
    // Check if required environment variables are set
    const missingVars = [];
    if (!process.env.AWS_ACCESS_KEY_ID) missingVars.push('AWS_ACCESS_KEY_ID');
    if (!process.env.AWS_SECRET_ACCESS_KEY) missingVars.push('AWS_SECRET_ACCESS_KEY');
    if (!process.env.AWS_REGION) missingVars.push('AWS_REGION');
    if (!process.env.AWS_S3_BUCKET_NAME) missingVars.push('AWS_S3_BUCKET_NAME');
    
    if (missingVars.length > 0) {
      return {
        name: 'AWS S3',
        status: 'not-configured',
        message: `Missing environment variables: ${missingVars.join(', ')}`
      };
    }
    
    // Just verify the module loads
    return {
      name: 'AWS S3',
      status: 'ok',
      message: 'Service loaded successfully',
      details: {
        bucket: process.env.AWS_S3_BUCKET_NAME
      }
    };
  } catch (error: any) {
    return {
      name: 'AWS S3',
      status: 'error',
      message: error.message
    };
  }
}

async function main() {
  console.log('FlowdeX Setup Verification\n');
  console.log('=========================\n');
  
  // Verify all services
  const services = [
    verifyDatabase(),
    verifyTwelveData(),
    verifyStripe(),
    verifyS3()
  ];
  
  const results = await Promise.all(services);
  
  // Display results
  let allOk = true;
  
  for (const result of results) {
    const statusIcon = 
      result.status === 'ok' ? '✅' : 
      result.status === 'error' ? '❌' : '⚠️';
    
    console.log(`${statusIcon} ${result.name}: ${result.message}`);
    
    if (result.details) {
      for (const [key, value] of Object.entries(result.details)) {
        console.log(`   ${key}: ${value}`);
      }
    }
    
    console.log('');
    
    if (result.status !== 'ok') {
      allOk = false;
    }
  }
  
  if (allOk) {
    console.log('🎉 All services are properly configured!');
    console.log('\nNext steps:');
    console.log('1. Run database migrations: npm run db:push');
    console.log('2. Start the application: npm run dev');
  } else {
    console.log('⚠️  Some services need attention.');
    console.log('\nCheck the SETUP_GUIDE.md for detailed configuration instructions.');
  }
}

main();