#!/usr/bin/env node

/**
 * Simsta Player Data Updater
 * Monitors game state and updates userData.json in real-time
 * Run this script while playing the game
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const DATA_FILE = path.join(__dirname, 'userData.json');
const PORT = 9999;

// Default player data structure for Simsta
const defaultData = {
  username: 'Player',
  profilePicture: '😊',
  followers: 0,
  totalLikes: 0,
  totalShares: 0,
  totalViews: 0,
  posts: [],
  videos: [],
  messages: [],
  sessionFollowers: 0,
  sessionLikes: 0,
  sessionShares: 0,
  sessionComments: 0,
  isVerified: false,
  viralPosts: [],
  lastPostTime: 0,
  autoPostEnabled: true,
  lastAutoPostTime: 0,
  lastSave: 0
};

// Create HTTP server to receive data from browser
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/update-player-data') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const playerData = JSON.parse(body);

        // Ensure data directory exists
        const dataDir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }

        // Write to JSON file
        fs.writeFileSync(DATA_FILE, JSON.stringify(playerData, null, 2), 'utf8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));

        console.log(`✓ Updated userData.json at ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.error('Error updating player data:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`\n🎮 Simsta Player Data Updater Running`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📡 Server listening on http://localhost:${PORT}`);
  console.log(`📁 Data file: ${DATA_FILE}`);
  console.log(`\n✓ Open Simsta in your browser and play!`);
  console.log(`✓ userData.json will update automatically`);
  console.log(`\nPress Ctrl+C to stop\n`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error(`Try killing the process or use a different port.\n`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

