# Development Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Architecture Overview](#architecture-overview)
3. [Development Workflow](#development-workflow)
4. [Code Structure](#code-structure)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Getting Started

### Quick Setup

```bash
# Run the automated setup script
./setup.sh

# Or manually:
npm install
cd backend && npm install && cd ..
```

### Running the Application

**Development (Recommended):**
```bash
# Terminal 1 - Frontend with hot reload
npm run dev

# Terminal 2 - Backend with nodemon
npm run backend:dev
```

**Production:**
```bash
npm run build
npm start
npm run backend
```

## Architecture Overview

### Frontend Architecture

```
Next.js 14 (App Router)
├── App Directory Structure
│   ├── (auth)/           # Authentication group
│   ├── (dashboard)/      # Protected dashboard routes
│   └── editor/[id]/      # Dynamic editor routes
├── State Management
│   ├── Zustand           # Client state
│   └── React Query       # Server state & caching
└── Styling
    └── TailwindCSS 4     # Utility-first CSS
```

### Backend Architecture

```
Express.js RESTful API
├── Controllers           # Business logic
├── Models               # MongoDB schemas
├── Routes               # API endpoints
├── Middleware           # Auth, validation, etc.
└── Utils                # Helper functions
```

### Database Schema

**Users** → **Sites** → **Pages** → **Components**
- One-to-many relationships
- Proper indexing for performance
- Validation at schema level

## Development Workflow

### 1. Feature Development

```bash
# Create a new branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Test locally
npm run dev

# Commit changes
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name
```

### 2. API Development

**Adding a New Endpoint:**

1. Create controller function in `backend/src/controllers/`
2. Add route in `backend/src/routes/`
3. Add validation middleware if needed
4. Test with Postman or curl
5. Document in API section

**Example:**
```javascript
// controllers/exampleController.js
exports.getExample = asyncHandler(async (req, res) => {
  // Implementation
});

// routes/example.js
router.get('/', protect, getExample);
```

### 3. Frontend Component Development

**Creating a New Component:**

1. Create component in appropriate directory
2. Use TypeScript for type safety
3. Follow naming conventions (PascalCase)
4. Export default and named exports

**Example:**
```typescript
// components/ui/MyComponent.tsx
import { cn } from '@/lib/utils';

interface MyComponentProps {
  className?: string;
  // other props
}

export default function MyComponent({ className }: MyComponentProps) {
  return (
    <div className={cn('base-classes', className)}>
      {/* Component content */}
    </div>
  );
}
```

### 4. State Management

**Zustand Store Pattern:**
```typescript
import { create } from 'zustand';

interface MyStore {
  data: any;
  setData: (data: any) => void;
}

export const useMyStore = create<MyStore>((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));
```

**React Query Usage:**
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ['key'],
  queryFn: () => apiFunction(),
});

// Mutate data
const mutation = useMutation({
  mutationFn: (data) => apiFunction(data),
  onSuccess: () => {
    // Handle success
  },
});
```

## Code Structure

### File Naming Conventions

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Routes: `kebab-case`
- Constants: `UPPER_SNAKE_CASE.ts`

### Import Order

```typescript
// 1. React and Next.js
import React from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';

// 3. Internal utilities and stores
import { useAuthStore } from '@/lib/store/authStore';
import { cn } from '@/lib/utils';

// 4. Components
import Button from '@/components/ui/Button';

// 5. Types
import type { User } from '@/types';
```

### Directory Structure Best Practices

```
/components
  /ui           # Reusable UI components
  /editor       # Editor-specific components
  /layouts      # Layout components
  /templates    # Template components

/lib
  /store        # Zustand stores
  /hooks        # Custom React hooks
  api.ts        # API client
  utils.ts      # Utility functions

/types
  index.ts      # TypeScript types and interfaces
```

## Best Practices

### 1. TypeScript

- Always define types for props and functions
- Use interfaces for object shapes
- Avoid `any` type when possible
- Use type inference where appropriate

### 2. React

- Use functional components
- Implement proper error boundaries
- Memoize expensive computations
- Use proper key props in lists

### 3. API Development

- Always use asyncHandler for async routes
- Implement proper error handling
- Validate input data
- Return consistent response format

### 4. Database

- Use indexes for frequently queried fields
- Implement proper data validation
- Use transactions for related operations
- Avoid N+1 queries

### 5. Security

- Never commit .env files
- Sanitize user input
- Implement rate limiting
- Use HTTPS in production
- Validate file uploads

### 6. Performance

- Implement lazy loading
- Use React Query for caching
- Optimize images with Next.js Image
- Minimize bundle size
- Use CDN for static assets

## Troubleshooting

### Common Issues

#### MongoDB Connection Failed

```bash
# Check if MongoDB is running
pgrep mongod

# Start MongoDB
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### Port Already in Use

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

#### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# For backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

#### CORS Issues

Check that:
- Backend CORS_ORIGIN matches frontend URL
- Credentials are included in requests
- Backend is running on correct port

#### JWT Token Errors

- Check that JWT_SECRET is set in backend/.env
- Verify token is being stored correctly
- Check token expiration settings

### Debug Mode

**Frontend:**
```bash
# Enable verbose logging
NODE_OPTIONS='--inspect' npm run dev
```

**Backend:**
```bash
# Run with nodemon debug
nodemon --inspect src/server.js
```

### Database Reset

```bash
# Drop database
mongo cms-platform --eval "db.dropDatabase()"

# Re-seed themes
cd backend
node src/scripts/seedThemes.js
```

## Testing

### Manual API Testing

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test1234"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

### Using Postman

Import the following collection structure:
- Authentication endpoints
- Sites CRUD operations
- Pages CRUD operations
- Theme operations
- Asset management

## Deployment

### Environment Variables

**Production Frontend (.env.production):**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=production-secret-key
```

**Production Backend:**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cms
JWT_SECRET=production-jwt-secret
CORS_ORIGIN=https://yourdomain.com
```

### Deployment Checklist

- [ ] Update environment variables
- [ ] Set up MongoDB Atlas or managed MongoDB
- [ ] Configure Cloudinary
- [ ] Set up CDN for assets
- [ ] Enable SSL/TLS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline
- [ ] Test in staging environment
- [ ] Prepare rollback plan

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)

## Support

For questions or issues:
- Check this guide first
- Search existing GitHub issues
- Create a new issue with:
  - Detailed description
  - Steps to reproduce
  - Expected vs actual behavior
  - Environment details

---

Happy coding! 🚀
