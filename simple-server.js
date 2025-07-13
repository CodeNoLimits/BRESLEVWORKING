const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3001;

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:4000',
  changeOrigin: true,
  logLevel: 'debug'
}));

// Serve static files from client directory
app.use(express.static(path.join(__dirname, 'client')));

// Route pour carre-trilingue
app.get('/carre-trilingue', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'carre-trilingue.html'));
});

// Route pour carre-trilingue-v2
app.get('/carre-trilingue-v2', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'carre-trilingue-v2.html'));
});

// Route pour chayei-moharan
app.get('/chayei-moharan', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'chayei-moharan-complete.html'));
});

// Route pour sefaria-reader
app.get('/sefaria-reader', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'breslov-reader-sefaria.html'));
});

// Route pour trilingue
app.get('/trilingue', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'chayei-moharan-trilingue.html'));
});

// Route pour test-books
app.get('/test-books', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'test-all-breslov-books.html'));
});

// Default route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Frontend server running on http://localhost:${PORT}`);
  console.log(`📡 API requests proxied to http://localhost:4000`);
  console.log(`\n✨ Open http://localhost:${PORT} in your browser`);
});