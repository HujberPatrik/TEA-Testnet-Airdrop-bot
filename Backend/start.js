const { spawn } = require('child_process');

// Indítsd el az emailService.js fájlt
const emailService = spawn('node', ['emailService.js'], { stdio: 'inherit' });

// Indítsd el a data.js fájlt
const dataService = spawn('node', ['data.js'], { stdio: 'inherit' });

emailService.on('error', (err) => {
  console.error('Hiba az emailService.js futtatása közben:', err);
});

dataService.on('error', (err) => {
  console.error('Hiba a data.js futtatása közben:', err);
});