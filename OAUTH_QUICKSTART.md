# 🔄 OAuth Migration Quick Start

## Prerequisites

Before you begin, ensure you have:
- Access to IVP ISEA OAuth provider
- Client ID: `owl`
- Callback URL registered with OAuth provider

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies

The required dependencies are already in your `package.json`. Just run:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### Step 2: Configure Environment Variables

#### Frontend Configuration

Create `.env.local` in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# For Production
NEXT_PUBLIC_OAUTH_LOGIN_URL=https://ivp.isea.in/backend/loginRedirect
NEXT_PUBLIC_OAUTH_CLIENT_ID=owl
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://sites.isea.in/auth/callback
NEXT_PUBLIC_BACKEND_URL=http://sites.isea.in
NEXT_PUBLIC_API_URL=http://sites.isea.in/api

# For Local Development
# NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
# NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Backend Configuration

Create `.env` in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# OAuth Configuration
OAUTH_BASE_URL=https://ivp.isea.in/backend
OAUTH_CLIENT_ID=owl

# Database
MONGODB_URI=mongodb://localhost:27017/sitebuilder

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# JWT (for internal operations)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Update OAuth Callback URL

Ensure the OAuth provider has your callback URL registered:

- **Production**: `http://sites.isea.in/auth/callback`
- **Development**: `http://localhost:3000/auth/callback`

### Step 4: Start the Application

```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
npm run dev
```

### Step 5: Test Authentication

1. Open browser to `http://localhost:3000`
2. Click "Sign In" or "Sign Up"
3. Click "Sign in with IVP ISEA OAuth"
4. Authenticate with OAuth provider
5. Complete profile if prompted
6. Done! ✅

---

## 🔍 What to Check

### ✅ Checklist

- [ ] MongoDB is running
- [ ] Backend server started successfully (check port 5000)
- [ ] Frontend development server started (check port 3000)
- [ ] Environment variables are set correctly
- [ ] OAuth callback URL is registered
- [ ] Can access login page
- [ ] Can click OAuth login button
- [ ] Redirects to OAuth provider
- [ ] Can complete authentication

---

## 📝 Key Files Modified

All changes are already implemented. Here's what was modified:

### New Files
- ✅ `lib/oauth.ts` - OAuth authentication library
- ✅ `app/auth/callback/page.tsx` - OAuth callback handler
- ✅ `app/auth/complete-profile/page.tsx` - Profile completion
- ✅ `backend/src/routes/oauth.js` - OAuth proxy routes
- ✅ `backend/src/controllers/oauthController.js` - OAuth logic

### Modified Files
- ✅ `app/(auth)/login/page.tsx` - Now uses OAuth button
- ✅ `app/(auth)/register/page.tsx` - Now uses OAuth button
- ✅ `lib/store/authStore.ts` - OAuth state management
- ✅ `lib/api.ts` - OAuth token handling
- ✅ `backend/src/models/User.js` - OAuth fields added
- ✅ `backend/src/server.js` - OAuth routes registered
- ✅ `app/providers.tsx` - OAuth initialization

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to OAuth provider"
**Cause**: Network issue or wrong OAuth URL  
**Solution**: Check `NEXT_PUBLIC_OAUTH_LOGIN_URL` in `.env.local`

### Issue 2: "Invalid redirect_uri"
**Cause**: Callback URL not registered  
**Solution**: Register callback URL with OAuth provider

### Issue 3: "Invalid state parameter"
**Cause**: CSRF token mismatch or expired  
**Solution**: 
```javascript
// Clear sessionStorage and try again
sessionStorage.clear();
```

### Issue 4: "Failed to sync user"
**Cause**: Backend not running or database connection issue  
**Solution**: 
1. Check backend logs
2. Verify MongoDB is running
3. Check `MONGODB_URI` in `backend/.env`

### Issue 5: "Profile not found"
**Cause**: User hasn't completed profile on OAuth provider  
**Solution**: User will be redirected to `/auth/complete-profile` automatically

---

## 🔐 Security Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use HTTPS in production** - OAuth requires secure connections
3. **Rotate secrets regularly** - Change JWT_SECRET periodically
4. **Monitor OAuth tokens** - Tokens are stored in sessionStorage (auto-cleared on browser close)

---

## 📚 Next Steps

1. **Test thoroughly** - Try login/logout flows
2. **Update production URLs** - Change URLs in `.env` files for production
3. **Configure SSL** - Set up HTTPS for production
4. **Monitor logs** - Check backend logs for any OAuth errors
5. **User training** - Inform users about new OAuth login

---

## 🆘 Need Help?

1. Check `OAUTH_IMPLEMENTATION.md` for detailed documentation
2. Review `OAuth_Guide.md` for OAuth flow details
3. Check backend logs: `cd backend && npm run dev`
4. Check browser console for frontend errors

---

## ✅ Success Criteria

You'll know everything is working when:

- ✅ Login button redirects to OAuth provider
- ✅ After OAuth login, user returns to your app
- ✅ User sees their profile information
- ✅ User can access protected routes
- ✅ Logout clears session properly
- ✅ Can login again after logout

---

**That's it! Your authentication is now powered by OAuth 2.0!** 🎉
