<template>
  <div class="container custom-container">
    <div class="page">
      <h2>
        <span>HITELESÍTÉS</span>
        <i class="bi bi-info-circle" title="A * részek kötelezőek"></i>
      </h2>

      <div class="verification-section">
        <!-- Magyarázó szöveg -->
        <p class="info-text">
          Az űrlap elküldéséhez szükséges az e-mail cím hitelesítése. Kérjük, adja meg az e-mail címét, majd erősítse meg a kapott kóddal.
        </p>

        <!-- E-mail cím mező -->
        <div class="row">
          <div class="col-md-12">
            <input
              type="email"
              placeholder="E-mail cím *"
              class="form-control mb-3 uniform-input"
              v-model="emailAddress"
              required
              :disabled="isEmailVerified"
            />
            <span v-if="errors.email" class="error">{{ errors.email }}</span>
          </div>
        </div>

        <!-- Verifikációs kód küldése gomb -->
        <div class="row justify-content-center mb-3">
          <div class="col-auto">
            <button
              v-if="!isEmailVerified && !showVerificationCodeInput"
              class="btn btn-sm verification-btn d-inline-block"
              @click="sendVerificationCode"
              style="background-color: #007bff; color: white; border: none;"
            >
              Verifikációs kód küldése
            </button>
          </div>
        </div>

        <!-- Verifikációs kód mező és ellenőrzés gomb -->
        <div v-if="showVerificationCodeInput || isEmailVerified" class="verification-code-section">
          <div class="row">
            <div class="col-md-12">
              <input
                v-if="!isEmailVerified"
                type="text"
                placeholder="Verifikációs kód *"
                class="form-control mb-3 uniform-input"
                v-model="verificationCode"
                required
              />
              <span v-if="errors.verificationCode" class="error">{{ errors.verificationCode }}</span>
            </div>
          </div>
          <div class="row justify-content-center mb-3">
            <div class="col-auto">
              <button
                class="btn btn-sm verification-btn d-inline-block"
                :class="{ 'btn-success': isEmailVerified, 'btn-primary': !isEmailVerified }"
                @click="verifyCode"
                :disabled="isEmailVerified"
                :style="isEmailVerified 
                  ? 'background-color: #28a745; color: white; border: none;' 
                  : 'background-color: #007bff; color: white; border: none;'"
              >
                {{ isEmailVerified ? 'Hitelesítve' : 'Kód ellenőrzése' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Hitelesítési adatok törlése gomb -->
        <div class="row justify-content-center mt-3">
          <div class="col-auto">
            <button
              class="btn btn-sm btn-danger d-inline-block"
              @click="clearVerificationData"
              style="background-color: #dc3545; color: white; border: none;"
            >
              Hitelesítési adatok törlése
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    onEmailVerified: Function, // Prop a hitelesítés állapotának frissítéséhez
  },
  data() {
    return {
      emailAddress: '',
      verificationCode: '',
      showVerificationCodeInput: false,
      isEmailVerified: false, // Hitelesítési állapot
      errors: {},
    };
  },
  methods: {
    async sendVerificationCode() {
      this.errors = {};

      // E-mail cím validálása
      if (!this.validateEmail(this.emailAddress)) {
        this.errors.email = 'Érvénytelen e-mail cím formátum.';
        return;
      }

      try {
        // Küldés a backendnek
        const response = await axios.post('http://localhost:3000/send-verification-code', {
          email: this.emailAddress,
          verificationCode: this.generateVerificationCode(),
        });

        if (response.status === 200) {
          this.showVerificationCodeInput = true;
          alert('A verifikációs kód elküldve az e-mail címre!');
        } else {
          alert('Hiba történt a kód küldése során.');
        }
      } catch (error) {
        console.error('Hiba a kód küldése során:', error);
        alert('Nem sikerült elküldeni a kódot.');
      }
    },
    async verifyCode() {
      this.errors = {};

      if (!this.verificationCode) {
        this.errors.verificationCode = 'A verifikációs kód kötelező.';
        return;
      }

      try {
        // Ellenőrzés a backenddel
        const response = await axios.post('http://localhost:3000/verify-code', {
          email: this.emailAddress,
          code: this.verificationCode,
        });

        if (response.data.success) {
          alert('A kód helyes!');
          this.isEmailVerified = true; // Hitelesítési állapot frissítése
          this.$emit('email-verified', true); // Esemény kibocsátása a hitelesítés sikerességéről

          // Tárolás a localStorage-ben
          localStorage.setItem('emailAddress', this.emailAddress);
          localStorage.setItem('isEmailVerified', true);
        } else {
          this.errors.verificationCode = 'A megadott kód helytelen.';
          this.$emit('email-verified', false); // Hibás hitelesítés
        }
      } catch (error) {
        console.error('Hiba a kód ellenőrzése során:', error);
        alert('Nem sikerült ellenőrizni a kódot.');
        this.$emit('email-verified', false); // Hibás hitelesítés
      }
    },
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    generateVerificationCode() {
      // Egyszerű verifikációs kód generálása (6 számjegy)
      return Math.floor(100000 + Math.random() * 900000).toString();
    },
    loadFromLocalStorage() {
      // Betöltés a localStorage-ből
      const savedEmail = localStorage.getItem('emailAddress');
      const savedVerified = localStorage.getItem('isEmailVerified') === 'true';

      if (savedEmail) {
        this.emailAddress = savedEmail;
      }
      if (savedVerified) {
        this.isEmailVerified = true;
        this.$emit('email-verified', true);
      }
    },
    clearVerificationData() {
      // Törlés a localStorage-ből
      localStorage.removeItem('emailAddress');
      localStorage.removeItem('isEmailVerified');

      // Alapértelmezett értékek visszaállítása
      this.emailAddress = '';
      this.verificationCode = '';
      this.isEmailVerified = false; // Hitelesítési állapot hamisra állítása
      this.showVerificationCodeInput = false;

      alert('A hitelesítési adatok törölve lettek.');
    },
  },
  mounted() {
    this.loadFromLocalStorage(); // Betöltés az oldal betöltésekor
  },
};
</script>

<style src="/src/assets/css/style_pages.css"></style>
