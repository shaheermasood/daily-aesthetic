# The Daily Aesthetic - Backend API v2.0

Modern, feature-rich REST API for The Daily Aesthetic content management system.

## Features

✨ **Core Features**
- RESTful API for projects, articles, and products
- JWT-based authentication and authorization
- PostgreSQL database with optimized schema
- File upload and management
- Content workflow (draft/publish/archive)
- SEO optimization with slugs and meta fields

🚀 **Performance**
- In-memory caching for faster responses
- Indexed database queries
- Efficient pagination
- Optimized static file serving

🔒 **Security**
- Session-based authentication
- Input validation and sanitization
- SQL injection protection
- File upload restrictions
- Comprehensive error handling

## Quick Start

### Prerequisites

- Node.js 14+ and npm
- PostgreSQL 12+

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Create database and run migrations:**
   ```bash
   # For new installation
   npm run db:setup-v2

   # For upgrading from v1
   npm run db:migrate
   ```

4. **Set up admin user:**
   ```bash
   npm run admin:setup
   ```
   Default credentials: `admin` / `admin123`

5. **Start the server:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login and get session token |
| POST | `/api/auth/logout` | Logout and invalidate session |
| POST | `/api/auth/change-password` | Change user password |

### Projects

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects` | List all projects | No |
| GET | `/api/projects/:id` | Get project by ID | No |
| GET | `/api/projects/slug/:slug` | Get project by slug | No |
| POST | `/api/projects` | Create new project | Yes |
| PUT | `/api/projects/:id` | Update project | Yes |
| DELETE | `/api/projects/:id` | Delete project | Yes |

### Articles

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/articles` | List all articles | No |
| GET | `/api/articles/:id` | Get article by ID | No |
| GET | `/api/articles/slug/:slug` | Get article by slug | No |
| POST | `/api/articles` | Create new article | Yes |
| PUT | `/api/articles/:id` | Update article | Yes |
| DELETE | `/api/articles/:id` | Delete article | Yes |

### Products

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | List all products | No |
| GET | `/api/products/:id` | Get product by ID | No |
| GET | `/api/products/slug/:slug` | Get product by slug | No |
| POST | `/api/products` | Create new product | Yes |
| PUT | `/api/products/:id` | Update product | Yes |
| DELETE | `/api/products/:id` | Delete product | Yes |

### Uploads

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/uploads/image` | Upload single image | Yes |
| POST | `/api/uploads/images` | Upload multiple images | Yes |
| GET | `/api/uploads` | List all uploads | Yes |
| DELETE | `/api/uploads/:filename` | Delete uploaded file | Yes |

## Query Parameters

All list endpoints support:

- `offset` - Pagination offset (default: 0)
- `limit` - Items per page (default: 6)
- `search` - Full-text search
- `status` - Filter by status (draft, published, archived)
- `featured` - Filter featured content (true/false)
- `tag` - Filter by tag (for projects/products)
- `minPrice`/`maxPrice` - Price range (products only)

**Example:**
```
GET /api/projects?status=published&featured=true&limit=10
```

## Request/Response Examples

### Create Project

**Request:**
```bash
POST /api/projects
Authorization: Bearer your-session-token
Content-Type: application/json

{
  "title": "Minimalist Architecture",
  "excerpt": "A showcase of minimalist design",
  "description": "<p>Full HTML description</p>",
  "status": "draft",
  "is_featured": false,
  "tags": ["architecture", "minimalism"],
  "image_url": "/uploads/project-image.jpg",
  "meta_title": "Minimalist Architecture - The Daily Aesthetic",
  "meta_description": "Explore minimalist architectural designs"
}
```

**Response:**
```json
{
  "id": 123,
  "title": "Minimalist Architecture",
  "slug": "minimalist-architecture",
  "status": "draft",
  "is_featured": false,
  "published_at": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  ...
}
```

### Upload Image

**Request:**
```bash
POST /api/uploads/image
Authorization: Bearer your-session-token
Content-Type: multipart/form-data

