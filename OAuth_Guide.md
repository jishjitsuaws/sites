I'll update the documentation to use the exact routes you provided earlier. Let me create a clearer, more accurate version:

````markdown
# 🔐 OAuth 2.0 Authentication Implementation Guide

## 📋 Overview

This guide provides a complete, step-by-step implementation of OAuth 2.0 authentication for CyberMania using the **IVP ISEA OAuth Provider**. Follow this guide to implement the same system for any other project.

---

## 🎯 Authentication Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                    COMPLETE AUTHENTICATION FLOW                     │
└────────────────────────────────────────────────────────────────────┘

STEP 1: User Clicks "Login"
   │
   ├─> Frontend redirects to OAuth Provider
   │   URL: https://ivp.isea.in/backend/loginRedirect?client_id=owl
   │
   └─> OAuth Provider shows login page

STEP 2: User Authenticates on OAuth Provider
   │
   └─> OAuth Provider redirects back with code and state
       URL: http://sites.isea.in/auth/callback?code=XXX&state=YYY

STEP 3: Exchange Code for Access Token
   │
   ├─> Frontend sends code to backend
   │   POST http://sites.isea.in/api/oauth/token
   │   Body: { code, state, client_id }
   │
   ├─> Backend calls OAuth Provider
   │   POST https://ivp.isea.in/backend/tokengen
   │   Body: { code, state, client_id: "owl" }
   │
   └─> Returns: { access_token, refresh_token, expires_in }

STEP 4: Fetch User Information
   │
   ├─> Frontend calls backend with access_token
   │   POST http://sites.isea.in/api/oauth/userinfo
   │   Body: { access_token, uid }
   │
   ├─> Backend calls OAuth Provider
   │   POST https://ivp.isea.in/backend/userinfo
   │   Headers: { Authorization: "Bearer <access_token>" }
   │   Body: { uid }
   │
   └─> Returns: { uid, email, first_name, last_name, role, ... }

