# The Daily Aesthetic

A minimalist design publication website with a clean, typography-focused interface. This full-stack application showcases design projects, articles, and minimalist products.

## Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API server
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client for Node.js
- **CORS** - Cross-origin resource sharing

### Frontend
- **Vanilla JavaScript** (ES6 modules)
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Beautiful icon library
- **Google Fonts** - Lora & Playfair Display

## Project Structure

```
daily-aesthetic/
├── backend/
│   ├── db/
│   │   ├── connection.js      # Database connection pool
│   │   ├── schema.sql         # Database schema
│   │   ├── seed.sql           # Seed data
│   │   ├── admin-schema.sql   # Admin user schema
│   │   └── setup-admin.js     # Admin setup script
│   ├── middleware/
│   │   └── auth.js            # Authentication middleware
│   ├── routes/
│   │   ├── projects.js        # Projects API endpoints
│   │   ├── articles.js        # Articles API endpoints
│   │   ├── products.js        # Products API endpoints
│   │   └── auth.js            # Authentication endpoints
│   ├── server.js              # Express server
│   ├── package.json           # Backend dependencies
│   └── .env.example           # Environment variables template
├── frontend/
│   ├── admin/
│   │   ├── css/
│   │   │   └── admin.css      # Admin panel styles
│   │   ├── js/
│   │   │   ├── admin.js       # Admin dashboard logic
│   │   │   └── login.js       # Admin login logic
│   │   ├── index.html         # Admin dashboard
│   │   └── login.html         # Admin login page
│   ├── css/
│   │   └── styles.css         # Custom styles
│   ├── js/
│   │   ├── app.js             # Main application logic
│   │   ├── api.js             # API client
│   │   └── utils.js           # Utility functions
│   ├── index.html             # Main HTML file
│   └── assets/                # Static assets
├── .gitignore
└── README.md
```

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **PostgreSQL** (v12 or higher)

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd daily-aesthetic
```

### 2. Set up the Database

Make sure PostgreSQL is installed and running on your system.

```bash
# Create the database and tables
psql -U postgres -f backend/db/schema.sql

# Seed the database with sample data
psql -U postgres -d daily_aesthetic -f backend/db/seed.sql
```

**Note:** If you're using a different PostgreSQL user, replace `postgres` with your username.

### 3. Set up the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env file with your database credentials
# nano .env  or  vim .env  or use your preferred editor
```

Update the `.env` file with your PostgreSQL credentials:

```env
PORT=3000
NODE_ENV=development

DB_USER=postgres
DB_HOST=localhost
DB_NAME=daily_aesthetic
DB_PASSWORD=your_password_here
DB_PORT=5432
```

### 4. Set up Admin Panel

```bash
# From the backend directory
npm run admin:setup
```

This will create the necessary admin tables and a default admin user:
- **Username:** admin
- **Password:** admin123
- **Email:** admin@dailyaesthetic.com

**Important:** Change the default password after first login!

### 5. Start the Backend Server

```bash
# From the backend directory
npm start

# For development with auto-reload
npm run dev
```

The API server will start on `http://localhost:3000`

### 6. Set up the Frontend

The frontend is a static site that needs to be served. You can use any static file server:

**Option 1: Using Python's built-in server**
```bash
cd frontend
python3 -m http.server 8080
```

**Option 2: Using Node's http-server**
```bash
# Install http-server globally (if not already installed)
npm install -g http-server

# Serve the frontend
cd frontend
http-server -p 8080
```

**Option 3: Using VS Code Live Server**
- Install the "Live Server" extension in VS Code
- Right-click on `frontend/index.html`
- Select "Open with Live Server"

The frontend will be available at `http://localhost:8080` (or the port you specified)

## Admin Panel

The admin panel provides a user-friendly interface for managing all content (projects, articles, and products).

### Accessing the Admin Panel

1. Make sure the backend server is running
2. Serve the frontend (see installation steps above)
3. Navigate to `http://localhost:8080/admin/login.html`
4. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`

### Admin Features

- **Authentication System** - Secure login with session management
- **Projects Management** - Create, edit, and delete design projects
- **Articles Management** - Manage blog articles and content
- **Products Management** - Add and update product listings
- **Responsive Design** - Works on desktop and mobile devices
- **Real-time Updates** - Changes reflect immediately in the dashboard

### Admin API Endpoints

#### Authentication
- `POST /api/auth/login` - Login and get session token
- `POST /api/auth/logout` - Logout and invalidate session
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/change-password` - Change user password
- `POST /api/auth/cleanup-sessions` - Remove expired sessions

### Security Notes

- Sessions expire after 24 hours
- Passwords are hashed using bcrypt
- All admin routes (except login) require authentication
- Change the default admin password immediately after setup
- In production, use HTTPS and strong passwords

## API Endpoints

### Projects
- `GET /api/projects?offset=0&limit=6` - Get paginated projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Articles
- `GET /api/articles?offset=0&limit=1` - Get paginated articles
- `GET /api/articles/:id` - Get single article
- `POST /api/articles` - Create new article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article

### Products
- `GET /api/products?offset=0&limit=6` - Get paginated products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Features

### Frontend
- **Single-Page Application** - Client-side routing with smooth transitions
- **Infinite Scroll** - Dynamically loads content as you scroll
- **Modal System** - Rich detail views for projects and products
- **Responsive Design** - Mobile-optimized layout
- **Admin Panel** - Full content management system with authentication

### Backend
- **RESTful API** - Clean, organized backend structure
- **PostgreSQL Database** - Reliable data persistence
- **Authentication System** - Secure admin login with sessions
- **CRUD Operations** - Complete content management endpoints

## Development

### Backend Development

```bash
cd backend
npm run dev  # Starts server with nodemon for auto-reload
```

### Database Management

To reset the database:
```bash
psql -U postgres -f backend/db/schema.sql
psql -U postgres -d daily_aesthetic -f backend/db/seed.sql
```

To add more seed data, edit `backend/db/seed.sql` and re-run the seed command.

## Environment Variables

The backend uses the following environment variables (defined in `.env`):

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `DB_USER` | PostgreSQL username | postgres |
| `DB_HOST` | Database host | localhost |
| `DB_NAME` | Database name | daily_aesthetic |
| `DB_PASSWORD` | Database password | postgres |
| `DB_PORT` | Database port | 5432 |

## Troubleshooting

### Backend won't start
- Ensure PostgreSQL is running: `pg_isready`
- Check your database credentials in `.env`
- Verify the database exists: `psql -U postgres -l | grep daily_aesthetic`

### Frontend can't connect to backend
- Ensure backend is running on port 3000
- Check for CORS errors in browser console
- Verify the API_BASE_URL in `frontend/js/api.js` matches your backend URL

### Database errors
- Ensure you've run both schema.sql and seed.sql
- Check PostgreSQL logs for specific error messages
- Verify your PostgreSQL user has necessary permissions

## Future Enhancements

- ✅ ~~User authentication and authorization~~ (Completed)
- ✅ ~~Admin panel for content management~~ (Completed)
- Image upload functionality with cloud storage
- Search and filtering for content
- Shopping cart functionality
- Newsletter subscription
- Comment system
- Multi-user admin with roles and permissions
- Content versioning and drafts
- Analytics dashboard

## License

MIT

## Original Design

This project was converted from a single-file HTML prototype to a full-stack application while maintaining the original minimalist aesthetic and design philosophy.