#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask a question and return a promise
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to update .env file
function updateEnvFile(updates) {
  const envPath = path.join(__dirname, '..', '.env');
  
  // Read current .env file
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Apply updates
  for (const [key, value] of Object.entries(updates)) {
    if (value) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    }
  }
  
  // Write updated content
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file updated successfully');
}

// Main setup wizard
async function runSetupWizard() {
  console.log(`
FlowdeX Setup Wizard
===================

This wizard will help you configure all required services for FlowdeX.
You'll need to provide credentials for:

1. PostgreSQL Database
2. TwelveData API (Market Data)
3. Stripe (Payments)
4. AWS S3 (File Storage)

Let's get started!
`);
  
  // Database Configuration
  console.log('\n--- Database Configuration ---');
  const dbChoice = await askQuestion('Do you want to use a local PostgreSQL installation or a cloud database? (local/cloud): ');
  
  let databaseUrl = '';
  if (dbChoice.toLowerCase() === 'local') {
    const dbUser = await askQuestion('PostgreSQL username (default: postgres): ') || 'postgres';
    const dbPass = await askQuestion('PostgreSQL password: ');
    const dbHost = await askQuestion('Database host (default: localhost): ') || 'localhost';
    const dbPort = await askQuestion('Database port (default: 5432): ') || '5432';
    const dbName = await askQuestion('Database name (default: flowdex): ') || 'flowdex';
    
    databaseUrl = `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;
  } else {
    databaseUrl = await askQuestion('Enter your cloud database connection string: ');
  }
  
  // TwelveData API
  console.log('\n--- TwelveData API Configuration ---');
  console.log('Get your free API key at: https://twelvedata.com/');
  const twelveDataKey = await askQuestion('Enter your TwelveData API key: ');
  
  // Stripe Configuration
  console.log('\n--- Stripe Configuration ---');
  console.log('Get your API keys at: https://dashboard.stripe.com/test/apikeys');
  const stripePublishable = await askQuestion('Enter your Stripe Publishable Key (pk_test_...): ');
  const stripeSecret = await askQuestion('Enter your Stripe Secret Key (sk_test_...): ');
  
  // AWS S3 Configuration
  console.log('\n--- AWS S3 Configuration ---');
  console.log('Create an S3 bucket and IAM user at: https://aws.amazon.com/');
  const awsAccessKeyId = await askQuestion('Enter your AWS Access Key ID: ');
  const awsSecretAccessKey = await askQuestion('Enter your AWS Secret Access Key: ');
  const awsRegion = await askQuestion('Enter your AWS Region (default: us-east-1): ') || 'us-east-1';
  const awsBucketName = await askQuestion('Enter your S3 Bucket Name: ');
  
  // Session Secret
  console.log('\n--- Session Configuration ---');
  const sessionSecret = await askQuestion('Enter a session secret (or press Enter for default): ') || 'your_session_secret_key_here_change_this_in_production';
  
  // Update .env file
  console.log('\n--- Updating Configuration ---');
  updateEnvFile({
    DATABASE_URL: databaseUrl,
    TWELVEDATA_API_KEY: twelveDataKey,
    STRIPE_PUBLISHABLE_KEY: stripePublishable,
    STRIPE_SECRET_KEY: stripeSecret,
    AWS_ACCESS_KEY_ID: awsAccessKeyId,
    AWS_SECRET_ACCESS_KEY: awsSecretAccessKey,
    AWS_REGION: awsRegion,
    AWS_S3_BUCKET_NAME: awsBucketName,
    SESSION_SECRET: sessionSecret
  });
  
  // Show next steps
  console.log(`
🎉 Setup Complete!

Next steps:
1. Run database migration: npm run db:push
2. Verify connections: npm run verify:setup
3. Start the application: npm run dev

For detailed instructions, see SETUP_GUIDE.md
`);
  
  rl.close();
}

// Run the setup wizard
runSetupWizard().catch(console.error);