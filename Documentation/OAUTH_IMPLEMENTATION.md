# 🔐 OAuth 2.0 Authentication - Implementation Guide

## Overview

This application now uses **OAuth 2.0 authentication** powered by **IVP ISEA OAuth Provider**. All authentication is handled through a secure OAuth flow instead of traditional username/password authentication.

---

## 🎯 What Changed

### **Removed**
- ❌ Traditional username/password login forms
- ❌ Local password storage and hashing
- ❌ Manual user registration forms
- ❌ JWT token refresh logic (using OAuth tokens directly)

### **Added**
- ✅ OAuth 2.0 authentication flow
- ✅ IVP ISEA OAuth integration
- ✅ Profile completion workflow
- ✅ User synchronization with local database
- ✅ OAuth token management
- ✅ CSRF protection with state parameter

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
└─────────────────────────────────────────────────────────────┘

1. User clicks "Sign in with IVP ISEA OAuth"
   │
   └─> Redirects to: https://ivp.isea.in/backend/loginRedirect?client_id=owl

2. User authenticates on OAuth Provider
   │
   └─> OAuth Provider redirects back with code & state

3. Callback page (/auth/callback)
   │
   ├─> Exchanges code for access_token
   ├─> Fetches user information
   ├─> Checks if profile exists
   │   ├─> If incomplete: Redirect to /auth/complete-profile
   │   └─> If complete: Continue
   ├─> Syncs user with local database
   └─> Redirects to /home

4. User is authenticated ✓
```

---

## 📁 New Files Created

### Frontend

1. **`lib/oauth.ts`**
   - Core OAuth authentication library
   - Functions: `redirectToLogin()`, `exchangeCodeForToken()`, `fetchUserInfo()`, etc.
   - Token and user data storage utilities

2. **`app/auth/callback/page.tsx`**
   - Handles OAuth callback redirect
   - Exchanges authorization code for access token
   - Manages authentication flow

3. **`app/auth/complete-profile/page.tsx`**
   - Profile completion form
   - Required when OAuth profile is incomplete

### Backend

1. **`backend/src/routes/oauth.js`**
   - Proxy routes to OAuth provider
   - Endpoints: `/api/oauth/token`, `/api/oauth/userinfo`, `/api/oauth/profile`, `/api/oauth/update-profile`, `/api/oauth/sync-user`

2. **`backend/src/controllers/oauthController.js`**
   - User synchronization logic
   - OAuth user management
   - Database operations

---

## 📝 Modified Files

### Frontend

1. **`app/(auth)/login/page.tsx`**
   - Replaced form with OAuth login button
   
2. **`app/(auth)/register/page.tsx`**
   - Replaced registration form with OAuth button

3. **`lib/store/authStore.ts`**
   - Updated to handle OAuth tokens
   - Added OAuth user data management

4. **`lib/api.ts`**
   - Updated to use OAuth access tokens
   - Removed refresh token logic

### Backend

1. **`backend/src/models/User.js`**
   - Added OAuth fields: `oauthProvider`, `oauthUid`, `oauthAccessToken`
   - Made password optional for OAuth users
   - Added OAuth indexes

2. **`backend/src/server.js`**
   - Registered OAuth routes

---

## ⚙️ Configuration

### Environment Variables

#### Frontend (`.env.local`)

```env
NEXT_PUBLIC_OAUTH_LOGIN_URL=https://ivp.isea.in/backend/loginRedirect
NEXT_PUBLIC_OAUTH_CLIENT_ID=owl
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://sites.isea.in/auth/callback
NEXT_PUBLIC_BACKEND_URL=http://sites.isea.in
NEXT_PUBLIC_API_URL=http://sites.isea.in/api
```

#### Backend (`backend/.env`)

```env
OAUTH_BASE_URL=https://ivp.isea.in/backend
OAUTH_CLIENT_ID=owl
MONGODB_URI=mongodb://localhost:27017/sitebuilder
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### 2. Configure Environment

