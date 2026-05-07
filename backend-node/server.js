/**
 * ============================================
 * MasakYuk API Server — Express.js
 * ============================================
 * Entry point untuk backend Node.js.
 * Menggantikan PHP backend sebelumnya.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

// -----------------------------------------------
// Middleware
// -----------------------------------------------
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// -----------------------------------------------
// Routes
// -----------------------------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/todos', require('./routes/todos'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'MasakYuk API is running', timestamp: new Date().toISOString() });
});

// -----------------------------------------------
// 404 Handler
// -----------------------------------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// -----------------------------------------------
// Global Error Handler
// -----------------------------------------------
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// -----------------------------------------------
// Start Server
// -----------------------------------------------
app.listen(PORT, () => {
  console.log(`\n🍳 MasakYuk API Server`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
