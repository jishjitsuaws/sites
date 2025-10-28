const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  siteName: {
    type: String,
    required: [true, 'Site name is required'],
    trim: true,
    minlength: [2, 'Site name must be at least 2 characters long'],
    maxlength: [100, 'Site name cannot exceed 100 characters']
  },
  subdomain: {
    type: String,
    required: [true, 'Subdomain is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'],
    minlength: [3, 'Subdomain must be at least 3 characters long'],
    maxlength: [50, 'Subdomain cannot exceed 50 characters']
  },
  customDomain: {
    type: String,
    default: null,
    sparse: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  favicon: {
    type: String,
    default: null
  },
  logo: {
    type: String,
    default: null
  },
  logoWidth: {
    type: String,
    default: '120px'
  },
  themeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theme',
    default: null
  },
  customTheme: {
    colors: {
      primary: { type: String, default: '#3b82f6' },
      secondary: { type: String, default: '#8b5cf6' },
      background: { type: String, default: '#ffffff' },
      surface: { type: String, default: '#f8fafc' },
      text: { type: String, default: '#1e293b' },
      textSecondary: { type: String, default: '#64748b' },
      border: { type: String, default: '#e2e8f0' },
      error: { type: String, default: '#ef4444' },
      success: { type: String, default: '#10b981' }
    },
    fonts: {
      heading: { type: String, default: 'Inter' },
      body: { type: String, default: 'Inter' }
    },
    customCSS: { type: String, default: '' }
  },
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: [{ type: String }],
    ogImage: { type: String, default: null },
    robots: { type: String, default: 'index, follow' }
  },
  analytics: {
    googleAnalyticsId: { type: String, default: null },
    facebookPixelId: { type: String, default: null }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  },
  lastEditedAt: {
    type: Date,
    default: Date.now
  },
  settings: {
    showNavbar: { type: Boolean, default: true },
    showFooter: { type: Boolean, default: true },
    enableComments: { type: Boolean, default: false },
    enableSharing: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
siteSchema.index({ userId: 1, createdAt: -1 });
siteSchema.index({ customDomain: 1 }, { sparse: true });
siteSchema.index({ isPublished: 1 });

// Virtual for site's pages
siteSchema.virtual('pages', {
  ref: 'Page',
  localField: '_id',
  foreignField: 'siteId',
  options: { sort: { order: 1 } }
});

// Update lastEditedAt before saving
siteSchema.pre('save', function(next) {
  this.lastEditedAt = Date.now();
  next();
});

// Generate unique subdomain if collision occurs
siteSchema.statics.generateUniqueSubdomain = async function(baseName) {
  let subdomain = baseName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  let counter = 1;
  let isUnique = false;
  
  while (!isUnique) {
    const existing = await this.findOne({ subdomain });
    if (!existing) {
      isUnique = true;
    } else {
      subdomain = `${baseName}-${counter}`;
      counter++;
    }
  }
  
  return subdomain;
};

module.exports = mongoose.model('Site', siteSchema);
