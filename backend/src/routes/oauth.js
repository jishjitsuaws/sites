const express = require('express');
const axios = require('axios');
const https = require('https');
const fs = require('fs');

const ca = fs.readFileSync('/etc/haproxy/certs/usessl/sites.isea.in.pem');

const router = express.Router();

const OAUTH_BASE_URL = process.env.OAUTH_BASE_URL || 'https://ivp.isea.in/backend';
const CLIENT_ID = process.env.OAUTH_CLIENT_ID || 'owl';

// Set Node.js to accept unauthorized certificates globally for OAuth requests
// This is required because IVP ISEA OAuth provider has SSL/TLS certificate issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Create axios instance with comprehensive SSL bypass for OAuth provider
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    ca,
    rejectUnauthorized: false,
    minVersion: 'TLSv1.3',
    requestCert: false,
    secureOptions: require('constants').SSL_OP_NO_SSLv2 | require('constants').SSL_OP_NO_SSLv3,
    checkServerIdentity: () => undefined,
  }),
  timeout: 15000,
  maxRedirects: 5,
});

// Force-disable SNI at the socket creation level
axiosInstance.defaults.transport = https;

axiosInstance.interceptors.request.use((config) => {
  // Override the HTTPS adapter directly before the request
  config.transport = https;
  config.beforeRedirect = (options) => {
    if (options && options.servername) {
      delete options.servername;  // remove if Axios re-added it
    }
  };

  // Ensure the agent's options also lack SNI
  if (config.httpsAgent && config.httpsAgent.options) {
    delete config.httpsAgent.options.servername;
  }

  return config;
});



