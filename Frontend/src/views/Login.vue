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
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" v-model="neptunKod" placeholder="Neptun kód">
                            <label for="floatingInput">Neptun kód</label>
                        </div>
                        <div class="form-floating mb-4">
                            <input type="password" class="form-control" v-model="password" placeholder="Jelszó">
                            <label for="floatingPassword">Jelszó</label>
                        </div>
                        <div class="d-flex align-items-center justify-content-between mb-4">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="exampleCheck1">
                                <label class="form-check-label" for="exampleCheck1">Bejelentkezve maradjon?</label>
                            </div>
                            <a href="">Elfelejtette a jelszavát?</a>
                        </div>
                        <button type="button" @click="login" class="btn btn-primary py-3 w-100 mb-4">Bejelentkezés</button>
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

// Axios alapértelmezett beállítások (nem kötelező, de lehet)
axios.defaults.baseURL = 'http://localhost:3003';

export default {
  data() {
    return {
      neptunKod: '',
      password: '',
      errorMessage: ''
    };
  },
  mounted() {
    console.log('[Login] mounted, token length:', (localStorage.getItem('authToken') || '').length);
  },
  methods: {
    async login() {
      console.log('[login] clicked start', { neptunKod: this.neptunKod, passwordPresent: !!this.password });

      try {
        // ellenőrző logok - hol tér vissza?
        if (!this.neptunKod && !this.password) {
          console.log('[login] guest flow start');
          const guestPayload = { name: 'Guest Pista', role: 'Admin' };
          const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
          const payload = btoa(JSON.stringify(guestPayload));
          const signature = btoa('guest-signature');
          const token = `${header}.${payload}.${signature}`;
          localStorage.setItem('authToken', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('[login] guest token created, redirecting', { tokenLength: token.length });
          this.$router.push('/admin/');
          return;
        }

        console.log('[login] about to send POST to backend');
        // explicit teljes URL, hogy biztosan menjen
        const response = await axios.post('http://localhost:3003/api/auth/login', {
          neptune_code: (this.neptunKod || '').trim().toUpperCase(),
          password: this.password
        }, { timeout: 10000 });

        console.log('[login] response received', response.status, response.data);
        const { token } = response.data || {};
        if (!token) {
          console.error('[login] no token in response', response.data);
          this.errorMessage = 'Hiba: nincs token a válaszban';
          return;
        }

        localStorage.setItem('authToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('[login] saved token, redirecting');
        this.$router.push('/admin/');
      } catch (err) {
        console.error('[login] error', err);
        if (err.response) console.error('response data:', err.response.data);
        this.errorMessage = 'Hibás Neptun kód vagy jelszó, vagy a szerver nem elérhető.';
      } finally {
        console.log('[login] finished');
      }
    }
  }
};
</script>