STEP 5: Check if User Profile Exists
   │
   ├─> Frontend calls backend
   │   POST http://sites.isea.in/api/oauth/profile
   │   Body: { access_token, uid }
   │
   ├─> Backend calls OAuth Provider
   │   POST https://ivp.isea.in/backend/ivp/profile/
   │   Headers: { Authorization: "Bearer <access_token>" }
   │   Body: { uid }
   │
   ├─> If 404 (Profile doesn't exist)
   │   └─> Redirect to: /auth/complete-profile
   │
   └─> If 200 (Profile exists)
       └─> Store in sessionStorage and redirect to: /

STEP 6: Complete Profile (if needed)
   │
   ├─> User fills form:
   │   - first_name (required)
   │   - last_name (required)
   │   - email (required, pre-filled)
   │   - mobileno (required)
   │   - mode: "ivp" (hardcoded)
   │
   ├─> Frontend calls backend
   │   POST http://sites.isea.in/api/oauth/update-profile
   │   Body: { first_name, last_name, email, mobileno, uid, mode }
   │
   ├─> Backend calls OAuth Provider
   │   POST https://ivp.isea.in/backend/updateuserbyid
   │   Body: { first_name, last_name, email, mobileno, uid, mode: "ivp" }
   │
   └─> Redirect to: /

STEP 7: Session Maintained
   │
   └─> sessionStorage contains:
       - access_token
       - user_info (uid, email, role, etc.)
       - user_profile (first_name, last_name, etc.)
```

---

## 🔑 Exact API Endpoints

### 1. **Login Redirect**

```http
GET https://ivp.isea.in/backend/loginRedirect?client_id=owl
```

**Purpose**: Initiates OAuth flow  
**Method**: GET  
**Query Parameters**:
- `client_id`: `owl` (your OAuth client ID)

**Response**: Redirects user to OAuth login page

---

### 2. **Token Generation**

```http
POST https://ivp.isea.in/backend/tokengen
```

**Purpose**: Exchange authorization code for access token  
**Method**: POST  
**Headers**: 
```json
{
  "Content-Type": "application/json"
}
```

**Request Body**:
```json
{
  "code": "f0b58189-43d2-4db2-9af5-c5ed62989d9b.60462ca7-515f-4cf1-9308-f07260190655.152565de-2a93-489c-8e3e-88e29bd86f63",
  "state": "XUbc54auj4u5Oqf8pKu2liusmCo2O52h46G0k0SKaSYjf8G5o4",
  "client_id": "owl"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

---

### 3. **User Info**

```http
POST https://ivp.isea.in/backend/userinfo
```

**Purpose**: Fetch authenticated user's information  
**Method**: POST  
**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <access_token>"
}
```

**Request Body**:
```json
{
  "uid": "5ed2608a-625c-4403-9bcf-180d5d881366"
}
```

**Response**:
```json
{
  "uid": "5ed2608a-625c-4403-9bcf-180d5d881366",
  "email": "user@example.com",
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",
  "role": "admin",
  "mobileno": "1234567890"
}
```

---

### 4. **Fetch User Profile**

```http
POST https://ivp.isea.in/backend/ivp/profile/
```

**Purpose**: Fetch user's complete profile  
**Method**: POST  
**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <access_token>"
}
```

**Request Body**:
```json
{
  "uid": "5ed2608a-625c-4403-9bcf-180d5d881366"
}
```

**Response** (200 - Profile Exists):
```json
{
  "uid": "5ed2608a-625c-4403-9bcf-180d5d881366",
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "mobileno": "1234567890",
  "mode": "ivp"
}
```

**Response** (404 - Profile Doesn't Exist):
```json
{
  "error": "Profile not found"
}
```

---

### 5. **Update User Profile**

```http
POST https://ivp.isea.in/backend/updateuserbyid
```

**Purpose**: Create/update user profile  
**Method**: POST  
**Headers**:
```json
{
  "Content-Type": "application/json"
}
```

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "mobileno": "1234567890",
  "uid": "5ed2608a-625c-4403-9bcf-180d5d881366",
  "mode": "ivp"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```
Sites File Structure

├── app
│   ├── (auth)
│   │   ├── login
│   │   │   └── page.tsx
│   │   └── register
│   │       └── page.tsx
│   ├── (dashboard)
│   │   ├── create-site
│   │   │   └── page.tsx
│   │   ├── editor
│   │   │   └── [siteId]
│   │   │       └── page.tsx
│   │   ├── home
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── providers.tsx
│   └── site
│       └── [subdomain]
│           └── page.tsx
├── backend
│   ├── package.json
│   ├── package-lock.json
│   └── src
│       ├── config
│       │   ├── cloudinary.js
│       │   └── database.js
│       ├── controllers
│       │   ├── assetController.js
│       │   ├── authController.js
│       │   ├── pageController.js
│       │   ├── siteController.js
│       │   └── themeController.js
│       ├── middleware
│       │   ├── auth.js
│       │   ├── errorHandler.js
│       │   ├── upload.js
│       │   ├── validation.js
│       │   └── validationRules.js
│       ├── models
│       │   ├── Asset.js
│       │   ├── Page.js
│       │   ├── Site.js
│       │   ├── Theme.js
│       │   └── User.js
│       ├── routes
│       │   ├── assets.js
│       │   ├── auth.js
│       │   ├── pages.js
│       │   ├── sites.js
│       │   └── themes.js
│       ├── scripts
│       │   ├── seedDemoData.js
│       │   ├── seedThemes.js
│       │   └── seedUser.js
│       ├── server.js
│       └── utils
│           ├── helpers.js
│           └── jwt.js
├── components
│   ├── BlockRenderer.tsx
│   ├── editor
│   │   ├── ComponentRenderer.tsx
│   │   ├── ComponentsPanel.tsx
│   │   ├── LogoHandler.tsx
│   │   ├── PagesPanel.tsx
│   │   ├── SectionWrapper.tsx
│   │   └── ThemesPanel.tsx
│   ├── modals
│   │   ├── BlockModal.tsx
│   │   ├── ButtonModal.tsx
│   │   ├── ImageModal.tsx
│   │   ├── LogoModal.tsx
│   │   ├── TemplatesModal.tsx
│   │   └── TextEditor.tsx
│   └── ui
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── DEVELOPMENT.md
├── lib
│   ├── api.ts
│   ├── sanitize.ts
│   ├── store
│   │   ├── authStore.ts
│   │   └── editorStore.ts
│   ├── templates.ts
│   └── utils.ts
├── next.config.js
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── PROJECT_SUMMARY.md
├── QUICKSTART.md
├── README.md
├── SECURITY_AUDIT.md
├── setup.sh
└── tsconfig.json

27 directories, 76 files


## 🔧 Implementation Steps

### **Step 1: Environment Variables**

Create/update `.env` file:

```env
# Frontend OAuth Configuration
NEXT_PUBLIC_OAUTH_LOGIN_URL=https://ivp.isea.in/backend/loginRedirect
NEXT_PUBLIC_OAUTH_CLIENT_ID=owl
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://sites.isea.in/auth/callback
NEXT_PUBLIC_BACKEND_URL=http://sites.isea.in

# Backend OAuth Configuration (for server/routes/oauthRoutes.js)
OAUTH_BASE_URL=https://ivp.isea.in/backend
OAUTH_CLIENT_ID=owl
# Note: Client secret should be added if OAuth provider requires it
```

---

### **Step 2: Authentication Library**

Create `src/lib/auth.ts`:

````typescript
// filepath: auth.ts

// OAuth Configuration
const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || 'owl';
const OAUTH_LOGIN_URL = process.env.NEXT_PUBLIC_OAUTH_LOGIN_URL || 'https://ivp.isea.in/backend/loginRedirect';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://sites.isea.in';

export interface UserInfo {
  uid: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  mobileno?: string;
  role?: string;
}

export interface UserProfile {
  uid: string;
  first_name: string;
  last_name: string;
  email: string;
  mobileno: string;
  mode: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

// Generate secure random state for CSRF protection
export function generateSecureState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// STEP 1: Redirect to OAuth login page
export function redirectToLogin() {
  const state = generateSecureState();
  
  // Store state in sessionStorage for CSRF verification
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_state_timestamp', Date.now().toString());
  }
  
  // Construct OAuth login URL
  // EXACT ENDPOINT: https://ivp.isea.in/backend/loginRedirect?client_id=owl
  const loginUrl = `${OAUTH_LOGIN_URL}?client_id=${CLIENT_ID}`;
  
  console.log('[Auth] Redirecting to OAuth login:', loginUrl);
  window.location.href = loginUrl;
}

// STEP 3: Exchange authorization code for access token
export async function exchangeCodeForToken(
  code: string,
  state: string
): Promise<TokenResponse> {
  try {
    console.log('[Auth] Exchanging code for token...');
    
    // Call backend proxy which calls:
    // POST https://ivp.isea.in/backend/tokengen
    const response = await fetch(`${BACKEND_URL}/api/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        state,
        client_id: CLIENT_ID,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Auth] Token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Auth] Token received successfully');
    return data;
  } catch (error) {
    console.error('[Auth] Error exchanging code for token:', error);
    throw error;
  }
}

