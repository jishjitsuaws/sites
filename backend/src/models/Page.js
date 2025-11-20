const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: [
      'heading',
      'text',
      'image',
      'button',
      'embed',
      'layout',
      'form',
      'spacer',
      'youtube',
      'map',
      'social',
      'gallery',
      'code',
      'video',
      'banner',
      'card',
      'footer',
      'timer',
      // Newly supported editor components
      'carousel',
      'bullet-list',
      'collapsible-list'
    ]
  },
  content: mongoose.Schema.Types.Mixed,
  props: mongoose.Schema.Types.Mixed,
  styles: {
    padding: { type: String, default: '1rem' },
    margin: { type: String, default: '0' },
    backgroundColor: { type: String, default: 'transparent' },
    textAlign: { type: String, default: 'left' },
    fontSize: { type: String, default: '1rem' },
    fontWeight: { type: String, default: 'normal' },
    color: { type: String, default: 'inherit' },
    border: { type: String, default: 'none' },
    borderRadius: { type: String, default: '0' },
    width: { type: String, default: '100%' },
    height: { type: String, default: 'auto' },
    custom: { type: String, default: '' }
  },
  order: { type: Number, default: 0 }
}, { _id: false });

const sectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['hero', 'content', 'footer', 'banner', 'gallery', 'testimonial', 'pricing', 'faq', 'custom'], default: 'content' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  sectionName: { type: String, default: '' },
  showInNavbar: { type: Boolean, default: true },
  backgroundColor: { type: String, default: 'transparent' },
  textColor: { type: String, default: 'inherit' },
  backgroundImage: { type: String, default: '' },
  alignment: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
  height: { type: String, enum: ['small', 'medium', 'large', 'auto'], default: 'auto' },
  components: [componentSchema],
  layout: {
    direction: { type: String, enum: ['row', 'column'], default: 'column' },
    justifyContent: { type: String, default: 'flex-start' },
    alignItems: { type: String, default: 'center' },
    gap: { type: Number, default: 16 },
    padding: { type: Number, default: 24 },
    backgroundColor: { type: String, default: 'transparent' }
  },
  order: { type: Number, default: 0 }
}, { _id: false });

const pageSchema = new mongoose.Schema({
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: [true, 'Site ID is required']
  },
  pageName: {
    type: String,
    required: [true, 'Page name is required'],
    trim: true,
    minlength: [1, 'Page name must be at least 1 character long'],
    maxlength: [100, 'Page name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    default: '',
    validate: {
      validator: function(value) {
        // Allow empty slug for home pages
        if (this.isHome && (!value || value === '')) {
          return true;
        }
        // For non-home pages, slug must match the pattern
        return /^[a-z0-9-/]+$/.test(value);
      },
      message: 'Slug can only contain lowercase letters, numbers, hyphens, and slashes'
    }
  },
  content: [componentSchema],
  sections: [sectionSchema],
  isHome: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: [{ type: String }],
    ogImage: { type: String, default: null },
    canonical: { type: String, default: null }
  },
  settings: {
    showInNavbar: { type: Boolean, default: true },
    requireAuth: { type: Boolean, default: false },
    customCss: { type: String, default: '' },
    customJs: { type: String, default: '' }
  }
}, {
  timestamps: true
});

// Compound index for unique slug per site (excluding empty slugs for home pages)
pageSchema.index({ siteId: 1, slug: 1 }, { 
  unique: true,
  partialFilterExpression: { slug: { $ne: '' } }
});
pageSchema.index({ siteId: 1, order: 1 });
pageSchema.index({ siteId: 1, isHome: 1 });

// Ensure only one home page per site
pageSchema.pre('save', async function(next) {
  // Normalize slug: convert "/" to empty string for home pages
  if (this.slug === '/' || (this.isHome && !this.slug)) {
    this.slug = '';
  }
  
  // Ensure only one home page exists per site
  if (this.isHome) {
    await mongoose.model('Page').updateMany(
      { siteId: this.siteId, _id: { $ne: this._id } },
      { $set: { isHome: false } }
    );
  }
  next();
});

// Generate unique slug if collision occurs
pageSchema.statics.generateUniqueSlug = async function(siteId, baseName) {
  let slug = baseName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  let counter = 1;
  let isUnique = false;
  
  while (!isUnique) {
    const existing = await this.findOne({ siteId, slug });
    if (!existing) {
      isUnique = true;
    } else {
      slug = `${baseName}-${counter}`;
      counter++;
    }
  }
  
  return slug;
};

module.exports = mongoose.model('Page', pageSchema);
