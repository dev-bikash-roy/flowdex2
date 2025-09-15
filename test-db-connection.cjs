const { Pool } = require('pg');

// Try to connect with the current DATABASE_URL from .env
require('dotenv').config();

console.log('Testing database connection with URL:', process.env.DATABASE_URL.replace(/:\/\/.*@/, '://***:***@'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query('SELECT 1', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.log('\nPossible causes:');
      console.log('1. PostgreSQL is not running');
      console.log('2. Incorrect host or port in DATABASE_URL');
      console.log('3. PostgreSQL is not installed');
    } else if (err.code === '3D000') {
      console.log('\nDatabase does not exist. You need to create it first.');
    } else if (err.code === '28P01') {
      console.log('\nAuthentication failed. Check your username and password.');
    }
  } else {
    console.log('Database connection successful!');
    console.log('Result:', res.rows);
  }
  
  pool.end();
});