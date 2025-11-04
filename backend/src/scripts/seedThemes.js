const mongoose = require('mongoose');
const Theme = require('../models/Theme');
require('dotenv').config();

const themes = [
  {
    name: 'Modern Blue',
    description: 'A clean and modern theme with blue accents',
    category: 'modern',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
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
      heading: 'Poppins',
      body: 'Inter',
      mono: 'JetBrains Mono'
    },
    effects: {
      enableHoverEffects: true,
      hoverScale: 1.05,
      hoverShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      transitionDuration: '300ms',
      enableGradients: false,
      enableAlternatingSections: true,
      alternateSectionColor: '#f8fafc',
      buttonHoverBrightness: 1.1
    },
    isPublic: true,
    isPremium: false
  },
  {
    name: 'Dark Elegance',
    description: 'Sophisticated dark theme perfect for modern brands',
    category: 'dark',
    colors: {
      primary: '#6366f1',
      secondary: '#a855f7',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      error: '#f87171',
      success: '#34d399',
      warning: '#fbbf24'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
      mono: 'Fira Code'
    },
    effects: {
      enableHoverEffects: true,
      hoverScale: 1.03,
      hoverShadow: '0 25px 50px -12px rgb(139 92 246 / 0.25)',
      transitionDuration: '200ms',
      enableGradients: true,
      gradientDirection: 'to right',
      enableAlternatingSections: false,
      buttonHoverBrightness: 1.15
    },
    isPublic: true,
    isPremium: false
  },
  {
    name: 'Minimal White',
    description: 'Ultra-minimal design with plenty of white space',
    category: 'minimal',
    colors: {
      primary: '#000000',
      secondary: '#404040',
      background: '#ffffff',
      surface: '#fafafa',
      text: '#000000',
      textSecondary: '#737373',
      border: '#e5e5e5',
      error: '#dc2626',
      success: '#16a34a',
      warning: '#ea580c'
    },
    fonts: {
      heading: 'Raleway',
      body: 'Work Sans',
      mono: 'Monaco'
    },
    effects: {
      enableHoverEffects: true,
      hoverScale: 1.02,
      hoverShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      transitionDuration: '150ms',
      enableGradients: false,
      enableAlternatingSections: false,
      buttonHoverBrightness: 0.9
    },
    isPublic: true,
    isPremium: false
  },
  {
    name: 'Vibrant Sunset',
    description: 'Bold and colorful theme with warm tones',
    category: 'bold',
    colors: {
      primary: '#f97316',
      secondary: '#f59e0b',
      background: '#fffbeb',
      surface: '#ffffff',
      text: '#292524',
      textSecondary: '#78716c',
      border: '#fde68a',
      error: '#dc2626',
      success: '#16a34a',
      warning: '#ea580c'
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Open Sans',
      mono: 'Source Code Pro'
    },
    effects: {
      enableHoverEffects: true,
      hoverScale: 1.08,
      hoverShadow: '0 25px 50px -12px rgb(249 115 22 / 0.25)',
      transitionDuration: '250ms',
      enableGradients: true,
      gradientDirection: 'to bottom right',
      enableAlternatingSections: true,
      alternateSectionColor: '#ffffff',
      buttonHoverBrightness: 1.2
    },
    isPublic: true,
    isPremium: false
  },
  {
    name: 'Ocean Breeze',
    description: 'Calm and refreshing theme inspired by the ocean',
    category: 'modern',
    colors: {
      primary: '#0891b2',
      secondary: '#06b6d4',
      background: '#f0fdfa',
      surface: '#ffffff',
      text: '#0f172a',
      textSecondary: '#475569',
      border: '#99f6e4',
      error: '#dc2626',
      success: '#14b8a6',
      warning: '#f59e0b'
    },
    fonts: {
      heading: 'Poppins',
      body: 'Roboto',
      mono: 'Roboto Mono'
    },
    isPublic: true,
    isPremium: false
  },
  {
    name: 'Forest Green',
    description: 'Natural and earthy theme with green accents',
    category: 'elegant',
    colors: {
      primary: '#16a34a',
      secondary: '#4ade80',
      background: '#f7fee7',
      surface: '#ffffff',
      text: '#14532d',
      textSecondary: '#4d7c0f',
      border: '#d9f99d',
      error: '#dc2626',
      success: '#22c55e',
      warning: '#eab308'
    },
    fonts: {
      heading: 'Merriweather',
      body: 'Lato',
      mono: 'Courier Prime'
    },
    isPublic: true,
    isPremium: false
  },
  {
    name: 'Royal Purple',
    description: 'Luxurious theme with deep purple tones',
    category: 'elegant',
    colors: {
      primary: '#7c3aed',
      secondary: '#a78bfa',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#3b0764',
      textSecondary: '#6b21a8',
      border: '#e9d5ff',
      error: '#dc2626',
      success: '#16a34a',
      warning: '#f59e0b'
    },
    fonts: {
      heading: 'Libre Baskerville',
      body: 'Source Sans Pro',
      mono: 'IBM Plex Mono'
    },
    isPublic: true,
    isPremium: true
  },
  {
    name: 'Midnight Black',
    description: 'Premium dark theme with subtle gradients',
    category: 'dark',
    colors: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      background: '#000000',
      surface: '#18181b',
      text: '#fafafa',
      textSecondary: '#a1a1aa',
      border: '#27272a',
      error: '#f87171',
      success: '#4ade80',
      warning: '#fbbf24'
    },
    fonts: {
      heading: 'Space Grotesk',
      body: 'Inter',
      mono: 'JetBrains Mono'
    },
    isPublic: true,
    isPremium: true
  }
];

const seedThemes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Clear existing themes
    await Theme.deleteMany({});
    console.log('🗑️  Cleared existing themes');

    // Insert new themes
    const createdThemes = await Theme.insertMany(themes);
    console.log(`✅ Created ${createdThemes.length} themes`);

    console.log('\n📋 Themes created:');
    createdThemes.forEach((theme, index) => {
      console.log(`${index + 1}. ${theme.name} (${theme.category}) - ${theme.isPremium ? 'Premium' : 'Free'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding themes:', error);
    process.exit(1);
  }
};

seedThemes();
