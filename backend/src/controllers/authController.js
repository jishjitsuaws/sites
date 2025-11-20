const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendTokenResponse, verifyToken, generateAccessToken } = require('../utils/jwt');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError('User with this email already exists', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password
  });

  // Send token response
  sendTokenResponse(user, 201, res);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new ApiError('Please provide email and password', 400);
  }

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    throw new ApiError('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError('Your account has been deactivated', 401);
  }

  // Verify password
  const isPasswordMatch = await user.comparePassword(password);
  
  if (!isPasswordMatch) {
    throw new ApiError('Invalid credentials', 401);
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  // Send token response
  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  
  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Update user details
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, avatar } = req.body;

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  if (avatar) fieldsToUpdate.avatar = avatar;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    fieldsToUpdate,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError('Please provide current and new password', 400);
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError('Current password is incorrect', 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Send token response
  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  
  if (!user) {
    throw new ApiError('No user found with that email', 404);
  }

  // Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${process.env.CORS_ORIGIN}/reset-password/${resetToken}`;

  // TODO: Send email with reset link
  // For now, just return the token in development
  if (process.env.NODE_ENV === 'development') {
    return res.status(200).json({
      success: true,
      message: 'Password reset token generated',
      resetToken,
      resetUrl
    });
  }

  res.status(200).json({
    success: true,
    message: 'Password reset email sent'
  });
});

/**
 * @desc    Reset password
 * @route   PUT /api/auth/reset-password/:resetToken
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new ApiError('Please provide a new password', 400);
  }

  // Hash token
  const crypto = require('crypto');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Find user by token and check expiry
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError('Invalid or expired reset token', 400);
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  await user.save();

  // Send token response
  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    })
    .cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    })
    .json({
      success: true,
      message: 'Logged out successfully'
    });
});

/**
 * @desc    OAuth user login/register with role validation
 * @route   POST /api/auth/oauth-login
 * @access  Public
 */
exports.oauthLogin = asyncHandler(async (req, res, next) => {
  const { userInfo, userProfile } = req.body;

  if (!userInfo || !userInfo.uid) {
    throw new ApiError('User information and UID are required', 400);
  }

  console.log('[OAuth Login] Processing user:', userInfo);

  // Check if user role is admin
  const userRole = userInfo.role || 'user';
  
  if (userRole !== 'admin' && userRole !== 'super_admin') {
    console.log('[OAuth Login] Access denied - user role:', userRole);
    return res.status(403).json({
      success: false,
      error: 'access_denied',
      message: 'You do not have permission to access this application. Only administrators are allowed.',
      role: userRole
    });
  }

  console.log('[OAuth Login] Role check passed - user role:', userRole);

  // Try to find existing user by UID or email
  let user = await User.findOne({
    $or: [
      { email: userInfo.email },
      { uid: userInfo.uid }
    ]
  });

  if (user) {
    // Update existing user with OAuth data
    console.log('[OAuth Login] Updating existing user:', user._id);
    user.role = userRole;
    user.lastLogin = Date.now();
    user.isActive = true;
    
    if (userProfile) {
      user.name = `${userProfile.first_name} ${userProfile.last_name}`.trim();
    } else if (userInfo.first_name && userInfo.last_name) {
      user.name = `${userInfo.first_name} ${userInfo.last_name}`.trim();
    }
    
    await user.save({ validateBeforeSave: false });
  } else {
    // Create new user
    console.log('[OAuth Login] Creating new user');
    
    // Generate a secure random password since OAuth users don't need it
    const crypto = require('crypto');
    const randomPassword = crypto.randomBytes(32).toString('hex');
    
    const userName = userProfile 
      ? `${userProfile.first_name} ${userProfile.last_name}`.trim()
      : userInfo.first_name && userInfo.last_name
        ? `${userInfo.first_name} ${userInfo.last_name}`.trim()
        : userInfo.email.split('@')[0];

    user = await User.create({
      uid: userInfo.uid,
      name: userName,
      email: userInfo.email,
      password: randomPassword, // Will be hashed by pre-save middleware
      role: userRole,
      isActive: true,
      isEmailVerified: true, // OAuth users are pre-verified
      lastLogin: Date.now()
    });

    console.log('[OAuth Login] User created successfully:', user._id);
  }

  // Generate JWT token for our app
  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError('Refresh token is required', 400);
  }

  // Verify refresh token
  const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);

  // Get user
  const user = await User.findById(decoded.id);
  
  if (!user || !user.isActive) {
    throw new ApiError('Invalid refresh token', 401);
  }

  // Generate new access token
  const newAccessToken = generateAccessToken(user._id);

  res.status(200).json({
    success: true,
    accessToken: newAccessToken
  });
});
