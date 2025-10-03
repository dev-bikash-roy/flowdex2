import dotenv from 'dotenv';
dotenv.config();

import { db } from "./server/db.js";
import { users } from "./shared/schema.js";
import { eq } from "drizzle-orm";

async function checkUser() {
  try {
    console.log('Checking user in database...');
    
    const [user] = await db.select().from(users).where(eq(users.email, 'testuser2@example.com'));
    
    if (user) {
      console.log('User found:', user);
      console.log('First Name:', user.firstName);
      console.log('Last Name:', user.lastName);
      console.log('All properties:', Object.keys(user));
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error checking user:', error);
  }
}

checkUser();