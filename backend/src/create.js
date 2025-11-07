// backend/src/scripts/seedDemoData.js

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../..', '.env') });

const User = require('../models/User');
const Site = require('../models/Site');
const Page = require('../models/Page');
const Theme = require('../models/Theme');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms-platform';

async function seed() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Clear existing data
  await User.deleteMany({});
  await Site.deleteMany({});
  await Page.deleteMany({});
  await Theme.deleteMany({});

  // Create demo user
  const user = await User.create({
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'Password123!', // Should be hashed in production
    isActive: true,
    role: 'user'
  });

  // Create demo theme
  const theme = await Theme.create({
    name: 'Default Theme',
    colors: { primary: '#2563eb', text: '#222', background: '#fff' },
    fonts: { heading: 'Inter', body: 'Inter' },
    description: 'A clean default theme'
  });

  // Create demo site
  const site = await Site.create({
    userId: user._id,
    siteName: 'Demo Site',
    subdomain: 'demo',
    description: 'A demo site for testing',
    themeId: theme._id,
    isPublished: true
  });

  // Create demo page
  const page = await Page.create({
    siteId: site._id,
    pageName: 'Home',
    slug: '/',
    content: [
      { type: 'heading', props: { text: 'Welcome to Demo Site!' } },
      { type: 'text', props: { text: 'This is a sample page.' } }
    ],
    isHome: true,
    order: 0
  });

  // Link page to site
  site.pages = [page._id];
  await site.save();

  console.log('✅ Demo data seeded successfully!');
  mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Error seeding demo data:', err);
  process.exit(1);
});
