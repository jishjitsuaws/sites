const express = require('express');
const axios = require('axios');
const https = require('https');
const fs = require('fs');

const ca = fs.readFileSync('/etc/haproxy/certs/usessl/sites.isea.in.pem');

const router = express.Router();

const OAUTH_BASE_URL = process.env.OAUTH_BASE_URL ;
const CLIENT_ID = process.env.OAUTH_CLIENT_ID ;

// Set Node.js to accept unauthorized certificates globally for OAuth requests
// This is required because IVP ISEA OAuth provider has SSL/TLS certificate issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Create axios instance with comprehensive SSL bypass for OAuth provider
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    ca,
    rejectUnauthorized: true,
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
    
    // The IVP ISEA OAuth provider returns data in a deeply nested structure:
    // response.data.data.data.access_token (3 levels of 'data')
    const outerData = response.data.data || response.data;
    const tokenData = outerData.data || outerData;
    console.log('[OAuth] Extracted token data:', JSON.stringify(tokenData, null, 2));
    
    // Also extract media_token and other fields from outer level
    const mediaToken = outerData.media_token;
    console.log('[OAuth] Media token present:', !!mediaToken);
    
    // SECURITY FIX (CVE-002): Store access token in HttpOnly cookie
    // This prevents XSS attacks from stealing the token via JavaScript
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in || 3600; // Default 1 hour
    
    console.log('[OAuth] Access token present:', !!accessToken);
    console.log('[OAuth] Access token length:', accessToken ? accessToken.length : 0);
    console.log('[OAuth] Refresh token present:', !!refreshToken);
    
    // IVP ISEA may return empty access_token and use media_token instead
    // Use media_token as access_token if access_token is empty
    const actualAccessToken = (accessToken && accessToken.length > 0) ? accessToken : mediaToken;
    console.log('[OAuth] Using token:', actualAccessToken === mediaToken ? 'media_token as access_token' : 'access_token');
    
    // Extract uid from refresh_token JWT (it's in the 'sub' field)
    let uid = null;
    if (refreshToken) {
      try {
        // Decode JWT without verification (we trust the OAuth provider)
        const base64Payload = refreshToken.split('.')[1];
        const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
        uid = payload.sub || payload.user;
        console.log('[OAuth] Extracted uid from refresh_token:', uid);
      } catch (jwtError) {
        console.error('[OAuth] Failed to decode refresh_token:', jwtError.message);
      }
    }
    
    // Also check if media_token has the uid
    if (!uid && mediaToken) {
      try {
        const base64Payload = mediaToken.split('.')[1];
        const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
        uid = payload.user || payload.sub;
        console.log('[OAuth] Extracted uid from media_token:', uid);
      } catch (jwtError) {
        console.error('[OAuth] Failed to decode media_token:', jwtError.message);
      }
    }
    
    if (actualAccessToken) {
      res.cookie('access_token', actualAccessToken, {
        httpOnly: true,        // JavaScript CANNOT access this cookie (XSS protection)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict',    // Strict: Cookie not sent on cross-site requests (prevents cross-tab/incognito sharing)
        maxAge: expiresIn * 1000, // Convert seconds to milliseconds
        path: '/'
      });
      console.log('[OAuth] Access token stored in HttpOnly cookie');
    } else {
      console.warn('[OAuth] WARNING: No access token or media token available!');
    }
    
    if (refreshToken) {
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',    // Strict: Cookie not sent on cross-site requests (prevents cross-tab/incognito sharing)
        maxAge: (tokenData.refresh_expires_in || 86400) * 1000, // Default 24 hours
        path: '/'
      });
      console.log('[OAuth] Refresh token stored in HttpOnly cookie');
    }
    
    // Return non-sensitive data only (no tokens)
    // uid is extracted from refresh_token or media_token JWT
    res.json({
      success: true,
      uid: uid,
      expires_in: expiresIn,
      token_type: tokenData.token_type || 'Bearer',
      scope: tokenData.scope || 'email profile'
    });
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
router.post('/userinfo', async (req, res) => {
  try {
    // SECURITY FIX (CVE-002): Get access token from HttpOnly cookie
    const access_token = req.cookies.access_token || req.body.access_token;
    const uid = req.body.uid;

    if (!access_token) {
      return res.status(401).json({
        error: 'No access token found',
        message: 'Authentication required'
      });
    }

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
    console.log('[OAuth] User info response keys:', Object.keys(response.data));
    console.log('[OAuth] User info response:', JSON.stringify(response.data, null, 2));
    
    // IMPORTANT: Ensure uid is included in the response for logout
    const userInfoResponse = response.data;
    if (userId && !userInfoResponse.uid) {
      console.log('[OAuth] Adding uid to userinfo response for logout:', userId);
      userInfoResponse.uid = userId;
    }
    
    res.json(userInfoResponse);
  } catch (error) {
    console.error('[OAuth] User info error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'User info fetch failed',
      details: error.response?.data || error.message,
    });
  }
});