// Add request/response interceptors for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('[OAuth Axios] Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('[OAuth Axios] Request error:', error.message);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('[OAuth Axios] Response:', {
      status: response.status,
      statusText: response.statusText,
    });
    return response;
  },
  (error) => {
    console.error('[OAuth Axios] Response error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

// Health check endpoint to test OAuth provider connectivity
router.get('/health', async (req, res) => {
  try {
    console.log('[OAuth Health] Testing connectivity to OAuth provider...');
    console.log('[OAuth Health] Base URL:', OAUTH_BASE_URL);
    console.log('[OAuth Health] Client ID:', CLIENT_ID);
    
    res.json({
      status: 'ok',
      oauth_base_url: OAUTH_BASE_URL,
      client_id: CLIENT_ID,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Debug endpoint to decode and inspect JWT token structure
router.post('/debug-token', async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({
        error: 'Missing access_token',
      });
    }

    console.log('[OAuth Debug] Decoding token...');
    console.log('[OAuth Debug] Token preview:', access_token.substring(0, 50) + '...');

    // Decode JWT without verification to inspect its structure
    const parts = access_token.split('.');
    
    if (parts.length !== 3) {
      return res.status(400).json({
        error: 'Invalid JWT format',
        parts_count: parts.length,
      });
    }

    // Decode header
    const headerBase64 = parts[0].replace(/-/g, '+').replace(/_/g, '/');
    const header = JSON.parse(Buffer.from(headerBase64, 'base64').toString());

    // Decode payload
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());

    console.log('[OAuth Debug] Token decoded successfully');
    console.log('[OAuth Debug] Header:', header);
    console.log('[OAuth Debug] Payload keys:', Object.keys(payload));
    console.log('[OAuth Debug] Full payload:', JSON.stringify(payload, null, 2));

    res.json({
      header,
      payload,
      payload_keys: Object.keys(payload),
      possible_uid_fields: {
        uid: payload.uid,
        sub: payload.sub,
        user_id: payload.user_id,
        id: payload.id,
        userId: payload.userId,
        email: payload.email,
        preferred_username: payload.preferred_username,
      },
    });
  } catch (error) {
    console.error('[OAuth Debug] Token decode error:', error.message);
    res.status(500).json({
      error: 'Failed to decode token',
      message: error.message,
    });
  }
});

// STEP 3: Token Generation - Exchange code for access token
// Calls: POST https://ivp.isea.in/backend/tokengen
router.post('/token', async (req, res) => {
  try {
    const { code, state, client_id } = req.body;

    console.log('[OAuth] Token generation request received');
    console.log('[OAuth] Request payload:', {
      code: code ? code.substring(0, 30) + '...' : 'missing',
      state: state ? state.substring(0, 30) + '...' : 'missing',
      client_id: client_id || CLIENT_ID,
      timestamp: new Date().toISOString()
    });
    console.log('[OAuth] Calling:', `${OAUTH_BASE_URL}/tokengen`);

    const requestData = {
      code,
      state,
      client_id: client_id || CLIENT_ID,
    };

    console.log('[OAuth] Sending request to OAuth provider...');
    
    const response = await axiosInstance.post(`${OAUTH_BASE_URL}/tokengen`, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[OAuth] Token generation successful');
    console.log('[OAuth] Response status:', response.status);
    console.log('[OAuth] Response data keys:', Object.keys(response.data));
    console.log('[OAuth] Full response data:', JSON.stringify(response.data, null, 2));
    
    // The IVP ISEA OAuth provider returns data in a nested structure
    // Extract the actual token data from response.data.data
    const tokenData = response.data.data || response.data;
    console.log('[OAuth] Extracted token data:', JSON.stringify(tokenData, null, 2));
    
    res.json(tokenData);
  } catch (error) {
    console.error('[OAuth] Token generation error:');
    console.error('[OAuth] Error status:', error.response?.status);
    console.error('[OAuth] Error data:', error.response?.data);
    console.error('[OAuth] Error message:', error.message);
    
    // Return detailed error information
    const errorStatus = error.response?.status || 500;
    const errorData = error.response?.data || {};
    
    res.status(errorStatus).json({
      error: 'Token generation failed',
      status: errorStatus,
      details: errorData,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// STEP 4: User Info - Fetch user information
// Calls: POST https://ivp.isea.in/backend/userinfo
router.post('/userinfo', async (req, res) => {
  try {
    const { access_token, uid } = req.body;

    console.log('[OAuth] User info request received');
    
    // If uid is not provided, try to decode it from the access token
    let userId = uid;
    if (!userId && access_token) {
      try {
        // Decode JWT to extract uid
        const base64Url = access_token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
        userId = payload.uid || payload.sub || payload.user_id || payload.id;
        console.log('[OAuth] Extracted uid from token:', userId);
      } catch (decodeError) {
        console.error('[OAuth] Failed to decode token:', decodeError.message);
      }
    }

    console.log('[OAuth] Calling:', `${OAUTH_BASE_URL}/userinfo`);

    const response = await axiosInstance.post(`${OAUTH_BASE_URL}/userinfo`, {
      uid: userId,
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

    const response = await axiosInstance.post(`${OAUTH_BASE_URL}/ivp/profile/`, {
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

    const response = await axiosInstance.post(`${OAUTH_BASE_URL}/updateuserbyid`, {
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
    console.log('[OAuth] Logout payload:', { user_id, client_id: CLIENT_ID });

    // Call OAuth provider logout endpoint
    // The provider needs client_id to identify the client context
    const response = await axiosInstance.post(`${OAUTH_BASE_URL}/logout`, {
      user_id,
      client_id: CLIENT_ID,
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
    console.error('[OAuth] Logout error status:', error.response?.status);
    console.error('[OAuth] Logout error full details:', JSON.stringify(error.response?.data, null, 2));
    
    // Handle specific error cases
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      
      // Client does not exist error
      if (errorData.message === 'Client does not exist') {
        console.error('[OAuth] Client does not exist - check CLIENT_ID configuration');
        return res.status(400).json({
          status: 0,
          errors: ['client_not_found'],
          message: 'OAuth client configuration error',
          status_code: 400,
        });
      }
      
      // Invalid grant error
      if (errorData.errors === 'invalid_grant') {
        return res.status(400).json({
          status: 0,
          errors: 'invalid_grant',
          message: errorData.message || 'Invalid grant',
          status_code: 400,
        });
      }
      
      // Other 400 errors
      return res.status(400).json({
        status: 0,
        errors: errorData.errors || [],
        message: errorData.message || 'Logout request failed',
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
