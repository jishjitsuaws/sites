const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Upload file to local storage
 * Note: When using multer.diskStorage, the file is already saved to disk at file.path
 */
const uploadToLocalStorage = async (file, options = {}) => {
  try {
    // File is already saved by multer at file.path
    // We just need to return the metadata
    const filename = file.filename;
    const filePath = file.path;
    
    // Get image dimensions if it's an image
    let dimensions = null;
    if (file.mimetype.startsWith('image/')) {
      try {
        const metadata = await sharp(filePath).metadata();
        dimensions = {
          width: metadata.width,
          height: metadata.height
        };
      } catch (error) {
        console.warn('Could not get image dimensions:', error.message);
      }
    }

    // Return result in similar format to Cloudinary
    // Use full URL so frontend can access the image from backend server
    const baseUrl = process.env.BACKEND_URL;
    return {
      public_id: filename,
      secure_url: `${baseUrl}/uploads/${filename}`,
      url: `${baseUrl}/uploads/${filename}`,
      width: dimensions?.width,
      height: dimensions?.height,
      format: path.extname(filename).substring(1),
      bytes: file.size,
      original_filename: file.originalname
    };
  } catch (error) {
    console.error('Local storage upload error:', error);
    throw error;
  }
};

/**
 * Delete file from local storage
 */
const deleteFromLocalStorage = async (publicId) => {
  try {
    // publicId is just the filename now
    const filePath = path.join(uploadsDir, publicId);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { result: 'ok' };
    } else {
      console.warn('File not found for deletion:', publicId);
      return { result: 'not found' };
    }
  } catch (error) {
    console.error('Local storage deletion error:', error);
    throw error;
  }
};

/**
 * Get optimized image URL (for local storage, we just return the URL)
 */
const getOptimizedUrl = (publicId, options = {}) => {
  // For local storage, return the static file URL
  return `/uploads/${publicId}`;
};

module.exports = {
  uploadToLocalStorage,
  deleteFromLocalStorage,
  getOptimizedUrl,
  uploadsDir
};
