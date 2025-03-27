<template>
  <div class="container custom-container">
    <div class="page">
      <h2>
        <span>HITELESÍTÉS</span>
        <i class="bi bi-info-circle" title="A * részek kötelezőek"></i>
      </h2>

      <div v-if="isEmailVerified" class="success-message">
        <p class="text-center display-4">Sikeres Igazolás!</p>
        <p class="text-center mt-3 small-text">
          Ha az oldal nem irányít át automatikusan, kattints a jobb alsó sarokban lévő 'Küldés' gombra.
        </p>
        <div class="text-center mt-4">
          <div class="spinner"></div>
        </div>
      </div>


      <div v-else-if="!isEmailVerified" class="verification-section">
        <p class="info-text">
          Az űrlap elküldéséhez igazolja e-mail címét a kapott kóddal.
        </p>

        <div class="row">
          <div class="col-md-12">
            <!-- E-mail mező -->
            <input
              type="text"
              placeholder="E-mail cím *"
              class="form-control mb-3 uniform-input"
              v-model="emailAddress"
              required
              :disabled="isEmailVerified"
            />
            <span v-if="errors.email" class="error">{{ errors.email }}</span>
            <p v-if="message" class="verification-message mt-1">{{ message }}</p>
          </div>
        </div>

        <div class="row justify-content-end mb-3">
          <div class="col-auto position-relative">
            <button
              v-if="!isEmailVerified"
              class="btn btn-sm verification-btn d-inline-block"
              @click="sendVerificationCode"
              :disabled="isButtonDisabled"
              style="background-color: #50adc9; color: white; border: none;"
            >
              Verifikációs kód küldése
            </button>
          </div>
        </div>

        <div v-if="showVerificationCodeInput || isEmailVerified" class="verification-code-section">
          <div class="row">
            <div class="col-md-12">
              <!-- Verifikációs kód mező -->
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
          <div class="row justify-content-end mb-3">
            <div class="col-auto">
              <button
                class="btn btn-sm verification-btn d-inline-block"
                @click="verifyCode"
                :disabled="isEmailVerified"
                style="background-color: #50adc9; color: white; border: none;"
              >
                {{ isEmailVerified ? 'Hitelesítve' : 'Kód ellenőrzése' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      emailAddress: '',
      verificationCode: '',
      showVerificationCodeInput: false,
      isEmailVerified: false,
      errors: {},
      sendAttempts: 0,
      isButtonDisabled: false,
      message: '',
      codeExpirationTime: null,
    };
  },
  methods: {
    async sendVerificationCode() {
      if (this.sendAttempts >= 3) {
        this.message = 'A legfeljebb háromszor lehet kódot kérni!';
        return;
      }

      this.errors = {};
      if (!this.validateEmail(this.emailAddress)) {
        this.errors.email = 'Érvénytelen e-mail cím formátum.';
        return;
      }

      this.isButtonDisabled = true;
      this.sendAttempts++;

      try {
        const response = await axios.post('http://localhost:3000/send-verification-code', {
          email: this.emailAddress,
          verificationCode: this.generateVerificationCode(),
        });

        if (response.status === 200) {
          this.showVerificationCodeInput = true;
          this.codeExpirationTime = Date.now() + 600000; // 10 perc múlva lejár

          let remainingTime = 10;
          const interval = setInterval(() => {
            this.message = `Elküldtük a kódot a(z) ${this.emailAddress} címre! Új kód küldése ${remainingTime} mp múlva! Még ${3 - this.sendAttempts} új kódot kérhet! \n A kód 10 perc múlva lejár!`;
            remainingTime--;
            if (remainingTime <= 0) {
              clearInterval(interval);
              this.message = '';
              this.isButtonDisabled = false;
            }
          }, 1000);
        } else {
          this.message = 'Hiba történt a kód küldése során.';
          this.isButtonDisabled = false;
        }
      } catch (error) {
        console.error('Hiba a kód küldése során:', error);
        this.message = 'Nem sikerült elküldeni a kódot.';
        this.isButtonDisabled = false;
      }
    },

    async verifyCode() {
      this.errors = {};
      if (!this.verificationCode) {
        this.errors.verificationCode = 'A verifikációs kód kötelező.';
        return;
      }

      // Ellenőrizd, hogy a kód lejárt-e
      if (Date.now() > this.codeExpirationTime) {
        this.errors.verificationCode = 'A kód lejárt. Kérjen új kódot.';
        return;
      }

      try {
        const response = await axios.post('http://localhost:3000/verify-code', {
          email: this.emailAddress,
          code: this.verificationCode,
        });
        if (response.data.success) {
          this.isEmailVerified = true;
          this.message = 'Hitelesítve!';
          this.showVerificationCodeInput = false;
          this.errors = {};
          this.$emit('verification-success'); // Esemény kibocsátása
        } else {
          this.errors.verificationCode = 'A megadott kód helytelen.';
        }
      } catch (error) {
        console.error('Hiba a kód ellenőrzése során:', error);
        this.errors.verificationCode = 'Nem sikerült ellenőrizni a kódot.';
      }
    },
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    generateVerificationCode() {
      return Math.floor(100000 + Math.random() * 900000).toString();
    },
  },
};
</script>


<style src="/src/assets/css/style_pages.css"></style>
