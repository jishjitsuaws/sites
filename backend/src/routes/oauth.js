const express = require('express');
const axios = require('axios');

const router = express.Router();

const OAUTH_BASE_URL = process.env.OAUTH_BASE_URL || 'https://ivp.isea.in/backend';
const CLIENT_ID = process.env.OAUTH_CLIENT_ID || 'owl';

// STEP 3: Token Generation - Exchange code for access token
// Calls: POST https://ivp.isea.in/backend/tokengen
router.post('/token', async (req, res) => {
  try {
    const { code, state, client_id } = req.body;

    console.log('[OAuth] Token generation request received');
    console.log('[OAuth] Calling:', `${OAUTH_BASE_URL}/tokengen`);

    const response = await axios.post(`${OAUTH_BASE_URL}/tokengen`, {
      code,
      state,
      client_id: client_id || CLIENT_ID,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[OAuth] Token generation successful');
    res.json(response.data);
  } catch (error) {
    console.error('[OAuth] Token generation error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Token generation failed',
      details: error.response?.data || error.message,
    });
  }
});

// STEP 4: User Info - Fetch user information
// Calls: POST https://ivp.isea.in/backend/userinfo
router.post('/userinfo', async (req, res) => {
  try {
    const { access_token, uid } = req.body;

    console.log('[OAuth] User info request received');
    console.log('[OAuth] Calling:', `${OAUTH_BASE_URL}/userinfo`);

    const response = await axios.post(`${OAUTH_BASE_URL}/userinfo`, {
      uid,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
    });

    console.log('[OAuth] User info fetch successful');
    res.json(response.data);
  } catch (error) {
    console.error('[OAuth] User info error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'User info fetch failed',
      details: error.response?.data || error.message,
    });
  }
});

// STEP 5: User Profile - Fetch user profile
// Calls: POST https://ivp.isea.in/backend/ivp/profile/
router.post('/profile', async (req, res) => {
  try {
    const { access_token, uid } = req.body;

    console.log('[OAuth] User profile request received');
    console.log('[OAuth] Calling:', `${OAUTH_BASE_URL}/ivp/profile/`);

    const response = await axios.post(`${OAUTH_BASE_URL}/ivp/profile/`, {
      uid,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
    });

    console.log('[OAuth] User profile fetch successful');
    res.json(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('[OAuth] User profile not found (404)');
      return res.status(404).json({
        error: 'Profile not found',
      });
    }

    console.error('[OAuth] User profile error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'User profile fetch failed',
      details: error.response?.data || error.message,
    });
  }
});

// STEP 6: Update Profile - Create/update user profile
// Calls: POST https://ivp.isea.in/backend/updateuserbyid
router.post('/update-profile', async (req, res) => {
  try {
    const { first_name, last_name, email, mobileno, uid, mode } = req.body;

    console.log('[OAuth] Profile update request received');
    console.log('[OAuth] Calling:', `${OAUTH_BASE_URL}/updateuserbyid`);

    const response = await axios.post(`${OAUTH_BASE_URL}/updateuserbyid`, {
      first_name,
      last_name,
      email,
      mobileno,
      uid,
      mode: mode || 'ivp', // Default mode is 'ivp'
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[OAuth] Profile update successful');
    res.json(response.data);
  } catch (error) {
    console.error('[OAuth] Profile update error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Profile update failed',
      details: error.response?.data || error.message,
    });
  }
});

/**
 * LOGOUT: Call OAuth provider logout endpoint
 * Calls: POST https://ivp.isea.in/backend/logout
 */
router.post('/logout', async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      console.error('[OAuth] Logout request missing user_id');
      return res.status(400).json({
        status: 0,
        error: 'Missing user_id',
        status_code: 400,
      });
    }

    console.log('[OAuth] Logout request received for user:', user_id);
    console.log('[OAuth] Calling:', `${OAUTH_BASE_URL}/logout`);

    // Call OAuth provider logout endpoint
    const response = await axios.post(`${OAUTH_BASE_URL}/logout`, {
      user_id,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[OAuth] Logout successful');
    
    // Return OAuth provider response
    res.json({
      status: 1,
      message: response.data.message || 'Logout successful',
      status_code: 200,
    });

  } catch (error) {
    console.error('[OAuth] Logout error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 400 && error.response?.data?.errors === 'invalid_grant') {
      return res.status(400).json({
        status: 0,
        errors: 'invalid_grant',
        status_code: 400,
      });
    }

    // Generic error response
    res.status(error.response?.status || 500).json({
      status: 0,
      error: 'Logout failed',
      details: error.response?.data || error.message,
      status_code: error.response?.status || 500,
    });
  }
});

module.exports = router;
