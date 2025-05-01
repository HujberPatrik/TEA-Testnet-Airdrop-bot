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
                            <input type="email" class="form-control" v-model="email" placeholder="name@example.com">
                            <label for="floatingInput">Email cím</label>
                        </div>
                        <div class="form-floating mb-4">
                            <input type="password" class="form-control" v-model="password" placeholder="Password">
                            <label for="floatingPassword">Jelszó</label>
                        </div>
                        <div class="d-flex align-items-center justify-content-between mb-4">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="exampleCheck1">
                                <label class="form-check-label" for="exampleCheck1">Bejelentkezve maradjon?</label>
                            </div>
                            <a href="">Elfelejtette a jelszavát?</a>
                        </div>
                        <button @click="login" class="btn btn-primary py-3 w-100 mb-4">Bejelentkezés</button>
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

// Axios alapértelmezett beállítások
axios.defaults.baseURL = 'http://localhost:3003';
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('authToken')}`;

export default {
  data() {
    return {
      email: '',
      password: '',
      errorMessage: ''
    };
  },
  methods: {
    async login() {
      try {
        // Ha a mezők üresek, állítsuk be alapértelmezett értékeket
        if (!this.email && !this.password) {
          const guestPayload = {
            name: 'Guest Pista',
            role: 'Admin'
          };

          // Token szimulálása (JWT formátumú)
          const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
          const payload = btoa(JSON.stringify(guestPayload));
          const signature = btoa('guest-signature'); // Szimulált aláírás
          const token = `${header}.${payload}.${signature}`;

          localStorage.setItem('authToken', token);

          console.log('Guest felhasználóként belépve:', guestPayload);

          // Átirányítás az admin oldalra
          this.$router.push('/admin/');
          return;
        }

        // Normál bejelentkezés
        const response = await axios.post('http://localhost:3003/api/login', {
          email: this.email,
          password: this.password
        });

        const { token } = response.data;

        // Token mentése helyi tárolóba
        localStorage.setItem('authToken', token);

        // Átirányítás az admin oldalra
        this.$router.push('/admin/');
      } catch (error) {
        this.errorMessage = 'Hibás email vagy jelszó!';
      }
    }
  }
};
</script>