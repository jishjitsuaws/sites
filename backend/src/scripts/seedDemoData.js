// backend/src/scripts/seedDemoData.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../..', '.env') });

const User = require('../models/User');
const Site = require('../models/Site');
const Page = require('../models/Page');
const Theme = require('../models/Theme');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms-platform';

async function seedDemoData() {
  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Site.deleteMany({});
    await Page.deleteMany({});
    await Theme.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create demo user
    console.log('👤 Creating demo user...');
    const hashedPassword = await bcrypt.hash('user123', 12);
    const user = await User.create({
      name: 'User',
      email: 'user@example.com',
      password: hashedPassword,
      isActive: true,
      role: 'user',
      isEmailVerified: true,
      subscriptionPlan: 'free',
      storageUsed: 0,
      storageLimit: 1073741824
    });
    console.log('✅ Demo user created');
    console.log('📧 Email: user');
    console.log('🔑 Password: user123');

    // Create demo themes
    console.log('🎨 Creating demo themes...');
    const modernTheme = await Theme.create({
      name: 'Modern Blue',
      description: 'A clean and modern theme with blue accents',
      category: 'modern',
      colors: {
        primary: '#2563eb',
        secondary: '#3b82f6',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
        mono: 'JetBrains Mono'
      },
      spacing: {
        baseUnit: 4,
        containerPadding: 16,
        sectionGap: 32
      },
      borderRadius: {
        small: 4,
        medium: 8,
        large: 16
      },
      effects: {
        shadow: 'rgba(0, 0, 0, 0.1)',
        shadowIntensity: 0.1,
        animation: true,
        transitionSpeed: 300
      }
    });

    const darkTheme = await Theme.create({
      name: 'Dark Elegance',
      description: 'A sophisticated dark theme',
      category: 'dark',
      colors: {
        primary: '#8b5cf6',
        secondary: '#a78bfa',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#94a3b8',
        border: '#334155',
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b'
      },
      fonts: {
        heading: 'Poppins',
        body: 'Roboto',
        mono: 'Fira Code'
      },
      spacing: {
        baseUnit: 4,
        containerPadding: 20,
        sectionGap: 40
      },
      borderRadius: {
        small: 6,
        medium: 12,
        large: 24
      },
      effects: {
        shadow: 'rgba(0, 0, 0, 0.3)',
        shadowIntensity: 0.3,
        animation: true,
        transitionSpeed: 250
      }
    });

    const minimalTheme = await Theme.create({
      name: 'Minimal Light',
      description: 'A minimalist light theme',
      category: 'minimal',
      colors: {
        primary: '#000000',
        secondary: '#404040',
        background: '#ffffff',
        surface: '#fafafa',
        text: '#000000',
        textSecondary: '#666666',
        border: '#e0e0e0',
        error: '#d32f2f',
        success: '#388e3c',
        warning: '#f57c00'
      },
      fonts: {
        heading: 'Helvetica',
        body: 'Arial',
        mono: 'Courier'
      },
      spacing: {
        baseUnit: 8,
        containerPadding: 24,
        sectionGap: 48
      },
      borderRadius: {
        small: 0,
        medium: 2,
        large: 4
      },
      effects: {
        shadow: 'rgba(0, 0, 0, 0.05)',
        shadowIntensity: 0.05,
        animation: false,
        transitionSpeed: 200
      }
    });

    console.log('✅ Demo themes created:', modernTheme.name, darkTheme.name, minimalTheme.name);

    // Create demo site
    console.log('🌐 Creating demo site...');
    const site = await Site.create({
      userId: user._id,
      siteName: 'Demo Portfolio',
      subdomain: 'demo-portfolio',
      description: 'A beautiful portfolio website showcasing projects and skills',
      themeId: modernTheme._id,
      isPublished: true,
      analytics: {
        googleAnalyticsId: '',
        facebookPixelId: ''
      },
      seo: {
        title: 'Demo Portfolio - Showcasing Amazing Work',
        description: 'Professional portfolio website built with our CMS platform',
        keywords: ['portfolio', 'web design', 'projects', 'showcase'],
        ogImage: ''
      }
    });
    console.log('✅ Demo site created:', site.subdomain);

    // Create demo pages
    console.log('📄 Creating demo pages...');
    
    // Home page
    const homePage = await Page.create({
      siteId: site._id,
      pageName: 'Home',
      slug: '',
      content: [
        {
          id: uuidv4(),
          type: 'banner',
          props: {
            heading: 'Welcome to My Portfolio',
            subheading: 'Creative Designer & Developer',
            buttonText: 'View My Work',
            buttonLink: '/projects',
            backgroundImage: '',
            backgroundColor: '#2563eb',
            textColor: '#ffffff',
            height: '500px'
          },
          order: 0
        },
        {
          id: uuidv4(),
          type: 'heading',
          props: {
            text: 'About Me',
            level: 2,
            align: 'center',
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1e293b'
          },
          order: 1
        },
        {
          id: uuidv4(),
          type: 'text',
          props: {
            text: 'I am a passionate designer and developer with 5+ years of experience creating beautiful and functional websites. My work focuses on user experience, clean design, and modern technologies.',
            align: 'center',
            fontSize: '18px',
            color: '#64748b'
          },
          order: 2
        },
        {
          id: uuidv4(),
          type: 'divider',
          props: {
            width: '100%',
            height: '2px',
            color: '#e2e8f0',
            margin: '40px 0'
          },
          order: 3
        },
        {
          id: uuidv4(),
          type: 'heading',
          props: {
            text: 'My Skills',
            level: 2,
            align: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1e293b'
          },
          order: 4
        },
        {
          id: uuidv4(),
          type: 'bullet-list',
          props: {
            items: [
              'Web Design & UI/UX',
              'Frontend Development (React, Next.js)',
              'Backend Development (Node.js, Express)',
              'Database Design (MongoDB, PostgreSQL)',
              'Responsive Design & Mobile-First Approach'
            ],
            style: 'disc',
            color: '#1e293b'
          },
          order: 5
        }
      ],
      isHome: true,
      isPublished: true,
      order: 0,
      settings: {
        showInNavbar: true,
        navbarLabel: 'Home',
        requireAuth: false
      }
    });

    // About page
    const aboutPage = await Page.create({
      siteId: site._id,
      pageName: 'About',
      slug: 'about',
      content: [
        {
          id: uuidv4(),
          type: 'heading',
          props: {
            text: 'About Me',
            level: 1,
            align: 'center',
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#1e293b'
          },
          order: 0
        },
        {
          id: uuidv4(),
          type: 'text',
          props: {
            text: 'Hello! I\'m a creative professional specializing in web design and development. With a passion for crafting exceptional digital experiences, I help businesses and individuals bring their ideas to life.',
            align: 'left',
            fontSize: '18px',
            color: '#64748b'
          },
          order: 1
        },
        {
          id: uuidv4(),
          type: 'heading',
          props: {
            text: 'My Journey',
            level: 3,
            align: 'left',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1e293b'
          },
          order: 2
        },
        {
          id: uuidv4(),
          type: 'text',
          props: {
            text: 'I started my career in web development in 2018 and have since worked with dozens of clients ranging from startups to established businesses. My approach combines technical expertise with creative problem-solving.',
            align: 'left',
            fontSize: '16px',
            color: '#64748b'
          },
          order: 3
        }
      ],
      isHome: false,
      isPublished: true,
      order: 1,
      settings: {
        showInNavbar: true,
        navbarLabel: 'About',
        requireAuth: false
      }
    });

    // Contact page
    const contactPage = await Page.create({
      siteId: site._id,
      pageName: 'Contact',
      slug: 'contact',
      content: [
        {
          id: uuidv4(),
          type: 'heading',
          props: {
            text: 'Get In Touch',
            level: 1,
            align: 'center',
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#1e293b'
          },
          order: 0
        },
        {
          id: uuidv4(),
          type: 'text',
          props: {
            text: 'Have a project in mind or just want to say hello? Feel free to reach out!',
            align: 'center',
            fontSize: '18px',
            color: '#64748b'
          },
          order: 1
        },
        {
          id: uuidv4(),
          type: 'button',
          props: {
            text: 'Email Me',
            link: 'mailto:demo@example.com',
            variant: 'primary',
            size: 'large',
            align: 'center',
            backgroundColor: '#2563eb',
            textColor: '#ffffff'
          },
          order: 2
        }
      ],
      isHome: false,
      isPublished: true,
      order: 2,
      settings: {
        showInNavbar: true,
        navbarLabel: 'Contact',
        requireAuth: false
      }
    });

    console.log('✅ Demo pages created:', homePage.pageName, aboutPage.pageName, contactPage.pageName);

    // Update site with pages
    site.pages = [homePage._id, aboutPage._id, contactPage._id];
    await site.save();

    console.log('\n🎉 Demo data seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Users: 1 (${user.email})`);
    console.log(`   Themes: 3 (${modernTheme.name}, ${darkTheme.name}, ${minimalTheme.name})`);
    console.log(`   Sites: 1 (${site.subdomain})`);
    console.log(`   Pages: 3 (Home, About, Contact)`);
    console.log('\n🔐 Login credentials:');
    console.log(`   Username: user`);
    console.log(`   Password: user123`);
    console.log('\n🌐 Access your site:');
    console.log(`   Published site: http://10.244.0.147:3000/site/${site.subdomain}`);
    console.log(`   Editor: http://10.244.0.147:3000/editor/${site._id}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the seed function
seedDemoData();