image=<binary file data>
```

**Response:**
```json
{
  "success": true,
  "file": {
    "filename": "project-123-1234567890.jpg",
    "originalname": "project.jpg",
    "size": 245678,
    "mimetype": "image/jpeg",
    "url": "/uploads/project-123-1234567890.jpg"
  }
}
```

### List with Pagination

**Request:**
```bash
GET /api/articles?offset=10&limit=5&status=published
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Article Title",
      "slug": "article-title",
      "excerpt": "Brief summary",
      ...
    }
  ],
  "pagination": {
    "offset": 10,
    "limit": 5,
    "total": 42,
    "hasMore": true
  }
}
```

## Database Schema

### Content Tables

All content tables (projects, articles, products) include:

- `id` - Primary key
- `title` - Content title
- `slug` - URL-friendly identifier (unique)
- `status` - draft/published/archived
- `is_featured` - Featured flag
- `published_at` - Publication timestamp
- `image_url` - Image URL or path
- `tags` - Array of tags
- `meta_title`, `meta_description`, `meta_keywords` - SEO fields
- `view_count` - View counter
- `created_at`, `updated_at` - Timestamps

### Authentication Tables

- `admin_users` - Admin user accounts
- `admin_sessions` - Active sessions

## File Structure

```
backend/
├── db/
│   ├── connection.js          # PostgreSQL connection pool
│   ├── schema.sql             # Original schema (v1)
│   ├── schema-v2.sql          # Enhanced schema (v2)
│   ├── migration-v2.sql       # Migration from v1 to v2
│   └── admin-schema.sql       # Admin users schema
├── middleware/
│   ├── auth.js                # Authentication middleware
│   ├── upload.js              # File upload middleware
│   ├── cache.js               # Caching middleware
│   └── error-handler.js       # Error handling
├── routes/
│   ├── projects.js            # Project endpoints
│   ├── articles.js            # Article endpoints
│   ├── products.js            # Product endpoints
│   ├── auth.js                # Auth endpoints
│   └── uploads.js             # Upload endpoints
├── utils/
│   ├── crud-helpers.js        # Generic CRUD operations
│   ├── slug-generator.js      # Slug utilities
│   └── validators.js          # Input validation
├── uploads/                   # Uploaded files directory
├── server.js                  # Express app setup
└── package.json               # Dependencies
```

## Environment Variables

Create a `.env` file:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=daily_aesthetic
DB_USER=postgres
DB_PASSWORD=your_password

# Session
SESSION_SECRET=your-secret-key
```

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": []  // Optional validation errors
}
```

**HTTP Status Codes:**
- 200 - Success
- 201 - Created
- 400 - Bad Request (validation errors)
- 401 - Unauthorized
- 404 - Not Found
- 409 - Conflict (duplicate entry)
- 500 - Internal Server Error

## Development

### Running Tests

```bash
npm test
```

### Database Management

```bash
# Setup new database with v2 schema
npm run db:setup-v2

# Migrate existing v1 database to v2
npm run db:migrate

# Create admin user
npm run admin:setup
```

### Code Style

- ES6+ JavaScript
- Async/await for asynchronous operations
- JSDoc comments for documentation
- Modular architecture

## Performance Tips

1. **Enable caching** for public GET endpoints
2. **Use indexes** on frequently queried fields
3. **Paginate** large result sets
4. **Optimize images** before upload
5. **Use slug-based** URLs for better SEO

## Security Best Practices

1. Change default admin credentials immediately
2. Use strong SESSION_SECRET in production
3. Enable HTTPS in production
4. Regularly update dependencies
5. Validate all user inputs
6. Set appropriate CORS policies

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong secrets and passwords
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Optimize database indexes
- [ ] Configure proper CORS settings

### Recommended Stack

- **Hosting**: AWS, DigitalOcean, or Heroku
- **Database**: Managed PostgreSQL (RDS, etc.)
- **File Storage**: AWS S3 or similar (optional)
- **SSL**: Let's Encrypt or CloudFlare

## Troubleshooting

### Common Issues

**Database Connection Errors:**
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database exists

**Upload Errors:**
- Verify `uploads/` directory exists
- Check file permissions
- Ensure file size < 5MB

**Authentication Issues:**
- Check session token validity
- Verify admin user exists
- Clear expired sessions

## Contributing

1. Follow existing code style
2. Add tests for new features
3. Update documentation
4. Use meaningful commit messages

## License

MIT

## Support

For issues and questions:
- Review the [CMS Upgrade Guide](../CMS_UPGRADE_GUIDE.md)
- Check server logs
- Verify database connections

## Version

Current version: **2.0.0**

Major improvements:
- Enhanced database schema
- Image upload system
- Content workflow management
- SEO optimization
- Performance caching
- Comprehensive validation
