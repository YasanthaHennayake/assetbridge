/**
 * Database Seed Script
 *
 * Seeds the database with initial data:
 * - Admin user for testing and development
 * - Additional test users (optional)
 *
 * Usage:
 *   npm run seed              # Seed with default admin
 *   npm run seed:reset        # Drop all data and reseed
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { hashPassword } from '../utils/password';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/assetbridge';

/**
 * Admin user credentials
 */
const ADMIN_USER = {
  name: 'Admin User',
  email: 'admin@assetbridge.com',
  password: 'Admin123!', // Plain text - will be hashed
  mustChangePassword: false,
};

/**
 * Additional test users (optional)
 */
const TEST_USERS = [
  {
    name: 'John Doe',
    email: 'john.doe@assetbridge.com',
    password: 'Test123!',
    mustChangePassword: false,
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@assetbridge.com',
    password: 'Generated123!',
    mustChangePassword: true, // Simulates first-time login
  },
];

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}\n`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
  await mongoose.disconnect();
  console.log('\n✅ Disconnected from MongoDB');
}

/**
 * Check if user already exists
 */
async function userExists(email: string): Promise<boolean> {
  const user = await User.findOne({ email });
  return !!user;
}

/**
 * Create a user with hashed password
 */
async function createUser(userData: {
  name: string;
  email: string;
  password: string;
  mustChangePassword: boolean;
}) {
  const hashedPassword = await hashPassword(userData.password);

  const user = new User({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    mustChangePassword: userData.mustChangePassword,
  });

  await user.save();
  return user;
}

/**
 * Seed admin user
 */
async function seedAdmin() {
  console.log('👤 Seeding Admin User...');

  if (await userExists(ADMIN_USER.email)) {
    console.log(`   ⚠️  Admin user already exists: ${ADMIN_USER.email}`);
    console.log(`   Skipping admin creation\n`);
    return;
  }

  const admin = await createUser(ADMIN_USER);
  console.log(`   ✅ Admin user created successfully`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password: ${ADMIN_USER.password}`);
  console.log(`   Name: ${admin.name}\n`);
}

/**
 * Seed test users (optional)
 */
async function seedTestUsers() {
  console.log('👥 Seeding Test Users...');

  let created = 0;
  let skipped = 0;

  for (const userData of TEST_USERS) {
    if (await userExists(userData.email)) {
      console.log(`   ⚠️  User already exists: ${userData.email}`);
      skipped++;
      continue;
    }

    const user = await createUser(userData);
    console.log(`   ✅ Created: ${user.email}`);
    created++;
  }

  console.log(`\n   Summary: ${created} created, ${skipped} skipped\n`);
}

/**
 * Drop all data (reset database)
 */
async function resetDatabase() {
  console.log('🗑️  Resetting Database...');

  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
    console.log(`   ✅ Cleared collection: ${collection.collectionName}`);
  }

  console.log('');
}

/**
 * Main seed function
 */
async function seed(reset: boolean = false) {
  console.log('\n🌱 AssetBridge Database Seeder\n');
  console.log('='.repeat(50));
  console.log('');

  try {
    await connectDB();

    if (reset) {
      await resetDatabase();
    }

    await seedAdmin();
    await seedTestUsers();

    console.log('='.repeat(50));
    console.log('\n✅ Seeding completed successfully!\n');
    console.log('You can now log in with:');
    console.log(`   Email: ${ADMIN_USER.email}`);
    console.log(`   Password: ${ADMIN_USER.password}\n`);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

/**
 * Parse command line arguments
 */
const args = process.argv.slice(2);
const shouldReset = args.includes('--reset') || args.includes('-r');

// Run seed
seed(shouldReset);
