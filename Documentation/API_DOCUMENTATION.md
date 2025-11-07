# CMS Platform API Documentation

## Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `http://10.244.0.147:5000/api`

---

## Authentication APIs

### 1. Register User
- **Endpoint**: `POST /auth/register`
- **Access**: Public
- **Description**: Register a new user account
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Validation**:
  - Email: Valid email format, max 255 chars
  - Password: Min 8 chars, must contain uppercase, lowercase, number, and special character
  - First/Last Name: 1-50 chars, letters/spaces/hyphens/apostrophes only
- **Response**: User object with JWT token

### 2. Login
- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Description**: Authenticate user and receive JWT token
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123!"
  }
  ```
- **Response**: User object with JWT token

### 3. Get Current User
- **Endpoint**: `GET /auth/me`
- **Access**: Private (requires authentication)
- **Description**: Get currently logged-in user details
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User object

### 4. Update Profile
- **Endpoint**: `PUT /auth/update-profile`
- **Access**: Private
- **Description**: Update user profile information
- **Request Body**:
  ```json
  {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "newemail@example.com"
  }
  ```

### 5. Update Password
- **Endpoint**: `PUT /auth/update-password`
- **Access**: Private
- **Description**: Change user password
- **Request Body**:
  ```json
  {
    "currentPassword": "OldPass123!",
    "newPassword": "NewPass456!"
  }
  ```

### 6. Forgot Password
- **Endpoint**: `POST /auth/forgot-password`
- **Access**: Public
- **Description**: Request password reset email
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```

### 7. Reset Password
- **Endpoint**: `PUT /auth/reset-password/:resetToken`
- **Access**: Public
- **Description**: Reset password using token from email
- **Request Body**:
  ```json
  {
    "password": "NewPass123!"
  }
  ```

### 8. Logout
- **Endpoint**: `POST /auth/logout`
- **Access**: Private
- **Description**: Logout current user

### 9. Refresh Token
- **Endpoint**: `POST /auth/refresh-token`
- **Access**: Public
- **Description**: Refresh JWT access token

---

## Sites APIs

### 1. Get All Sites
- **Endpoint**: `GET /sites`
- **Access**: Private (or Public with subdomain query)
- **Description**: Get all sites for authenticated user or get site by subdomain
- **Query Parameters**:
  - `subdomain` (optional): Get specific site by subdomain (public access)
  - `page` (optional): Page number for pagination
  - `limit` (optional): Items per page
  - `search` (optional): Search by site name
  - `isPublished` (optional): Filter by publish status
- **Response**: Array of site objects

### 2. Get Single Site
- **Endpoint**: `GET /sites/:id`
- **Access**: Private
- **Description**: Get detailed information about a specific site
- **Response**: Site object with populated pages and theme

### 3. Create Site
- **Endpoint**: `POST /sites`
- **Access**: Private
- **Description**: Create a new website
- **Request Body**:
  ```json
  {
    "siteName": "My Website",
    "subdomain": "mywebsite",
    "description": "Optional description"
  }
  ```
- **Validation**:
  - siteName: 2-100 chars, alphanumeric/spaces/hyphens/underscores/apostrophes
  - subdomain: 3-50 chars, lowercase letters/numbers/hyphens only
  - description: Max 500 chars
- **Response**: Created site object (auto-creates a default Home page)

### 4. Update Site
- **Endpoint**: `PUT /sites/:id`
- **Access**: Private
- **Description**: Update site details
- **Request Body**:
  ```json
  {
    "siteName": "Updated Name",
    "subdomain": "newsubdomain",
    "description": "New description",
    "logo": "/uploads/logo.png",
    "logoWidth": "150px",
    "themeId": "theme_id_here",
    "customTheme": {
      "colors": {
        "primary": "#3b82f6",
        "secondary": "#8b5cf6",
        "background": "#ffffff",
        "text": "#1e293b"
      },
      "fonts": {
        "heading": "Inter",
        "body": "Inter"
      }
    }
  }
  ```

### 5. Delete Site
- **Endpoint**: `DELETE /sites/:id`
- **Access**: Private
- **Description**: Delete a site and all its pages

### 6. Publish Site
- **Endpoint**: `POST /sites/:id/publish`
- **Access**: Private
- **Description**: Make site publicly accessible
- **Request Body** (optional):
  ```json
  {
    "siteName": "Final Site Name",
    "subdomain": "final-subdomain"
  }
  ```

### 7. Unpublish Site
- **Endpoint**: `POST /sites/:id/unpublish`
- **Access**: Private
- **Description**: Make site private (hide from public)

### 8. Duplicate Site
- **Endpoint**: `POST /sites/:id/duplicate`
- **Access**: Private
- **Description**: Create a copy of an existing site

