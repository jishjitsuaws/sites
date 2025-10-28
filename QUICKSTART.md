# 🚀 Quick Start Guide

## Prerequisites Checklist

Before you begin, make sure you have:
- [ ] Node.js 18+ installed (`node -v`)
- [ ] MongoDB installed and running
- [ ] Git installed
- [ ] A code editor (VS Code recommended)
- [ ] A Cloudinary account (optional for now, can add later)

## 5-Minute Setup

### Step 1: Install Dependencies (2 minutes)

```bash
# Make setup script executable and run it
chmod +x setup.sh
./setup.sh
```

**Or manually:**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Configure Environment (1 minute)

**Option A: Use Default Settings (Quick)**
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-change-in-production

# Backend (backend/.env)
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cms-platform
JWT_SECRET=dev-jwt-secret-key
JWT_REFRESH_SECRET=dev-refresh-secret
CORS_ORIGIN=http://localhost:3000
```

**Option B: Use the example files**
```bash
cp .env.example .env.local
cp backend/.env.example backend/.env
# Then edit both files with your preferred editor
```

### Step 3: Start MongoDB (30 seconds)

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
# Start from Services or run mongod.exe

# Verify MongoDB is running
mongosh # Should connect successfully
```

### Step 4: Seed Database (30 seconds)

```bash
cd backend
node src/scripts/seedThemes.js
cd ..
```

You should see: "✅ Created 8 themes"

### Step 5: Start the App (1 minute)

**Open two terminal windows:**

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run backend:dev
```

### Step 6: Open Your Browser

Visit: **http://localhost:3000**

You should see the beautiful landing page! 🎉

---

## Test Your Setup

### 1. Check Backend Health
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-24T...",
  "environment": "development"
}
```

### 2. Test User Registration

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

**Using the UI:**
1. Go to http://localhost:3000
2. Click "Get Started" or "Sign Up"
3. Fill in your details
4. Click "Create Account"

### 3. Test Login

Go to http://localhost:3000/login and sign in with your credentials.

---

## Common Issues & Solutions

### ❌ Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### ❌ MongoDB Connection Failed

```bash
# Check if MongoDB is running
pgrep mongod

# If not running, start it
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### ❌ Module Not Found Errors

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

cd backend
rm -rf node_modules package-lock.json
npm install
cd ..
```

### ❌ CORS Errors

Make sure:
1. Backend is running on port 5000
2. CORS_ORIGIN in backend/.env is `http://localhost:3000`
3. Both servers are running

---

## What to Build Next

Now that your setup is working, you can start building:

### 1. Dashboard Page (Recommended First)
Create `app/(dashboard)/home/page.tsx`:
- Display user's sites
- Show create new site button
- Add search and filters

### 2. Site Creation Modal
- Form to create a new site
- Subdomain validation
- Template selection

### 3. Editor Page
Create `app/editor/[siteId]/page.tsx`:
- Drag-and-drop canvas
- Component sidebar
- Pages panel
- Theme selector

---

## Development Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Backend
npm run backend:dev  # Start with nodemon (auto-reload)
npm run backend      # Start production server

# Database
cd backend
node src/scripts/seedThemes.js  # Seed themes
```

---

## API Testing with curl

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Test1234"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Test1234"}'

# Get themes (no auth required)
curl http://localhost:5000/api/themes

# Get user info (requires token from login)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## File Structure at a Glance

```
/sites
├── app/                    # Next.js pages
│   ├── (auth)/            # Login, Register
│   ├── (dashboard)/       # Home, Account
│   └── page.tsx           # Landing page
├── components/            # React components
│   └── ui/               # Button, Input, Card
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   ├── utils.ts          # Helper functions
│   └── store/            # Zustand stores
├── backend/              # Express API
│   └── src/
│       ├── controllers/  # Business logic
│       ├── models/       # MongoDB schemas
│       ├── routes/       # API endpoints
│       └── middleware/   # Auth, validation
└── package.json          # Dependencies
```

---

## Helpful Resources

- **Full Documentation**: See `README.md`
- **Development Guide**: See `DEVELOPMENT.md`
- **Project Summary**: See `PROJECT_SUMMARY.md`
- **API Endpoints**: Check `backend/src/routes/`

---

## Next Steps

1. ✅ Setup complete
2. ✅ Test authentication
3. 🚧 Build dashboard UI
4. 🚧 Create editor interface
5. 🚧 Add more components
6. 🚧 Deploy to production

---

## Need Help?

1. Check the error message carefully
2. Review `DEVELOPMENT.md` troubleshooting section
3. Verify environment variables are set correctly
4. Make sure MongoDB is running
5. Check that both frontend and backend are running

---

## Success Indicators

✅ Frontend at http://localhost:3000 shows landing page
✅ Backend at http://localhost:5000/health returns success
✅ You can register a new account
✅ You can log in successfully
✅ No console errors

**If all above are green, you're ready to start building! 🎉**

---

Happy coding! 🚀
