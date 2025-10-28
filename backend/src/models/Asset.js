const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    default: null
  },
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: [true, 'URL is required']
  },
  publicId: {
    type: String,
    default: null
  },
  type: {
    type: String,
    required: true,
    enum: ['image', 'video', 'document', 'other']
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  dimensions: {
    width: { type: Number, default: null },
    height: { type: Number, default: null }
  },
  alt: {
    type: String,
    default: '',
    maxlength: [200, 'Alt text cannot exceed 200 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  folder: {
    type: String,
    default: 'uploads',
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
assetSchema.index({ userId: 1, createdAt: -1 });
assetSchema.index({ siteId: 1 });
assetSchema.index({ type: 1 });
assetSchema.index({ tags: 1 });

// Virtual to check if asset is an image
assetSchema.virtual('isImage').get(function() {
  return this.type === 'image';
});

// Static method to calculate total storage used by user
assetSchema.statics.calculateUserStorage = async function(userId) {
  const result = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, totalSize: { $sum: '$size' } } }
  ]);
  
  return result.length > 0 ? result[0].totalSize : 0;
};

module.exports = mongoose.model('Asset', assetSchema);
