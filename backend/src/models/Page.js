const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['heading', 'text', 'image', 'button', 'embed', 'layout', 'form', 'divider', 'spacer', 'youtube', 'map', 'social', 'gallery', 'code', 'video']
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
    required: [true, 'Slug is required'],
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-/]+$/, 'Slug can only contain lowercase letters, numbers, hyphens, and slashes']
  },
  content: [componentSchema],
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

// Compound index for unique slug per site
pageSchema.index({ siteId: 1, slug: 1 }, { unique: true });
pageSchema.index({ siteId: 1, order: 1 });
pageSchema.index({ siteId: 1, isHome: 1 });

// Ensure only one home page per site
pageSchema.pre('save', async function(next) {
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
