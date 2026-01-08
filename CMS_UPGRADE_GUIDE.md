# CMS Upgrade Guide - Version 2.0

This document outlines the major improvements made to The Daily Aesthetic content management system.

## Overview of Changes

The CMS has been significantly enhanced with the following improvements:

1. **Enhanced Database Schema** - Improved data types, SEO fields, and content workflow
2. **Image Upload System** - Local file uploads with management capabilities
3. **Content Versioning** - Draft/publish workflow with status management
4. **SEO Optimization** - Meta fields and URL-friendly slugs
5. **Better Error Handling** - Comprehensive validation and error responses
6. **Performance Caching** - In-memory caching for faster responses
7. **API Improvements** - Enhanced validation and error handling

## Database Schema Updates

### New Fields Added to All Content Tables

All content tables (projects, articles, products) now include:

- `slug` (VARCHAR 255, UNIQUE) - SEO-friendly URL identifier
- `status` (VARCHAR 20) - Content status: 'draft', 'published', or 'archived'
- `is_featured` (BOOLEAN) - Flag for featured content
- `published_at` (TIMESTAMP) - Publication timestamp
- `meta_title` (VARCHAR 255) - SEO meta title
- `meta_description` (TEXT) - SEO meta description
- `meta_keywords` (TEXT) - SEO keywords
- `view_count` (INTEGER) - View counter

### Articles Table New Fields

- `excerpt` (TEXT) - Article excerpt
- `tags` (TEXT[]) - Article tags array

### Products Table New Fields

- `sale_price` (DECIMAL) - Sale/discounted price
- `in_stock` (BOOLEAN) - Stock availability flag
- `stock_quantity` (INTEGER) - Quantity in stock

### New Indexes for Performance

- Slug indexes for fast URL lookups
- Status indexes for filtering
- Published date indexes for chronological queries
- Featured content indexes
- GIN indexes on tags arrays for fast tag searches
- Price indexes for product filtering

### Automatic Triggers

- `updated_at` automatically updates on record modification
- `generate_slug()` function for creating URL-friendly slugs

## Migration Instructions

### For New Installations

Run the v2 schema setup:

```bash
npm run db:setup-v2
```

This will:
1. Create the database with the new schema
2. Set up all tables with enhanced fields
3. Create indexes and triggers
4. Set up admin authentication

### For Existing Installations

Run the migration script to upgrade your existing database:

```bash
npm run db:migrate
```

This will:
1. Add new columns to existing tables
2. Generate slugs for existing content
3. Set default values (status='published')
4. Create new indexes
5. Add triggers for automatic updates

**Important:** The migration preserves all existing data!

## New Features

### 1. Image Upload System

Upload images directly to the server instead of using external URLs.

**Endpoints:**

- `POST /api/uploads/image` - Upload single image
- `POST /api/uploads/images` - Upload multiple images (max 10)
- `GET /api/uploads` - List all uploaded files
- `DELETE /api/uploads/:filename` - Delete an uploaded file

**Usage:**

```javascript
// Upload single image
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('/api/uploads/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { file } = await response.json();
console.log(file.url); // /uploads/filename.jpg
```

**File Requirements:**
- Formats: JPEG, JPG, PNG, GIF, WebP, SVG
- Max size: 5MB
- Automatically sanitized filenames
- Stored in `/backend/uploads` directory

### 2. Content Workflow (Draft/Publish)

Manage content through different states:

- **draft**: Content is not visible to public
- **published**: Content is live and visible
- **archived**: Content is hidden but preserved

**Status Management:**

```javascript
// Create draft content
POST /api/projects
{
  "title": "My Project",
  "status": "draft",
  ...
}

// Publish content
PUT /api/projects/123
{
  "status": "published"
}
```

**Features:**
- `published_at` automatically set when status changes to 'published'
- Filter by status: `GET /api/projects?status=published`
- Filter featured content: `GET /api/projects?featured=true`

### 3. SEO Features

#### Automatic Slug Generation

Slugs are automatically created from titles:

```javascript
// Title: "Amazing Design Project 2024"
// Auto-generated slug: "amazing-design-project-2024"
```

- Slugs are unique (duplicates get number suffix)
- URL-safe characters only
- Automatic regeneration if title changes
- Can be manually overridden

#### SEO Meta Fields

```javascript
POST /api/projects
{
  "title": "Project Title",
  "meta_title": "Custom SEO Title",
  "meta_description": "SEO description for search engines",
  "meta_keywords": "design, architecture, minimal"
}
```

#### Access by Slug

All content types support slug-based access:

```
GET /api/projects/slug/amazing-design-project-2024
GET /api/articles/slug/my-article-slug
GET /api/products/slug/product-slug
```

### 4. Enhanced Validation

Comprehensive input validation on all endpoints:

