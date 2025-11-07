const express = require('express');
const axios = require('axios');
const { syncUser, getUserByOAuthUid, disconnectOAuth } = require('../controllers/oauthController');
const { protect } = require('../middleware/auth');
const router = express.Router();

const OAUTH_BASE_URL = process.env.OAUTH_BASE_URL || 'https://ivp.isea.in/backend';
const CLIENT_ID = process.env.OAUTH_CLIENT_ID || 'owl';

/**
 * @route   POST /api/oauth/token
 * @desc    Exchange authorization code for access token
 * @access  Public
 * @proxy   POST https://ivp.isea.in/backend/tokengen
 */
router.post('/token', async (req, res) => {
  try {
    const { code, state, client_id } = req.body;

    if (!code || !state) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: code and state'
      });
    }

    console.log('[OAuth] Exchanging code for token...');

    // Call OAuth provider's tokengen endpoint
    const response = await axios.post(`${OAUTH_BASE_URL}/tokengen`, {
      code,
      state,
      client_id: client_id || CLIENT_ID
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('[OAuth] Token exchange successful');

    res.json(response.data);
  } catch (error) {
    console.error('[OAuth] Token exchange error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to exchange code for token',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/oauth/userinfo
 * @desc    Fetch user information using access token
 * @access  Public
 * @proxy   POST https://ivp.isea.in/backend/userinfo
 */
router.post('/userinfo', async (req, res) => {
  try {
    const { access_token, uid } = req.body;

    if (!access_token || !uid) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: access_token and uid'
      });
    }

    console.log('[OAuth] Fetching user info...');

    // Call OAuth provider's userinfo endpoint
    const response = await axios.post(`${OAUTH_BASE_URL}/userinfo`, {
      uid
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('[OAuth] User info fetch successful');

    res.json(response.data);
  } catch (error) {
    console.error('[OAuth] User info fetch error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to fetch user info',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/oauth/profile
 * @desc    Fetch user profile
 * @access  Public
 * @proxy   POST https://ivp.isea.in/backend/ivp/profile/
 */
router.post('/profile', async (req, res) => {
  try {
    const { access_token, uid } = req.body;

    if (!access_token || !uid) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: access_token and uid'
      });
    }

    console.log('[OAuth] Fetching user profile...');

    // Call OAuth provider's profile endpoint
    const response = await axios.post(`${OAUTH_BASE_URL}/ivp/profile/`, {
      uid
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('[OAuth] User profile fetch successful');

    res.json(response.data);
  } catch (error) {
    console.error('[OAuth] User profile fetch error:', error.response?.data || error.message);
    
    // Return 404 if profile not found
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
        error: 'Profile not found'
      });
    }

    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to fetch user profile',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/oauth/update-profile
 * @desc    Update user profile
 * @access  Public
 * @proxy   POST https://ivp.isea.in/backend/updateuserbyid
 */
router.post('/update-profile', async (req, res) => {
  try {
    const { uid, first_name, last_name, email, mobileno, mode } = req.body;

    if (!uid || !first_name || !last_name || !email || !mobileno) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: uid, first_name, last_name, email, mobileno'
      });
    }

    console.log('[OAuth] Updating user profile...');

    // Call OAuth provider's update profile endpoint
    const response = await axios.post(`${OAUTH_BASE_URL}/updateuserbyid`, {
      uid,
      first_name,
      last_name,
      email,
      mobileno,
      mode: mode || 'ivp' // Default to 'ivp' as per documentation
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('[OAuth] User profile update successful');

    res.json(response.data);
  } catch (error) {
    console.error('[OAuth] User profile update error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to update user profile',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/oauth/sync-user
 * @desc    Sync or create user in local database from OAuth data
 * @access  Public
 */
router.post('/sync-user', syncUser);

/**
 * @route   GET /api/oauth/user/:uid
 * @desc    Get user by OAuth UID
 * @access  Public
 */
router.get('/user/:uid', getUserByOAuthUid);

/**
 * @route   POST /api/oauth/disconnect
 * @desc    Disconnect OAuth from user account
 * @access  Private
 */
router.post('/disconnect', protect, disconnectOAuth);

module.exports = router;