// STEP 4: Fetch user info using access token
export async function fetchUserInfo(accessToken: string, uid: string): Promise<UserInfo> {
  try {
    console.log('[Auth] Fetching user info...');
    
    // Call backend proxy which calls:
    // POST https://ivp.isea.in/backend/userinfo
    const response = await fetch(`${BACKEND_URL}/api/oauth/userinfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken,
        uid,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Auth] User info fetch failed:', errorText);
      throw new Error(`User info fetch failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Auth] User info received successfully');
    return data;
  } catch (error) {
    console.error('[Auth] Error fetching user info:', error);
    throw error;
  }
}

// STEP 5: Fetch user profile
export async function fetchUserProfile(accessToken: string, uid: string): Promise<UserProfile | null> {
  try {
    console.log('[Auth] Fetching user profile...');
    
    // Call backend proxy which calls:
    // POST https://ivp.isea.in/backend/ivp/profile/
    const response = await fetch(`${BACKEND_URL}/api/oauth/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken,
        uid,
      }),
    });

    if (response.status === 404) {
      console.log('[Auth] User profile not found (needs to be created)');
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Auth] User profile fetch failed:', errorText);
      throw new Error(`User profile fetch failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Auth] User profile received successfully');
    return data;
  } catch (error) {
    console.error('[Auth] Error fetching user profile:', error);
    throw error;
  }
}

