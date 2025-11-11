const express = require('express');
const { body } = require('express-validator');
const {
  getThemes,
  getTheme,
  createTheme,
  updateTheme,
  deleteTheme,
  getThemesByCategory,
  useTheme,
  getMyThemes
} = require('../controllers/themeController');
const { protect, optionalAuth } = require('../middleware/auth');
const { handleValidationErrors, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createThemeValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Theme name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Theme name must be between 2 and 50 characters'),
  body('colors.primary')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Invalid primary color format'),
  body('colors.secondary')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Invalid secondary color format'),
  body('colors.background')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Invalid background color format'),
  body('fonts.heading')
    .trim()
    .notEmpty().withMessage('Heading font is required'),
  body('fonts.body')
    .trim()
    .notEmpty().withMessage('Body font is required')
];

// Routes - OAuth provider handles authentication
router.route('/')
  .get(getThemes)
  .post(createThemeValidation, handleValidationErrors, createTheme);

router.get('/my-themes', getMyThemes);
router.get('/category/:category', getThemesByCategory);

router.route('/:id')
  .get(validateObjectId('id'), getTheme)
  .put(validateObjectId('id'), updateTheme)
  .delete(validateObjectId('id'), deleteTheme);

router.post('/:id/use', validateObjectId('id'), useTheme);

module.exports = router;