---

## Pages APIs

### 1. Get All Pages for a Site
- **Endpoint**: `GET /sites/:siteId/pages`
- **Access**: Private (or Public if site is published)
- **Description**: Get all pages belonging to a site
- **Response**: Array of page objects

### 2. Get Single Page
- **Endpoint**: `GET /pages/:id`
- **Access**: Private
- **Description**: Get detailed information about a specific page
- **Response**: Page object with content and sections

### 3. Create Page
- **Endpoint**: `POST /sites/:siteId/pages`
- **Access**: Private
- **Description**: Create a new page within a site
- **Request Body**:
  ```json
  {
    "pageName": "About Us",
    "slug": "about",
    "isHome": false,
    "sections": [
      {
        "id": "section-1",
        "sectionName": "Hero",
        "showInNavbar": true,
        "components": [
          {
            "id": "heading-1",
            "type": "heading",
            "props": {
              "text": "Welcome",
              "fontSize": 48,
              "color": "#3b82f6"
            }
          }
        ],
        "layout": {
          "direction": "column",
          "justifyContent": "center",
          "alignItems": "center",
          "gap": 16,
          "padding": 24,
          "backgroundColor": "transparent"
        }
      }
    ]
  }
  ```
- **Validation**:
  - pageName: 1-100 chars required
  - slug: For home pages, can be empty or "/" (converted to empty string)
  - sections: Array of section objects (optional)
- **Response**: Created page object

### 4. Update Page
- **Endpoint**: `PUT /pages/:id`
- **Access**: Private
- **Description**: Update page content and settings
- **Request Body**:
  ```json
  {
    "pageName": "Updated Name",
    "sections": [...],
    "content": [...],
    "settings": {}
  }
  ```

### 5. Delete Page
- **Endpoint**: `DELETE /pages/:id`
- **Access**: Private
- **Description**: Delete a page

### 6. Reorder Pages
- **Endpoint**: `PUT /sites/:siteId/pages/reorder`
- **Access**: Private
- **Description**: Change the order of pages
- **Request Body**:
  ```json
  {
    "pages": [
      { "pageId": "page1_id", "order": 0 },
      { "pageId": "page2_id", "order": 1 }
    ]
  }
  ```

### 7. Duplicate Page
- **Endpoint**: `POST /pages/:id/duplicate`
- **Access**: Private
- **Description**: Create a copy of a page

### 8. Update Page Content
- **Endpoint**: `PATCH /pages/:id/content`
- **Access**: Private
- **Description**: Update only the content/sections of a page

---

## Themes APIs

### 1. Get All Themes
- **Endpoint**: `GET /themes`
- **Access**: Public
- **Description**: Get all available themes
- **Query Parameters**:
  - `isPublic` (optional): Filter public themes
  - `category` (optional): Filter by category
- **Response**: Array of theme objects

### 2. Get Single Theme
- **Endpoint**: `GET /themes/:id`
- **Access**: Public
- **Description**: Get detailed theme information
- **Response**: Theme object with colors, fonts, and effects

### 3. Create Theme
- **Endpoint**: `POST /themes`
- **Access**: Private
- **Description**: Create a custom theme
- **Request Body**:
  ```json
  {
    "name": "My Custom Theme",
    "description": "A beautiful theme",
    "category": "Business",
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#8b5cf6",
      "background": "#ffffff",
      "text": "#1e293b",
      "textSecondary": "#64748b"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "effects": {
      "enableHoverEffects": true,
      "hoverScale": 1.05,
      "hoverShadow": "0 10px 25px rgba(0,0,0,0.1)",
      "transitionDuration": "200ms",
      "enableGradients": false
    }
  }
  ```