// STEP 5: User Profile - Fetch user profile
router.post('/profile', async (req, res) => {
  try {
    // SECURITY FIX (CVE-002): Get access token from HttpOnly cookie
    const access_token = req.cookies.access_token || req.body.access_token;
    const uid = req.body.uid;

    if (!access_token) {
      return res.status(401).json({
        error: 'No access token found',
        message: 'Authentication required'
      });
    }

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
    // Use /ivplogout endpoint per provider change; only user_id required
    console.log('[OAuth] Calling:', `${OAUTH_BASE_URL}/ivplogout`);
    console.log('[OAuth] Logout payload:', { user_id });

    // Call OAuth provider logout endpoint (ivplogout expects only user_id)
    const response = await axiosInstance.post(`${OAUTH_BASE_URL}/ivplogout`, {
      user_id,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[OAuth] Logout successful');
    
    // SECURITY FIX (CVE-002): Clear HttpOnly cookies
    res.clearCookie('access_token', { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    res.clearCookie('refresh_token', { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    console.log('[OAuth] HttpOnly cookies cleared');
    
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

/**
 * Refresh access token using refresh token
 * POST /api/oauth/refresh
 */
router.post('/refresh', async (req, res) => {
  try {
    // SECURITY FIX (CVE-005): Implement refresh token flow
    console.log('[OAuth] Refresh token request received');
    
    // Get refresh token from HttpOnly cookie
    const refreshToken = req.cookies.refresh_token;
    
    if (!refreshToken) {
      console.error('[OAuth] No refresh token in cookie');
      return res.status(401).json({
        success: false,
        error: 'No refresh token available',
        message: 'Please log in again'
      });
    }
    
    console.log('[OAuth] Refresh token found, exchanging with OAuth provider...');
    console.log('[OAuth] Using OAuth Base URL:', OAUTH_BASE_URL);
    
    // Exchange refresh token with OAuth provider
    // IVP ISEA endpoint: POST /oauth/token with grant_type=refresh_token
    const tokenUrl = `${OAUTH_BASE_URL}/oauth/token`;
    console.log('[OAuth] Token URL:', tokenUrl);
    
    const tokenResponse = await axiosInstance.post(
      tokenUrl,
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );
    
    console.log('[OAuth] Refresh response status:', tokenResponse.status);
    console.log('[OAuth] Refresh response data:', JSON.stringify(tokenResponse.data, null, 2));
    
    // Extract tokens from nested response structure
    const outerData = tokenResponse.data.data || tokenResponse.data;
    const tokenData = outerData.data || outerData;
    
    const newAccessToken = tokenData.access_token;
    const newRefreshToken = tokenData.refresh_token; // May get new refresh token
    const expiresIn = tokenData.expires_in || 3600;
    
    if (!newAccessToken) {
      console.error('[OAuth] No access token in refresh response');
      return res.status(500).json({
        success: false,
        error: 'Token refresh failed',
        message: 'No access token received from OAuth provider'
      });
    }
    
    // Update access token cookie
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresIn * 1000,
      path: '/'
    });
    console.log('[OAuth] New access token stored in HttpOnly cookie');
    
    // Update refresh token if provider sent a new one (some providers rotate refresh tokens)
    if (newRefreshToken && newRefreshToken !== refreshToken) {
      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: (tokenData.refresh_expires_in || 86400) * 1000,
        path: '/'
      });
      console.log('[OAuth] New refresh token stored in HttpOnly cookie');
    }
    
    // Return success (tokens are in cookies, not in response body)
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      expires_in: expiresIn
    });
    
  } catch (error) {
    console.error('[OAuth] Token refresh error:');
    console.error('[OAuth] Error status:', error.response?.status);
    console.error('[OAuth] Error data:', error.response?.data);
    console.error('[OAuth] Error message:', error.message);
    
    // If refresh token is invalid/expired, clear cookies and require re-login
    if (error.response?.status === 400 || error.response?.status === 401) {
      res.clearCookie('access_token', { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      res.clearCookie('refresh_token', { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      console.log('[OAuth] Refresh token invalid, cookies cleared');
      
      return res.status(401).json({
        success: false,
        error: 'Refresh token expired',
        message: 'Please log in again',
        requiresLogin: true
      });
    }
    
    // Generic error
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Token refresh failed',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;