**Field Validations:**
- Title: 1-255 characters (required for new content)
- Excerpt: max 500 characters
- Meta title: max 255 characters
- Meta description: max 500 characters
- Price: must be >= 0
- Stock quantity: must be >= 0
- Status: must be 'draft', 'published', or 'archived'

**Error Response Format:**

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "title is required"
    },
    {
      "field": "price",
      "message": "price must be at least 0"
    }
  ]
}
```

### 5. Improved Error Handling

**Database Errors:**
- Duplicate entry detection (409 Conflict)
- Foreign key violations (400 Bad Request)
- Invalid data format handling

**Upload Errors:**
- File size limit enforcement
- File type validation
- Clear error messages

**Example Error Response:**

```json
{
  "error": "Duplicate entry",
  "message": "A record with this value already exists"
}
```

### 6. Performance Caching

In-memory caching for GET requests:

**Features:**
- 5-minute default TTL (configurable)
- Automatic cache invalidation on updates
- Cache hit/miss headers (`X-Cache: HIT` or `X-Cache: MISS`)
- Pattern-based cache clearing

**Usage:**

```javascript
const { cacheMiddleware, invalidateCache } = require('./middleware/cache');

// Cache GET requests for 10 minutes
router.get('/api/projects', cacheMiddleware(600), getProjects);

// Invalidate cache on updates
router.post('/api/projects', invalidateCache('GET:/api/projects'), createProject);
```

## API Updates

### New Query Parameters

All content endpoints support:

- `?status=draft|published|archived` - Filter by status
- `?featured=true` - Show only featured content
- `?search=term` - Full-text search
- `?tag=value` - Filter by tag
- `?minPrice=100&maxPrice=500` - Price range (products)
- `?offset=0&limit=10` - Pagination

### Enhanced Response Format

All list endpoints now include better pagination:

```json
{
  "data": [...],
  "pagination": {
    "offset": 0,
    "limit": 10,
    "total": 45,
    "hasMore": true
  }
}
```

## Backend Dependencies

New dependencies added:

```json
{
  "multer": "^1.4.5-lts.1"
}
```

Install dependencies:

```bash
cd backend
npm install
```

## Utility Functions

### Slug Generation

```javascript
const { createUniqueSlug } = require('./utils/slug-generator');

// Generate unique slug
const slug = await createUniqueSlug(pool, 'projects', 'My Title');
```

### Validation

```javascript
const { validateProject } = require('./utils/validators');

const validation = validateProject(data);
if (!validation.isValid()) {
  throw new ApiError(400, 'Validation failed', validation.getErrors());
}
```

### CRUD Helpers

```javascript
const { create, update, getBySlug } = require('./utils/crud-helpers');

// Slugs are auto-generated in create/update
const project = await create('projects', {
  title: 'My Project'
  // slug will be generated automatically
});

// Get by slug
const article = await getBySlug('articles', 'my-article-slug');
```

## Breaking Changes

⚠️ **Important**: While the migration preserves data, be aware:

1. **Date Fields**: Old VARCHAR date fields remain, but new TIMESTAMP fields added
2. **Default Status**: Existing content defaults to 'published' status
3. **Slug Requirements**: All content now requires unique slugs (auto-generated in migration)
4. **API Responses**: May include new fields (backward compatible for consumers)

## Best Practices

### Content Creation

1. Use descriptive titles (used for slug generation)
2. Set status to 'draft' for unpublished content
3. Fill SEO meta fields for better search visibility
4. Upload images to local server instead of external URLs
5. Use tags for better organization and filtering

### Performance

1. Use caching for public-facing GET requests
2. Invalidate cache patterns on content updates
3. Index frequently queried fields
4. Use pagination for large datasets

### Security

1. All upload endpoints require authentication
2. File type validation on uploads
3. Input validation on all mutations
4. SQL injection protection via parameterized queries

## Troubleshooting

### Migration Issues

**Problem**: Migration fails with "column already exists"
- **Solution**: Some columns already added; safe to ignore or drop and retry

**Problem**: Slug uniqueness constraint violation
- **Solution**: Run migration again; includes auto-incrementing for duplicates

### Upload Issues

**Problem**: "ENOENT: no such file or directory"
- **Solution**: Ensure `/backend/uploads` directory exists (auto-created by middleware)

**Problem**: "File too large"
- **Solution**: Reduce file size below 5MB or adjust limit in `middleware/upload.js`

## Support

For issues or questions:
- Check logs in `/backend` directory
- Review error responses (include detailed messages)
- Consult inline code documentation

## Version History

### Version 2.0 (Current)
- Enhanced database schema with SEO and workflow fields
- Image upload system
- Content status management
- Improved error handling and validation
- Performance caching
- Automatic slug generation

### Version 1.0
- Basic CRUD operations
- External image URLs only
- Simple authentication
- Basic error handling
