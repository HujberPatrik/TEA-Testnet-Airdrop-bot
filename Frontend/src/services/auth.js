import axios from 'axios';

function _getStoredToken() {
  return localStorage.getItem('authToken') || localStorage.getItem('auth_token') || null;
}

// helper: normalize one user object (mutates)
function _normalizeUserObject(u) {
  if (!u || typeof u !== 'object') return u;
  const av = u.avatar_url || u.avatar;
  if (!av) return u;
  // teljes URL megtartása
  if (/^https?:\/\//i.test(String(av))) {
    u.avatar_url = av;
    if (!u.avatar) u.avatar = av;
    return u;
  }
  // normalizáljuk a windows backslashokat -> slash
  const s = String(av).replace(/\\/g, '/');
  const idx = s.lastIndexOf('/uploads/');
  if (idx !== -1) {
    const val = s.substring(idx);
    u.avatar_url = val;
    if (!u.avatar) u.avatar = val;
    return u;
  }
  if (s.startsWith('/uploads')) {
    u.avatar_url = s;
    if (!u.avatar) u.avatar = s;
    return u;
  }
  // ha csak fájlnév van, prefixeljük
  const filenameMatch = s.match(/([^\/]+?\.(jpg|jpeg|png|gif|webp))$/i);
  if (filenameMatch) {
    const val = '/uploads/' + filenameMatch[1];
    u.avatar_url = val;
    if (!u.avatar) u.avatar = val;
    return u;
  }
  // fallback: csak a normalized string mentése
  u.avatar_url = s;
  if (!u.avatar) u.avatar = s;
  return u;
}

// helper: normalize payload that may be wrapper ({ user: ... }) vagy maga az objektum
function _normalizePayload(payload) {
  if (!payload) return payload;
  if (payload.user && typeof payload.user === 'object') {
    _normalizeUserObject(payload.user);
    return payload;
  }
  if (payload.data && payload.data.user && typeof payload.data.user === 'object') {
    _normalizeUserObject(payload.data.user);
    return payload;
  }
  // ha maga user objektum
  _normalizeUserObject(payload);
  return payload;
}

async function loginWithNeptune(neptune_code, password) {
  const body = { neptune_code: (neptune_code || '').trim().toUpperCase(), password: password || '' };
  const res = await fetch('http://localhost:3003/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();

  console.debug('[auth] login response raw:', data);

  if (res.ok && data.token) {
    localStorage.setItem('authToken', data.token);

    // ha a login válaszban van user, azonnal normalize-oljuk és mentjük
    if (data.user) {
      _normalizeUserObject(data.user);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      // értesítjük a UI-t (Navbar hallgat rá)
      window.dispatchEvent(new CustomEvent('user-logged-in', { detail: data.user }));
      console.debug('[auth] saved user from login:', data.user);
      return data;
    }

    // ha nincs user a válaszban, lekérdezzük a /me végpontot és frissítjük a mentést
    try {
      const me = await ensureAuthUser(); // ensureAuthUser menteni fogja a normalized auth_user-t
      // ensureAuthUser visszatérhet wrapper-rel vagy magával a user-rel — próbáljuk kibontani
      let userObj = me;
      if (me && me.user) userObj = me.user;
      if (me && me.data && me.data.user) userObj = me.data.user;
      if (userObj) {
        _normalizeUserObject(userObj);
        localStorage.setItem('auth_user', JSON.stringify(userObj));
        window.dispatchEvent(new CustomEvent('user-logged-in', { detail: userObj }));
        console.debug('[auth] fetched & saved user from /me:', userObj);
      }
    } catch (e) {
      console.warn('[auth] failed to fetch /me after login', e);
    }

  } else {
    // tisztítás ha sikertelen
    localStorage.removeItem('authToken');
    localStorage.removeItem('auth_user');
  }
  return data;
}

async function ensureAuthUser() {
  try {
    const cached = localStorage.getItem('auth_user');
    if (cached) return JSON.parse(cached);
    const token = _getStoredToken();
    if (!token) return null;
    const res = await fetch('http://localhost:3003/api/auth/me', {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (!res.ok) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('auth_user');
      return null;
    }
    const user = await res.json();
    const normalized = _normalizePayload(user);
    localStorage.setItem('auth_user', JSON.stringify(normalized));
    return normalized;
  } catch (err) {
    console.error('[auth] ensureAuthUser error', err);
    return null;
  }
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('auth_user');
}

export default {
  _getStoredToken,
  loginWithNeptune,
  ensureAuthUser,
  logout,
};

// Named export (UniFamulusCostCalculator.vue importálhatja: import { ensureAuthUser } from '@/services/auth')
export { ensureAuthUser };