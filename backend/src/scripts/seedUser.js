require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'user@sitebuilder.com' });
    
    if (existingUser) {
      console.log('⚠️  User already exists, updating password...');
      existingUser.password = 'user123';
      await existingUser.save();
      console.log('✅ User password updated');
    } else {
      // Create the user
      const user = await User.create({
        name: 'User',
        email: 'user@sitebuilder.com',
        password: 'user123',
        isEmailVerified: true,
        isActive: true,
      });
      console.log('✅ User created successfully');
      console.log('   Email: user@sitebuilder.com');
      console.log('   Password: user123');
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedUser();
