#!/usr/bin/env node

// This script provides guidance for setting up the database
console.log(`
FlowdeX Database Setup Helper
============================

This script will help you set up your PostgreSQL database for FlowdeX.

Step 1: Install PostgreSQL
- Download from: https://www.postgresql.org/download/
- Follow the installation instructions for your operating system
- Remember the password you set for the postgres user

Step 2: Create the database
Connect to PostgreSQL and run:
  CREATE DATABASE flowdex;

Step 3: Update your .env file
Open the .env file in your project root and update the DATABASE_URL:
  DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/flowdex

Step 4: Run the schema migration
In your project directory, run:
  npm run db:push

For more detailed instructions, see SETUP_GUIDE.md
`);