#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to check if a command exists
function commandExists(command) {
  try {
    execSync(`where ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Function to check if a service is configured
function checkService(envVar, serviceName) {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    return { configured: false, message: '.env file not found' };
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const regex = new RegExp(`^${envVar}=(.*)$`, 'm');
  const match = envContent.match(regex);
  
  if (!match || !match[1] || match[1].includes('your_') || match[1].includes('localhost')) {
    return { configured: false, message: `${serviceName} not properly configured` };
  }
  
  return { configured: true, message: `${serviceName} configured` };
}

// Function to check database connection
function checkDatabase() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    return { status: 'error', message: '.env file not found' };
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const regex = /^DATABASE_URL=(.*)$/m;
  const match = envContent.match(regex);
  
  if (!match || !match[1]) {
    return { status: 'error', message: 'DATABASE_URL not set' };
  }
  
  // Check if it's still the default placeholder
  if (match[1].includes('localhost:5432/flowdex') || match[1].includes('user:password')) {
    return { status: 'warning', message: 'DATABASE_URL uses placeholder values' };
  }
  
  return { status: 'ok', message: 'Database URL configured' };
}

// Main health check
function runHealthCheck() {
  console.log('FlowdeX Health Check');
  console.log('===================\n');
  
  // Check Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js: ${nodeVersion}`);
  } catch {
    console.log('❌ Node.js: Not installed');
  }
  
  // Check npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm: ${npmVersion}\n`);
  } catch {
    console.log('❌ npm: Not installed\n');
  }
  
  // Check environment file
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file: Found');
  } else {
    console.log('❌ .env file: Missing');
    console.log('   Run: cp .env.example .env\n');
    return;
  }
  
  // Check services
  const services = [
    { envVar: 'DATABASE_URL', name: 'Database' },
    { envVar: 'TWELVEDATA_API_KEY', name: 'TwelveData API' },
    { envVar: 'STRIPE_SECRET_KEY', name: 'Stripe' },
    { envVar: 'AWS_ACCESS_KEY_ID', name: 'AWS S3' }
  ];
  
  let allConfigured = true;
  
  for (const service of services) {
    const result = checkService(service.envVar, service.name);
    if (result.configured) {
      console.log(`✅ ${service.name}: Configured`);
    } else {
      console.log(`❌ ${service.name}: Not configured`);
      allConfigured = false;
    }
  }
  
  // Database specific check
  const dbCheck = checkDatabase();
  if (dbCheck.status === 'warning') {
    console.log(`⚠️  ${dbCheck.message}`);
    allConfigured = false;
  }
  
  console.log('');
  
  if (allConfigured) {
    console.log('🎉 All services appear to be configured!');
    console.log('\nNext steps:');
    console.log('1. Run database migration: npm run db:push');
    console.log('2. Verify connections: npm run verify:setup');
    console.log('3. Start the application: npm run dev');
  } else {
    console.log('⚠️  Some services need configuration.');
    console.log('\nRun the setup wizard for guided configuration:');
    console.log('npm run setup:wizard');
    console.log('\nOr manually edit the .env file with your credentials.');
  }
}

// Run health check
runHealthCheck();