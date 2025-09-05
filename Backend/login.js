const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const pool = require('./config/db'); // csatlakozás a projekt DB configjához
const path = require('path');

const { JWT_SECRET, JWT_EXPIRES_IN, JWT_ALGORITHM } = require('./src/config/jwt');

const app = express();
app.use(express.json());
app.use(cors());

// CORS konfiguráció (env-vel felülírható)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const corsOptions = {
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};
app.use(cors(corsOptions));

// statikus fájlok szolgáltatása: /uploads/* -> Backend/uploads/*
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET not set, using default insecure secret. Set JWT_SECRET in env for production.');
}

// közös bejelentkező handler, támogatja a { identity, password } és { email, password } payload-ot
async function handleLogin(req, res) {
  const identity = (
    req.body.identity ||
    req.body.email ||
    req.body.neptun_code ||    // ha frontend neptun_code-ot küld
    req.body.neptune_code ||   // ha véletlenül 'neptune' név lett használva
    req.body.neptun ||         // alternatív mezőnév
    ''
  ).trim();
  const password = req.body.password;

  if (!identity || !password) {
    return res.status(400).json({ error: 'Hiányzó adatok' });
  }

  const client = await pool.connect();
  try {
    const q = `
      SELECT id, email, neptun_code, full_name, role, password_hash
      FROM users
      WHERE lower(email) = lower($1) OR upper(neptun_code) = upper($1)
      LIMIT 1
    `;
    const r = await client.query(q, [identity]);
    const user = r.rows[0];
    if (!user) return res.status(401).json({ error: 'Nincs ilyen felhasználó' });

    const hash = user.password_hash;
    if (!hash) return res.status(401).json({ error: 'Jelszó nincs beállítva' });

    const ok = await bcrypt.compare(password, hash);
    if (!ok) return res.status(401).json({ error: 'Hibás email vagy jelszó' });

    const payload = {
      id: user.id,
      email: user.email || null,
      role: user.role || null
    };

    let token;
    try {
      token = jwt.sign(payload, JWT_SECRET, { algorithm: JWT_ALGORITHM, expiresIn: JWT_EXPIRES_IN });
    } catch (signErr) {
      console.error('JWT sign error', signErr);
      return res.status(500).json({ error: 'Token generálási hiba' });
    }

    // DEBUG: ne hagyd élesben sokáig, csak teszthez
    console.log('[login] JWT secret present?:', !!process.env.JWT_SECRET, 'token length:', token ? token.length : null);
    try {
      const decoded = jwt.decode(token);
      console.log('[login] token payload preview:', decoded);
    } catch (e) {
      console.warn('[login] token decode failed', e.message);
    }

    res.setHeader('Authorization', 'Bearer ' + token);

    const safeUser = {
      id: user.id,
      email: user.email,
      neptun: user.neptun_code,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url || null
    };

    console.log('[login] responding with user:', safeUser);

    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
}

// hitelesítés JWT-vel a /me végponthoz
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// /api/auth/me: visszaadja a DB-ből a user-t (full_name is)
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const id = req.user && req.user.id;
  if (!id) return res.status(400).json({ error: 'Missing user id in token' });

  const client = await pool.connect();
  try {
    const q = `
      SELECT id, email, neptun_code, full_name, role ,avatar_url
      FROM users
      WHERE id = $1
      LIMIT 1
    `;
    const r = await client.query(q, [id]);
    const user = r.rows[0];
    if (!user) return res.status(404).json({ error: 'Not found' });
    return res.json({
      id: user.id,
      email: user.email,
      neptun_code: user.neptun_code,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url
    });
  } catch (err) {
    console.error('[login /me] error', err);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// regisztráljuk a route-okat (mindkettőt, hogy kompatibilis legyen a frontend különböző variánsokkal)
app.post('/api/login', handleLogin);
app.post('/api/auth/login', handleLogin);

function start(port = process.env.LOGIN_PORT || 3003) {
  return new Promise((resolve, reject) => {
    try {
      const server = app.listen(port, () => {
        console.log('Login service listening on', port);
        resolve(server);
      });
    } catch (err) {
      reject(err);
    }
  });
}

// csak ha közvetlenül futtatják: node login.js
if (require.main === module) {
  start().catch(err => {
    console.error('Failed to start login service (direct run):', err);
    process.exit(1);
  });
}

// exportáljuk az app-ot és a start függvényt
module.exports = { app, start };