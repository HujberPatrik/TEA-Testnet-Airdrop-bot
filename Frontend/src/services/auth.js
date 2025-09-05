import axios from 'axios';

function _getStoredToken() {
  return localStorage.getItem('authToken') || localStorage.getItem('auth_token') || null;
}

async function loginWithNeptune(neptune_code, password) {
  const body = { neptune_code: (neptune_code || '').trim().toUpperCase(), password: password || '' };
  const res = await fetch('http://localhost:3003/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (res.ok && data.token) {
    localStorage.setItem('authToken', data.token);
    if (data.user) localStorage.setItem('auth_user', JSON.stringify(data.user));
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
    localStorage.setItem('auth_user', JSON.stringify(user));
    return user;
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