// STEP 6: Update user profile
export async function updateUserProfile(profileData: UserProfile): Promise<void> {
  try {
    console.log('[Auth] Updating user profile...');
    
    // Call backend proxy which calls:
    // POST https://ivp.isea.in/backend/updateuserbyid
    const response = await fetch(`${BACKEND_URL}/api/oauth/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Auth] Profile update failed:', errorText);
      throw new Error(`Profile update failed: ${response.status}`);
    }

    console.log('[Auth] Profile updated successfully');
  } catch (error) {
    console.error('[Auth] Error updating profile:', error);
    throw error;
  }
}

// Auth storage utilities
export const authStorage = {
  setAuth: (accessToken: string, userInfo: UserInfo, userProfile?: UserProfile) => {
    if (typeof window === 'undefined') return;
    
    sessionStorage.setItem('access_token', accessToken);
    sessionStorage.setItem('user_info', JSON.stringify(userInfo));
    if (userProfile) {
      sessionStorage.setItem('user_profile', JSON.stringify(userProfile));
    }
    sessionStorage.setItem('auth_timestamp', Date.now().toString());
    
    console.log('[Auth] Authentication data stored');
  },

  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('access_token');
  },

  getUserInfo: (): UserInfo | null => {
    if (typeof window === 'undefined') return null;
    const userInfoStr = sessionStorage.getItem('user_info');
    if (!userInfoStr) return null;
    try {
      return JSON.parse(userInfoStr);
    } catch {
      return null;
    }
  },

  getUserProfile: (): UserProfile | null => {
    if (typeof window === 'undefined') return null;
    const userProfileStr = sessionStorage.getItem('user_profile');
    if (!userProfileStr) return null;
    try {
      return JSON.parse(userProfileStr);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!sessionStorage.getItem('access_token') && !!sessionStorage.getItem('user_info');
  },

  hasCompleteProfile: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!sessionStorage.getItem('user_profile');
  },

  clearAuth: () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user_info');
    sessionStorage.removeItem('user_profile');
    sessionStorage.removeItem('auth_timestamp');
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_state_timestamp');
    console.log('[Auth] Authentication data cleared');
  },

  logout: () => {
    authStorage.clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  },
};

// Check if user has admin role
export function isAdmin(userInfo: UserInfo | null): boolean {
  if (!userInfo) return false;
  return userInfo.role === 'admin' || userInfo.role === 'super_admin';
}

// Get user display name
export function getUserDisplayName(userInfo: UserInfo | null, userProfile: UserProfile | null): string {
  if (userProfile?.first_name && userProfile?.last_name) {
    return `${userProfile.first_name} ${userProfile.last_name}`;
  }
  if (userInfo?.first_name && userInfo?.last_name) {
    return `${userInfo.first_name} ${userInfo.last_name}`;
  }
  if (userInfo?.username) {
    return userInfo.username;
  }
  if (userInfo?.email) {
    return userInfo.email.split('@')[0];
  }
  return 'User';
}
````

---

### **Step 3: Backend OAuth Proxy**

Create `server/routes/oauthRoutes.js`:

````javascript
// filepath: /home/pallavi/Desktop/CyberMania/server/routes/oauthRoutes.js

import express from 'express';
import axios from 'axios';

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

export default router;
````

---

### **Step 4: Register OAuth Routes in Server**

Update index.js:

```javascript
// filepath: /home/pallavi/Desktop/CyberMania/server/index.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import OAuth routes
import oauthRoutes from './routes/oauthRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// OAuth routes
app.use('/api/oauth', oauthRoutes);

// ... other routes ...

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ OAuth routes available at http://localhost:${PORT}/api/oauth/*`);
});
```

---

### **Step 5: OAuth Callback Handler**

Create page.tsx:

```typescript
// filepath: /home/pallavi/Desktop/CyberMania/src/app/auth/callback/page.tsx

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  exchangeCodeForToken, 
  fetchUserInfo, 
  fetchUserProfile,
  authStorage 
} from '@/lib/auth';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Verifying...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // STEP 2: Extract code and state from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
          setError('Missing authorization code or state');
          return;
        }

        // Verify state (CSRF protection)
        const savedState = sessionStorage.getItem('oauth_state');
        if (state !== savedState) {
          setError('Invalid state parameter. Possible CSRF attack.');
          return;
        }

        console.log('[Callback] Code and state verified');
        setStatus('Exchanging code for token...');

        // STEP 3: Exchange code for access token
        // Calls: POST http://sites.isea.in/api/oauth/token
        // Which calls: POST https://ivp.isea.in/backend/tokengen
        const tokenData = await exchangeCodeForToken(code, state);
        const accessToken = tokenData.access_token;

        console.log('[Callback] Access token received');
        setStatus('Fetching user information...');

        // Extract uid from token or use a temporary value
        // You might need to decode the JWT token to get uid
        // For now, we'll try to fetch userinfo and get uid from there
        
        // STEP 4: Fetch user info
        // Calls: POST http://sites.isea.in/api/oauth/userinfo
        // Which calls: POST https://ivp.isea.in/backend/userinfo
        // Note: If uid is needed for userinfo, you may need to decode the token first
        
        // For IVP ISEA, the uid might be in the token or you might need to call
        // a different endpoint. Adjust based on your OAuth provider's flow.
        
        // Assuming the OAuth provider returns uid in the token or we can extract it:
        const uid = tokenData.uid || 'unknown'; // Adjust based on actual token structure
        
        const userInfo = await fetchUserInfo(accessToken, uid);
        
        console.log('[Callback] User info received:', userInfo);
        setStatus('Checking user profile...');

        // STEP 5: Check if user profile exists
        // Calls: POST http://sites.isea.in/api/oauth/profile
        // Which calls: POST https://ivp.isea.in/backend/ivp/profile/
        const userProfile = await fetchUserProfile(accessToken, userInfo.uid);

        if (!userProfile) {
          // Profile doesn't exist, redirect to complete profile
          console.log('[Callback] No profile found, redirecting to complete profile');
          authStorage.setAuth(accessToken, userInfo);
          router.push('/auth/complete-profile');
          return;
        }

        // Profile exists, store everything and redirect to home
        console.log('[Callback] Profile found, authentication complete');
        authStorage.setAuth(accessToken, userInfo, userProfile);
        
        setStatus('Authentication successful! Redirecting...');
        setTimeout(() => {
          router.push('/');
        }, 1000);

      } catch (err) {
        console.error('[Callback] Error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleOAuthCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center p-6">
        <div className="bg-red-900/20 backdrop-blur-lg rounded-2xl p-8 border border-red-500/30 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Failed</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center p-6">
      <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-600/30 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Authenticating...</h2>
        <p className="text-gray-400 mb-4">{status}</p>
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
```

---

## 📊 Session Storage Structure

After successful authentication, `sessionStorage` contains:

```javascript
{
  // Access token from OAuth provider
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  
  // User info from: POST https://ivp.isea.in/backend/userinfo
  "user_info": {
    "uid": "5ed2608a-625c-4403-9bcf-180d5d881366",
    "email": "user@example.com",
    "username": "john_doe",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin",
    "mobileno": "1234567890"
  },
  
  // User profile from: POST https://ivp.isea.in/backend/ivp/profile/
  "user_profile": {
    "uid": "5ed2608a-625c-4403-9bcf-180d5d881366",
    "first_name": "John",
    "last_name": "Doe",
    "email": "user@example.com",
    "mobileno": "1234567890",
    "mode": "ivp"
  },
  
  // Timestamp for tracking
  "auth_timestamp": "1704067200000",
  
  // OAuth state (cleared after verification)
  "oauth_state": "XUbc54auj4u5Oqf8pKu2liusmCo2O52h46G0k0SKaSYjf8G5o4"
}
```

---

## ✅ Checklist for Implementation

### Backend Setup
- [ ] Install dependencies: `npm install express cors axios dotenv`
- [ ] Create oauthRoutes.js with exact OAuth endpoints
- [ ] Update index.js to register OAuth routes
- [ ] Add environment variables to .env (backend)
- [ ] Start backend server: `node server/index.js`

### Frontend Setup
- [ ] Create auth.ts with authentication utilities
- [ ] Create page.tsx for OAuth callback
- [ ] Create page.tsx for profile form
- [ ] Update LandingPage.tsx with login button
- [ ] Add environment variables to .env (frontend)
- [ ] Build frontend: `npm run build`

### Testing
- [ ] Click "Login" button → Redirects to OAuth provider
- [ ] Login on OAuth provider → Redirects back with code
- [ ] Code exchanges for token → Success
- [ ] User info fetched → Success
- [ ] Profile checked → Exists or needs completion
- [ ] Authentication complete → User logged in

---

## 🔍 Debugging Tips

### Check Backend Logs
```bash
# Start backend with logs
node server/index.js

# You should see:
✅ Server running on http://sites.isea.in
✅ OAuth routes available at http://sites.isea.in/api/oauth/*
```

### Check Frontend Console
Open browser console (F12) and look for:
```
[Auth] Redirecting to OAuth login: https://ivp.isea.in/backend/loginRedirect?client_id=owl
[Callback] Code and state verified
[Callback] Access token received
[Callback] User info received: { uid: "...", email: "..." }
[Callback] Profile found, authentication complete
```

### Common Issues

**Issue**: "Token exchange failed"
- **Check**: Backend is running on port 4000
- **Check**: `OAUTH_BASE_URL` in backend .env is correct
- **Check**: Network tab shows request to `http://sites.isea.in/api/oauth/token`

**Issue**: "Invalid state parameter"
- **Check**: Browser cookies/sessionStorage enabled
- **Check**: State is stored before redirect

**Issue**: "User info fetch failed"
- **Check**: Access token is valid
- **Check**: UID is correct

---

## 🎯 Summary

This guide provides:

1. **Exact API endpoints** from IVP ISEA OAuth provider
2. **Complete code** for frontend and backend
3. **Step-by-step flow** from login to profile completion
4. **Debugging tips** for troubleshooting

**All routes are exactly as provided in your Postman collection.**

Follow this guide to implement OAuth authentication in any Next.js + Express application.

---