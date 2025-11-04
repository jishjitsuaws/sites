const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  logout,
  refreshToken
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { authValidation } = require('../middleware/validationRules');

const router = express.Router();

// Routes
router.post('/register', authValidation.register, handleValidationErrors, register);
router.post('/login', authValidation.login, handleValidationErrors, login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/update-password', protect, authValidation.updatePassword, handleValidationErrors, updatePassword);
router.post('/forgot-password', authValidation.forgotPassword, handleValidationErrors, forgotPassword);
router.put('/reset-password/:resetToken', authValidation.resetPassword, handleValidationErrors, resetPassword);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);

module.exports = router;
