const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const projectsRouter = require('./routes/projects');
const articlesRouter = require('./routes/articles');
const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const uploadsRouter = require('./routes/uploads');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/products', productsRouter);
app.use('/api/uploads', uploadsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'The Daily Aesthetic API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      articles: '/api/articles',
      products: '/api/products',
      uploads: '/api/uploads',
      health: '/health'
    }
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║   The Daily Aesthetic API Server        ║
║   Running on port ${PORT}                   ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
╚══════════════════════════════════════════╝
  `);
  console.log(`API available at: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