```bash
# Frontend
cp .env.local.example .env.local
# Edit .env.local with your values

# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

### 3. Start the Application

```bash
# Start backend
cd backend
npm run dev

# Start frontend (in another terminal)
npm run dev
```

### 4. Test OAuth Flow

1. Navigate to `http://localhost:3000/login`
2. Click "Sign in with IVP ISEA OAuth"
3. You'll be redirected to OAuth provider
4. After authentication, you'll return to the app
5. Complete your profile if prompted
6. You're now logged in!

---

## 🔑 API Endpoints

### OAuth Proxy Routes (Backend)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/oauth/token` | POST | Exchange code for access token |
| `/api/oauth/userinfo` | POST | Fetch user information |
| `/api/oauth/profile` | POST | Fetch user profile |
| `/api/oauth/update-profile` | POST | Update user profile |
| `/api/oauth/sync-user` | POST | Sync user with local database |
| `/api/oauth/user/:uid` | GET | Get user by OAuth UID |
| `/api/oauth/disconnect` | POST | Disconnect OAuth (requires auth) |

---

## 🔒 Security Features

1. **CSRF Protection**
   - Secure random state parameter
   - State validation on callback

2. **Token Storage**
   - Access tokens in sessionStorage (not localStorage)
   - Automatic cleanup on logout

3. **OAuth Provider Validation**
   - All requests proxied through backend
   - OAuth provider handles authentication

4. **User Data Sync**
   - Local database stores minimal user info
   - OAuth provider is source of truth

---

## 🎨 User Experience

### Login Flow
1. User clicks "Sign in with IVP ISEA OAuth"
2. Redirects to OAuth provider login page
3. User authenticates with OAuth provider credentials
4. Returns to app and automatically logged in

### Profile Completion
- If user profile is incomplete on OAuth provider
- User is redirected to `/auth/complete-profile`
- Required fields: First Name, Last Name, Email, Mobile Number
- Profile saved to OAuth provider

### Logout
- Clears all session data
- Redirects to login page
- User must re-authenticate with OAuth provider

---

## 🛠️ Development Notes

### Testing OAuth Flow Locally

1. Update callback URL in OAuth provider settings
2. Set `NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback`
3. Ensure backend is accessible at the configured URL

### Database Schema

The User model now includes:

```javascript
{
  // Existing fields...
  email: String,
  name: String,
  
  // OAuth fields
  oauthProvider: String,  // 'ivp', 'google', 'github', etc.
  oauthUid: String,        // OAuth provider's user ID
  oauthAccessToken: String, // OAuth access token (encrypted)
  
  // Password is now optional (only for non-OAuth users)
  password: String
}
```

---

## 🐛 Troubleshooting

### Issue: "Invalid state parameter"
**Solution**: Clear sessionStorage and try again. State tokens expire.

### Issue: "Profile not found"
**Solution**: Complete your profile at `/auth/complete-profile`

### Issue: "Authentication failed"
**Solution**: 
- Check OAuth provider credentials
- Verify environment variables
- Check backend logs for detailed error

### Issue: "Token expired"
**Solution**: OAuth tokens expire. User needs to re-authenticate by logging in again.

---

## 📚 Additional Resources

- [OAuth Guide](./OAuth_Guide.md) - Detailed OAuth implementation guide
- [IVP ISEA OAuth Provider Documentation](https://ivp.isea.in/backend/)

---

## ✅ Migration Checklist

- [x] OAuth authentication library created
- [x] OAuth callback page implemented
- [x] Profile completion page added
- [x] Backend OAuth proxy routes created
- [x] User model updated for OAuth
- [x] OAuth controller implemented
- [x] Login page updated
- [x] Register page updated
- [x] Auth store updated for OAuth
- [x] API client updated for OAuth tokens
- [x] Backend server routes registered
- [x] Environment configuration updated

---

## 🎉 Success!

Your authentication system is now powered by OAuth 2.0! Users can securely sign in using their IVP ISEA accounts without managing passwords in your application.
