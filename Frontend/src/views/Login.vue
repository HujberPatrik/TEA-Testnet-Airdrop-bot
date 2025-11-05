<template>
  <div class="container-fluid position-relative bg-white d-flex p-0">
    <!-- Sign In Start -->
    <div class="container-fluid">
      <div class="row h-100 align-items-center justify-content-center" style="min-height: 100vh;">
        <div class="col-12 col-sm-8 col-md-6 col-lg-5 col-xl-4">
          <div class="bg-light rounded p-4 p-sm-5 my-4 mx-3">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <a href="/" class="">
                <img src="../img/egyetemi logo/fekvo_RGB/sze_logo_fekvo_RGB_white_bg.png" alt="Logo" style="height: 40px;">
              </a>
              <h3>Bejelentkezés</h3>
            </div>

            <!-- FORM hozzáadva: a böngésző így felismeri a login-t -->
            <form ref="loginForm" autocomplete="on" @submit.prevent="login">
              <div class="form-floating mb-3">
                <input
                  id="neptun"
                  name="username"
                  autocomplete="username"
                  type="text"
                  class="form-control"
                  v-model.trim="neptunKod"
                  placeholder="Neptun kód"
                  autocapitalize="none"
                  spellcheck="false"
                />
                <label for="neptun">Neptun kód</label>
              </div>

              <div class="form-floating mb-4">
                <input
                  id="password"
                  name="password"
                  autocomplete="current-password"
                  type="password"
                  class="form-control"
                  v-model="password"
                  placeholder="Jelszó"
                />
                <label for="password">Jelszó</label>
              </div>

              <div class="d-flex align-items-center justify-content-between mb-4">
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="rememberMe"
                    v-model="rememberMe"
                  />
                  <label class="form-check-label" for="rememberMe">Bejelentkezve maradjon?</label>
                </div>
                <a href="">Elfelejtette a jelszavát?</a>
              </div>

              <button type="submit" class="btn btn-primary py-3 w-100 mb-4">Bejelentkezés</button>
            </form>

            <p class="text-center mb-0 text-danger">{{ errorMessage }}</p>
            <p class="text-center mb-0">Nincs még fiókja? <a href="">Regisztráció</a></p>
          </div>
        </div>
      </div>
    </div>
    <!-- Sign In End -->
  </div>
</template>

<script>
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:3003';

export default {
  data() {
    return {
      neptunKod: '',
      password: '',
      rememberMe: true,
      errorMessage: ''
    };
  },
  mounted() {
    console.log('[Login] mounted, token length:', (localStorage.getItem('authToken') || '').length);
    this._tryPrefillBrowserCredentials(); // opcionális: korábban mentett adatok betöltése
  },
  methods: {
    async login() {
      console.log('[login] clicked start', { neptunKod: this.neptunKod, passwordPresent: !!this.password });

      try {
        // Guest mód teszteléshez (opcionális)
        if (!this.neptunKod && !this.password) {
          const token = this._fakeGuestToken();
          this._persistToken(token);
          this.$router.push('/admin/');
          return;
        }

        console.log('[login] about to send POST to backend');
        const response = await axios.post('http://localhost:3003/api/auth/login', {
          neptune_code: (this.neptunKod || '').trim().toUpperCase(),
          password: this.password
        }, { timeout: 10000 });

        localStorage.setItem('auth_user', JSON.stringify(response.data.user));

        const { token } = response.data || {};
        if (!token) {
          this.errorMessage = 'Hiba: nincs token a válaszban';
          return;
        }

        this._persistToken(token);

        // Böngésző jelszó‑mentés kérése (HTTPS vagy localhost esetén)
        if (this.rememberMe) await this._storeBrowserCredentials();

        console.log('[login] saved token, redirecting');
        this.$router.push('/admin/');
      } catch (err) {
        console.error('[login] error', err);
        if (err.response) console.error('response data:', err.response.data);
        this.errorMessage = 'Hibás Neptun kód vagy jelszó, vagy a szerver nem elérhető.';
      } finally {
        console.log('[login] finished');
      }
    },

    _persistToken(token) {
      // rememberMe: localStorage, különben sessionStorage
      const persistent = this.rememberMe ? localStorage : sessionStorage;
      const volatile = this.rememberMe ? sessionStorage : localStorage;

      persistent.setItem('authToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      volatile.removeItem('authToken');
    },

    async _storeBrowserCredentials() {
      try {
        const secure = location.protocol === 'https:' || location.hostname === 'localhost';
        if (!secure) return false;
        const form = this.$refs.loginForm;
        const username = form?.elements?.username?.value || this.neptunKod || '';
        const password = form?.elements?.password?.value || this.password || '';
        if (!username || !password) return false;

        // Modern API
        let cred = null;
        if (navigator.credentials?.create) {
          cred = await navigator.credentials.create({
            password: { id: username, name: username, password }
          });
        }
        // Régi API fallback
        if (!cred && 'PasswordCredential' in window) {
          cred = new window.PasswordCredential({ id: username, name: username, password });
        }
        if (!cred) return false;

        await navigator.credentials.store(cred);
        console.log('[login] credentials stored via Credentials API');
        return true;
      } catch (e) {
        console.debug('[login] credentials.store skipped', e);
        return false;
      }
    },

    async _tryPrefillBrowserCredentials() {
      try {
        const secure = location.protocol === 'https:' || location.hostname === 'localhost';
        if (!secure || !navigator.credentials?.get) return;
        const cred = await navigator.credentials.get({ password: true, mediation: 'optional' });
        if (cred && cred.type === 'password') {
          this.neptunKod = cred.id || '';
          // Jelszót nem szokás előtölteni automatikusan; hagyjuk a böngészőre.
        }
      } catch { /* ignore */ }
    },

    _fakeGuestToken() {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ name: 'Guest Pista', role: 'Admin' }));
      const signature = btoa('guest-signature');
      return `${header}.${payload}.${signature}`;
    }
  }
};
</script>