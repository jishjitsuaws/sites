const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Theme name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Theme name must be at least 2 characters long'],
    maxlength: [50, 'Theme name cannot exceed 50 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  thumbnail: {
    type: String,
    default: null
  },
  category: {
    type: String,
    enum: ['modern', 'classic', 'minimal', 'bold', 'elegant', 'dark', 'light', 'custom'],
    default: 'modern'
  },
  colors: {
    primary: {
      type: String,
      required: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format']
    },
    secondary: {
      type: String,
      required: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format']
    },
    background: {
      type: String,
      required: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format']
    },
    surface: {
      type: String,
      required: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format']
    },
    text: {
      type: String,
      required: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format']
    },
    textSecondary: {
      type: String,
      required: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format']
    },
    border: {
      type: String,
      required: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format']
    },
    error: {
      type: String,
      default: '#ef4444',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format']
    },
    success: {
      type: String,
      default: '#10b981',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format']
    },
    warning: {
      type: String,
      default: '#f59e0b',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format']
    }
  },
  fonts: {
    heading: {
      type: String,
      required: true,
      default: 'Inter'
    },
    body: {
      type: String,
      required: true,
      default: 'Inter'
    },
    mono: {
      type: String,
      default: 'JetBrains Mono'
    }
  },
  spacing: {
    baseUnit: {
      type: Number,
      default: 4,
      min: 2,
      max: 8
    },
    containerMaxWidth: {
      type: String,
      default: '1280px'
    }
  },
  borderRadius: {
    small: { type: String, default: '0.25rem' },
    medium: { type: String, default: '0.5rem' },
    large: { type: String, default: '1rem' },
    full: { type: String, default: '9999px' }
  },
  shadows: {
    small: { type: String, default: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
    medium: { type: String, default: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
    large: { type: String, default: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }
  },
  effects: {
    enableHoverEffects: { type: Boolean, default: true },
    hoverScale: { type: Number, default: 1.05, min: 1, max: 1.2 },
    hoverShadow: { type: String, default: '0 20px 25px -5px rgb(0 0 0 / 0.1)' },
    transitionDuration: { type: String, default: '300ms' },
    enableGradients: { type: Boolean, default: false },
    gradientDirection: { type: String, default: 'to right' },
    enableAlternatingSections: { type: Boolean, default: false },
    alternateSectionColor: { type: String, default: '#f9fafb' },
    buttonHoverBrightness: { type: Number, default: 1.1, min: 0.8, max: 1.3 }
  },
  customCSS: {
    type: String,
    default: '',
    maxlength: [10000, 'Custom CSS cannot exceed 10000 characters']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes
themeSchema.index({ category: 1 });
themeSchema.index({ isPublic: 1, isPremium: 1 });

module.exports = mongoose.model('Theme', themeSchema);
