import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Environment setup BEFORE imports
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Import routes
import sefariaRoutes from './routes/sefaria.js';
import geminiRoutes from './routes/gemini.js';
import booksRoutes from './routes/books.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { corsConfig } from './middleware/cors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors(corsConfig));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/sefaria', sefariaRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/books', booksRoutes);

// Serve static files - FIXED PATH FOR PRODUCTION
const staticPath = isProduction ? path.join(__dirname, './public') : path.join(__dirname, '../../client');
const indexPath = isProduction ? path.join(__dirname, './public/index.html') : path.join(__dirname, '../../client/index.html');

// Serve static files
app.use(express.static(staticPath));

// Serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(404).json({ error: 'Page not found' });
      }
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Static path: ${staticPath}`);
  console.log(`📄 Index path: ${indexPath}`);
});