- **Validation**:
  - name: 2-50 chars required
  - colors: Must be valid hex colors (#RGB or #RRGGBB)
  - fonts: heading and body required

### 4. Update Theme
- **Endpoint**: `PUT /themes/:id`
- **Access**: Private
- **Description**: Update theme properties

### 5. Delete Theme
- **Endpoint**: `DELETE /themes/:id`
- **Access**: Private
- **Description**: Delete a custom theme

### 6. Get Themes by Category
- **Endpoint**: `GET /themes/category/:category`
- **Access**: Public
- **Description**: Get all themes in a specific category
- **Categories**: Business, Portfolio, Blog, E-commerce, Education, Landing Page, Other

### 7. Get My Themes
- **Endpoint**: `GET /themes/my-themes`
- **Access**: Private
- **Description**: Get all themes created by current user

### 8. Use Theme
- **Endpoint**: `POST /themes/:id/use`
- **Access**: Private
- **Description**: Apply theme to a site

---

## Assets APIs

### 1. Upload Asset
- **Endpoint**: `POST /assets/upload`
- **Access**: Private
- **Description**: Upload an image or file
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `file`: The file to upload (form-data)
- **File Restrictions**:
  - Max size: 5MB (configurable)
  - Allowed types: Images (jpg, jpeg, png, gif, webp), videos, documents
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "asset_id",
      "filename": "image.jpg",
      "url": "/uploads/unique-filename.jpg",
      "mimetype": "image/jpeg",
      "size": 123456
    }
  }
  ```

### 2. Get All Assets
- **Endpoint**: `GET /assets`
- **Access**: Private
- **Description**: Get all assets uploaded by user
- **Query Parameters**:
  - `type` (optional): Filter by mimetype (image, video, etc.)
  - `page`, `limit`: Pagination
- **Response**: Array of asset objects

### 3. Get Single Asset
- **Endpoint**: `GET /assets/:id`
- **Access**: Private
- **Description**: Get asset details

### 4. Update Asset
- **Endpoint**: `PUT /assets/:id`
- **Access**: Private
- **Description**: Update asset metadata
- **Request Body**:
  ```json
  {
    "altText": "Description of image",
    "tags": ["logo", "header"]
  }
  ```

### 5. Delete Asset
- **Endpoint**: `DELETE /assets/:id`
- **Access**: Private
- **Description**: Delete an asset file

### 6. Get Storage Info
- **Endpoint**: `GET /assets/storage/info`
- **Access**: Private
- **Description**: Get user's storage usage statistics

### 7. Bulk Delete Assets
- **Endpoint**: `DELETE /assets/bulk-delete`
- **Access**: Private
- **Description**: Delete multiple assets at once
- **Request Body**:
  ```json
  {
    "assetIds": ["id1", "id2", "id3"]
  }
  ```

---

## Component Types

### Available Component Types
1. **banner** - Full-width banner with background image, text, and CTA
2. **heading** - Text heading (H1-H6)
3. **text** - Paragraph text
4. **image** - Image with configurable dimensions
5. **button** - Clickable button with link
6. **video** - Embedded video
7. **divider** - Horizontal line separator
8. **social** - Social media icons (Instagram, Facebook, Twitter)
9. **footer** - Site footer with links and company info
10. **timer** - Countdown timer to a specific date
11. **card** - Card component (text, icon, or image type)
12. **carousel** - Image carousel/slider (16:9 aspect ratio)
13. **bullet-list** - Bulleted or numbered list
14. **collapsible-list** - Expandable/collapsible list of items

### Section Layout Properties
- **direction**: `row` | `column`
- **justifyContent**: `flex-start` | `center` | `flex-end` | `space-between` | `space-around` | `space-evenly`
- **alignItems**: `flex-start` | `center` | `flex-end` | `stretch`
- **gap**: Number (pixels)
- **padding**: Number (pixels)
- **backgroundColor**: Hex color or `transparent`

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message",
      "value": "invalid value"
    }
  ]
}
```

### Common HTTP Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing or invalid token)
- **403** - Forbidden (no permission)
- **404** - Not Found
- **500** - Internal Server Error

---

## Security Features

### IDOR Protection
All endpoints verify ownership before allowing access to resources:
- Sites: `site.userId === req.user._id`
- Pages: Verified via parent site ownership
- Themes: Only creator can edit/delete custom themes

### Security Headers (Helmet.js)
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS) - Production only
- X-XSS-Protection

### Rate Limiting
- 100 requests per 15 minutes per IP
- Applied to all API routes

### Input Validation
- MongoDB injection prevention
- XSS sanitization
- Express-validator for all inputs
- File upload restrictions (size, type)

---

## Static File Serving

### Uploaded Files
- **Endpoint**: `GET /uploads/:filename`
- **Access**: Public
- **Description**: Access uploaded images and assets
- **Example**: `http://localhost:5000/uploads/image-1234567890.jpg`

---

## Notes

1. **Authentication**: Most endpoints require JWT token in `Authorization: Bearer <token>` header
2. **Pagination**: Default page size is 10 items
3. **Slugs**: Home pages use empty string `""` as slug, not `"/"` 
4. **Sections**: Modern page structure uses `sections` array; legacy uses `content` array
5. **ObjectId Validation**: All `:id` parameters are validated as MongoDB ObjectIds
6. **CORS**: Configured to allow requests from frontend origin (10.244.0.147:3000)

---

## Environment Variables Required

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/cms-platform

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Server
PORT=5000
NODE_ENV=development
BACKEND_URL=http://10.244.0.147:5000

# CORS
CORS_ORIGIN=http://10.244.0.147:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

**Last Updated**: November 7, 2025
**API Version**: 1.0.0
