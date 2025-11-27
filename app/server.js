const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const PID_FILE = path.join(__dirname, '.server.pid');

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get all data
app.get('/api/data', (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'public', 'data');
    const data = {
      presets: JSON.parse(fs.readFileSync(path.join(dataPath, 'presets.json'), 'utf8')),
      styles: JSON.parse(fs.readFileSync(path.join(dataPath, 'styles.json'), 'utf8')),
      cameras: JSON.parse(fs.readFileSync(path.join(dataPath, 'cameras.json'), 'utf8')),
      lighting: JSON.parse(fs.readFileSync(path.join(dataPath, 'lighting.json'), 'utf8')),
      mood: JSON.parse(fs.readFileSync(path.join(dataPath, 'mood.json'), 'utf8')),
      composition: JSON.parse(fs.readFileSync(path.join(dataPath, 'composition.json'), 'utf8'))
    };
    res.json(data);
  } catch (error) {
    console.error('Error loading data:', error);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// Catch-all route to serve index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(PORT, () => {
  // Write PID file for stop script
  fs.writeFileSync(PID_FILE, process.pid.toString());

  console.log(`
╔════════════════════════════════════════════════════════════╗
║         Photo Prompt Generator Server Started              ║
╠════════════════════════════════════════════════════════════╣
║  Local:   http://localhost:${PORT}                           ║
║  Network: http://0.0.0.0:${PORT}                             ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Cleanup on exit
process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  if (fs.existsSync(PID_FILE)) {
    fs.unlinkSync(PID_FILE);
  }
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  if (fs.existsSync(PID_FILE)) {
    fs.unlinkSync(PID_FILE);
  }
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});
