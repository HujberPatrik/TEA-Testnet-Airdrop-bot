const { spawn } = require('child_process');

// Indítsd el a data.js fájlt
const dataService = spawn('node', ['data.js'], { stdio: 'inherit' });

// Indítsd el a server.js fájlt
const serverService = spawn('node', ['server.js'], { stdio: 'inherit' });

dataService.on('error', (err) => {
  console.error('Hiba a data.js futtatása közben:', err);
});

serverService.on('error', (err) => {
  console.error('Hiba a server.js futtatása közben:', err);
});