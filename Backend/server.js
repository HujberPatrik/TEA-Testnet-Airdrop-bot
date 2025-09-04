const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const rendezvenyRoutes = require('./routes/rendezveny.route');
const statuszRoutes = require('./routes/statusz.route');
const documentRoutes = require('./routes/document.route');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// egyszerű kérés-logger (konzolba)
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// api route-ok
app.use('/api', rendezvenyRoutes);
app.use('/api', statuszRoutes);
app.use('/api/document', documentRoutes);

// prices route betöltése hibakezeléssel
let pricesRoute;
try {
  pricesRoute = require('./routes/prices');
  app.use('/api/prices', pricesRoute);
  console.log('Loaded route: /api/prices');
} catch (err) {
  console.error('Could not load ./routes/prices:', err.message);
  // ha nincs fájl, regisztrálunk egy "helyettesítő" route-ot, ami informatív JSON-t ad
  const fallback = express.Router();
  fallback.get('/', (req, res) => {
    res.status(500).json({ error: 'prices route missing on server. Check Backend/routes/prices.js' });
  });
  app.use('/api/prices', fallback);
}

// health check
app.get('/', (req, res) => {
  res.json({ message: 'ok' });
});

// minden /api/* végpontnál 404 esetén JSON választ adunk
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found: ' + req.originalUrl });
});

// adatbázis ellenőrzés (csak log)
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected:', result.rows[0]);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});