const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const path = require('path');
const rendezvenyRoutes = require('./routes/rendezveny.route');
const statuszRoutes = require('./routes/statusz.route');
const adminRoutes = require('./routes/admin.route');
const documentRoutes = require('./routes/document.route');
const usersRouter = require('./routes/users');
const authRouter = require('./src/routes/auth');
const pricesRouter = require('./routes/prices')
require('dotenv').config(); // npm install dotenv --save ha még nincs
const { JWT_SECRET } = require('./src/config/jwt');
console.log('[startup] JWT_SECRET from config present?:', !!JWT_SECRET, 'value preview:', JWT_SECRET ? JWT_SECRET.slice(0,6) + '...' : null);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// statikus kiszolgálás az uploads mappához (így elérhető lesz a /uploads/* URL)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// egyszerű kérés-logger (konzolba)
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// api route-ok
app.use('/api/', rendezvenyRoutes);
app.use('/api/', statuszRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/prices',pricesRouter);

// prices route betöltése hibakezeléssel
// let pricesRoute;
// try {
//   pricesRoute = require('./routes/prices');
//   app.use('/api/prices', pricesRoute);
//   console.log('Loaded route: /api/prices');
// } catch (err) {
//   console.error('Could not load ./routes/prices:', err.message);
//   // ha nincs fájl, regisztrálunk egy "helyettesítő" route-ot, ami informatív JSON-t ad
//   const fallback = express.Router();
//   fallback.get('/', (req, res) => {
//     res.status(500).json({ error: 'prices route missing on server. Check Backend/routes/prices.js' });
//   });
//   app.use('/api/prices', fallback);
// }

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

app.listen(process.env.PORT || 3000, () => console.log('Server listening on', process.env.PORT || 3000));

// Indítsa el a seedelést ha kéri: állítsd RUN_SEED=1 környezeti változót vagy indítsd node server.js --seed
if (process.env.RUN_SEED === '1' || process.argv.includes('--seed')) {
  console.log('RUN_SEED detected — starting seed script');
  try {
    require('./scripts/seed-users'); // a script jelenlegi formájában azonnal lefut, ha szükséges, exportáld és hívd inkább
  } catch (err) {
    console.error('Seed script failed:', err);
  }
}

// Indítsa el a login.js szolgáltatást is (login.js saját Express példányt indít)
try {
  const login = require('./login');
  const loginPort = process.env.LOGIN_PORT || 3003;
  if (login && typeof login.start === 'function') {
    login.start(loginPort)
      .then(() => console.log('Login service started on', loginPort))
      .catch(err => console.warn('Login service failed to start:', err && err.message ? err.message : err));
  } else {
    console.log('Login module loaded but no .start() export found — ensure login.js exports start(app) or call require directly if it self-starts.');
  }
} catch (err) {
  console.warn('Failed to start login service (login.js):', err.message);
}