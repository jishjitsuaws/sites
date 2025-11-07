const User = require('../models/User');

/**
 * @desc    Sync or create user from OAuth data
 * @route   POST /api/oauth/sync-user
 * @access  Public (called after OAuth authentication)
 */
const syncUser = async (req, res) => {
  try {
    const { uid, email, first_name, last_name, username, role, mobileno, access_token, oauth_provider } = req.body;

    if (!uid || !email || !oauth_provider) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: uid, email, and oauth_provider'
      });
    }

    console.log('[OAuth Controller] Syncing user:', { uid, email, oauth_provider });

    // Check if user exists with this OAuth UID and provider
    let user = await User.findOne({ 
      oauthUid: uid, 
      oauthProvider: oauth_provider 
    });

    if (user) {
      // Update existing OAuth user
      console.log('[OAuth Controller] Updating existing OAuth user');
      
      user.email = email;
      user.name = first_name && last_name ? `${first_name} ${last_name}` : user.name;
      user.lastLogin = new Date();
      
      if (access_token) {
        user.oauthAccessToken = access_token;
      }

      await user.save();
    } else {
      // Check if user exists with this email (might be traditional auth user)
      user = await User.findOne({ email });

      if (user) {
        // Convert traditional auth user to OAuth user
        console.log('[OAuth Controller] Converting traditional user to OAuth');
        
        user.oauthUid = uid;
        user.oauthProvider = oauth_provider;
        user.oauthAccessToken = access_token;
        user.lastLogin = new Date();
        
        await user.save();
      } else {
        // Create new OAuth user
        console.log('[OAuth Controller] Creating new OAuth user');
        
        user = await User.create({
          name: first_name && last_name ? `${first_name} ${last_name}` : username || email.split('@')[0],
          email,
          oauthUid: uid,
          oauthProvider: oauth_provider,
          oauthAccessToken: access_token,
          isEmailVerified: true, // OAuth users are pre-verified
          lastLogin: new Date(),
          subscriptionPlan: 'free'
        });
      }
    }

    // Return user data (password excluded automatically via model toJSON)
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        subscriptionPlan: user.subscriptionPlan,
        oauthProvider: user.oauthProvider
      }
    });

  } catch (error) {
    console.error('[OAuth Controller] Sync user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync user',
      error: error.message
    });
  }
};

/**
 * @desc    Get user by OAuth UID
 * @route   GET /api/oauth/user/:uid
 * @access  Public (called during OAuth flow)
 */
const getUserByOAuthUid = async (req, res) => {
  try {
    const { uid } = req.params;
    const { oauth_provider } = req.query;

    if (!uid || !oauth_provider) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: uid and oauth_provider'
      });
    }

    const user = await User.findOne({
      oauthUid: uid,
      oauthProvider: oauth_provider
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        subscriptionPlan: user.subscriptionPlan,
        oauthProvider: user.oauthProvider
      }
    });

  } catch (error) {
    console.error('[OAuth Controller] Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

/**
 * @desc    Disconnect OAuth from user account
 * @route   POST /api/oauth/disconnect
 * @access  Private (requires authentication)
 */
const disconnectOAuth = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user.oauthProvider) {
      return res.status(400).json({
        success: false,
        message: 'No OAuth provider connected to this account'
      });
    }

    // Clear OAuth fields
    user.oauthProvider = null;
    user.oauthUid = null;
    user.oauthAccessToken = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'OAuth disconnected successfully'
    });

  } catch (error) {
    console.error('[OAuth Controller] Disconnect OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect OAuth',
      error: error.message
    });
  }
};

module.exports = {
  syncUser,
  getUserByOAuthUid,
  disconnectOAuth
};
