const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter with enhanced security
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedTypes = process.env.ALLOWED_FILE_TYPES
    ? process.env.ALLOWED_FILE_TYPES.split(',')
    : ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm'];

  // Allowed file extensions
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.webm'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Check both MIME type and extension
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    // Additional security: check filename for path traversal
    if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
      return cb(new Error('Invalid filename: path traversal detected'), false);
    }
    
    // Check for executable extensions disguised as images
    const dangerousExtensions = ['.exe', '.sh', '.bat', '.cmd', '.com', '.pif', '.application', '.gadget', '.msi', '.msp', '.scr', '.hta', '.cpl', '.msc', '.jar', '.vb', '.vbs', '.js', '.jse', '.ws', '.wsf', '.wsc', '.wsh', '.ps1', '.ps1xml', '.ps2', '.ps2xml', '.psc1', '.psc2', '.msh', '.msh1', '.msh2', '.mshxml', '.msh1xml', '.msh2xml'];
    
    for (const dangerousExt of dangerousExtensions) {
      if (file.originalname.toLowerCase().includes(dangerousExt)) {
        return cb(new Error('File contains dangerous extension'), false);
      }
    }
    
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} or extension ${ext} is not allowed`), false);
  }
};

// Create upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File size exceeds maximum allowed size of ${(parseInt(process.env.MAX_FILE_SIZE) || 5242880) / 1024 / 1024}MB`
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }
  
  next();
};

module.exports = {
  upload,
  handleMulterError,
  // Specific upload configurations
  uploadSingle: upload.single('file'),
  uploadMultiple: upload.array('files', 10),
  uploadFields: upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ])
};
