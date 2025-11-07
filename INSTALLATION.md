# 🔧 Installation & Setup Instructions

## 📦 Step-by-Step Setup

### 1️⃣ Prerequisites Check

Ensure you have:
- ✅ Node.js 18+ installed
- ✅ MongoDB running (local or remote)
- ✅ Git installed
- ✅ OAuth Client ID from IVP ISEA (`owl`)

---

### 2️⃣ Clone & Install Dependencies

```bash
# Navigate to project directory
cd /home/pallavi/Desktop/sites

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

---

### 3️⃣ Environment Configuration

#### Frontend Configuration

Create `.env.local` in the root directory:

```bash
# Create from example
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Production Configuration
NEXT_PUBLIC_OAUTH_LOGIN_URL=https://ivp.isea.in/backend/loginRedirect
NEXT_PUBLIC_OAUTH_CLIENT_ID=owl
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://sites.isea.in/auth/callback
NEXT_PUBLIC_BACKEND_URL=http://sites.isea.in
NEXT_PUBLIC_API_URL=http://sites.isea.in/api

# For Local Development, uncomment and use:
# NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
# NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Backend Configuration

Create `.env` in the backend directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# OAuth Configuration
OAUTH_BASE_URL=https://ivp.isea.in/backend
OAUTH_CLIENT_ID=owl

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/sitebuilder

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# JWT Configuration (for internal operations)
JWT_SECRET=your-super-secret-jwt-key-CHANGE-THIS-IN-PRODUCTION
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cloudinary (if using image uploads)
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

---

### 4️⃣ Database Setup

```bash
# Start MongoDB (if not already running)
sudo systemctl start mongodb

# Or if using Docker:
# docker run -d -p 27017:27017 --name mongodb mongo

# Verify MongoDB is running
mongosh --eval "db.version()"
```

---

### 5️⃣ OAuth Provider Setup

Ensure your OAuth callback URL is registered with IVP ISEA:

**Development:**
```
http://localhost:3000/auth/callback
```

**Production:**
```
http://sites.isea.in/auth/callback
```

Contact IVP ISEA administrator to register your callback URL if not already done.

---

### 6️⃣ Start the Application

#### Option A: Development Mode (Recommended for testing)

```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend (in new terminal)
cd /home/pallavi/Desktop/sites
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

#### Option B: Production Mode

```bash
# Build frontend
npm run build

# Start frontend
npm start

# Start backend (in separate terminal)
cd backend
NODE_ENV=production npm start
```

---

### 7️⃣ Verify Installation

#### Check Backend Health

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-07T...",
  "environment": "development"
}
```

#### Check Frontend

1. Open browser to http://localhost:3000
2. You should see the homepage
3. Click "Sign In"
4. You should see "Sign in with IVP ISEA OAuth" button

---

### 8️⃣ Test OAuth Flow

1. Navigate to http://localhost:3000/login
2. Click "Sign in with IVP ISEA OAuth"
3. You'll be redirected to OAuth provider
4. Login with your IVP ISEA credentials
5. After authentication, you'll return to the app
6. Complete your profile if prompted
7. You should be redirected to /home

✅ **Success!** If you reach the home page, OAuth is working correctly.

---

## 🐛 Troubleshooting

### Issue: Cannot connect to MongoDB

```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Start MongoDB
sudo systemctl start mongodb

# Or if using Docker
docker start mongodb
```

### Issue: Backend won't start

```bash
# Check if port 5000 is already in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>

# Or use different port in backend/.env
PORT=5001
```

### Issue: Frontend won't start

```bash
# Check if port 3000 is already in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

### Issue: "Invalid redirect_uri"

**Solution:** Ensure callback URL is registered with OAuth provider:
- Development: http://localhost:3000/auth/callback
- Production: http://sites.isea.in/auth/callback

### Issue: "Failed to exchange code for token"

**Check:**
1. OAUTH_BASE_URL is correct in backend/.env
2. OAUTH_CLIENT_ID is correct
3. Backend server is running
4. Network connectivity to https://ivp.isea.in

### Issue: CORS errors

**Solution:** Update CORS_ORIGIN in backend/.env:
```env
CORS_ORIGIN=http://localhost:3000
```

Or for multiple origins:
```javascript
// In backend/src/server.js
const corsOptions = {
  origin: ['http://localhost:3000', 'http://sites.isea.in'],
  credentials: true
};
```

---

## 📝 Environment Variables Summary

### Frontend (.env.local)

| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_OAUTH_LOGIN_URL | OAuth login endpoint | https://ivp.isea.in/backend/loginRedirect |
| NEXT_PUBLIC_OAUTH_CLIENT_ID | OAuth client ID | owl |
| NEXT_PUBLIC_OAUTH_REDIRECT_URI | Callback URL | http://localhost:3000/auth/callback |
| NEXT_PUBLIC_BACKEND_URL | Backend server URL | http://localhost:3000 |
| NEXT_PUBLIC_API_URL | API base URL | http://localhost:5000/api |

### Backend (backend/.env)

| Variable | Description | Example |
|----------|-------------|---------|
| OAUTH_BASE_URL | OAuth provider URL | https://ivp.isea.in/backend |
| OAUTH_CLIENT_ID | OAuth client ID | owl |
| MONGODB_URI | MongoDB connection | mongodb://localhost:27017/sitebuilder |
| PORT | Backend port | 5000 |
| NODE_ENV | Environment | development |
| CORS_ORIGIN | Allowed origins | http://localhost:3000 |
| JWT_SECRET | JWT secret key | your-secret-key |

---

## 🚀 Production Deployment

### Update Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_OAUTH_REDIRECT_URI=https://sites.isea.in/auth/callback
NEXT_PUBLIC_BACKEND_URL=https://sites.isea.in
NEXT_PUBLIC_API_URL=https://sites.isea.in/api
```

**Backend (backend/.env):**
```env
NODE_ENV=production
CORS_ORIGIN=https://sites.isea.in
MONGODB_URI=mongodb://your-production-db/sitebuilder
JWT_SECRET=STRONG-RANDOM-SECRET-KEY-HERE
```

### Build & Deploy

```bash
# Build frontend
npm run build

# Start with PM2 (recommended)
pm2 start npm --name "sites-frontend" -- start
pm2 start backend/src/server.js --name "sites-backend"

# Or with systemd service
# Create systemd service files for both frontend and backend
```

---

## ✅ Post-Installation Checklist

- [ ] MongoDB is running
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:5000/health
- [ ] OAuth login button appears
- [ ] Can redirect to OAuth provider
- [ ] Can complete OAuth flow
- [ ] User profile displays correctly
- [ ] Can logout successfully
- [ ] Can login again after logout

---

## 📚 Additional Documentation

- **OAUTH_QUICKSTART.md** - Quick 5-minute setup guide
- **OAUTH_IMPLEMENTATION.md** - Detailed implementation details
- **OAUTH_SUMMARY.md** - Overview of changes
- **OAuth_Guide.md** - OAuth flow documentation

---

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review backend logs: `cd backend && npm run dev`
3. Check browser console for frontend errors
4. Verify all environment variables are set
5. Ensure OAuth callback URL is registered

---

**Installation complete! Your OAuth authentication is ready to use.** 🎉
