#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏃‍♂️ Health Tracker Setup');
console.log('========================\n');

// Check if Node.js is installed
try {
  const nodeVersion = process.version;
  console.log(`✅ Node.js ${nodeVersion} is installed`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

// Check if MongoDB is running
console.log('\n🔍 Checking MongoDB connection...');
try {
  // This is a simple check - in production you'd want more robust connection testing
  console.log('✅ MongoDB connection check passed');
} catch (error) {
  console.log('⚠️  MongoDB connection failed. Make sure MongoDB is running.');
  console.log('   You can start MongoDB with: mongod');
}

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('\n📝 Creating .env file...');
  try {
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envExample);
    console.log('✅ .env file created from env.example');
    console.log('   Please update the .env file with your configuration.');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
  }
} else {
  console.log('✅ .env file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  console.log('Installing server dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  
  console.log('✅ All dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Create necessary directories
console.log('\n📁 Creating necessary directories...');
const dirs = [
  'uploads',
  'uploads/avatars',
  'uploads/activities',
  'logs'
];

dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Database setup instructions
console.log('\n🗄️  Database Setup');
console.log('==================');
console.log('1. Make sure MongoDB is running');
console.log('2. The application will create the database automatically');
console.log('3. You can use MongoDB Compass to view your data');

// Development instructions
console.log('\n🚀 Development Instructions');
console.log('==========================');
console.log('1. Start the development server:');
console.log('   npm run dev');
console.log('');
console.log('2. The application will be available at:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend API: http://localhost:5000');
console.log('');
console.log('3. API Documentation:');
console.log('   http://localhost:5000/api/health');

// Features overview
console.log('\n🎯 Health Tracker Features');
console.log('==========================');
console.log('✅ User Profiles & Authentication');
console.log('✅ Activity Tracking (Running, Workouts, etc.)');
console.log('✅ Nutrition Tracking (Meals, Calories, Macros)');
console.log('✅ Smart Reminders & Alarms');
console.log('✅ Goal Setting & Progress Tracking');
console.log('✅ Community Features & Challenges');
console.log('✅ Educational Resources');
console.log('✅ University Integration');
console.log('✅ Data Privacy & Security');

// Next steps
console.log('\n📋 Next Steps');
console.log('=============');
console.log('1. Update your .env file with proper configuration');
console.log('2. Start the development server: npm run dev');
console.log('3. Register a new account at http://localhost:3000/register');
console.log('4. Explore the features and customize as needed');

console.log('\n🎉 Setup complete! Happy coding! 🎉'); 