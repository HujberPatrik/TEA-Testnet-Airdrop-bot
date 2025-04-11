<template>
  <div class="container">
    <div
      v-for="(page, index) in pages"
      :key="index"
      :id="'page' + (index + 1)"
      class="page"
      :style="{ display: activePage === index + 1 ? 'block' : 'none' }"
    >
      <h2 class="page-title">{{ page.title }}</h2>

      <div v-if="!showCaptcha" class="description-container">
        <p>{{ page.description }}</p>
      </div>

      <div v-if="!showCaptcha" class="centered-button">
        <button class="start-button" @click="handleFillOut">Űrlap kitöltése</button>
      </div>

      <div v-if="showCaptcha" class="captcha-section">
        <div class="section-title">
          <h3>Robot ellenőrzés</h3>
          <i class="bi bi-info-circle" title="A * részek kötelezőek"></i>
        </div>

        <div class="captcha-container">
          <p class="captcha-explanation">
            Kérjük, igazolja, hogy nem robot a biztonsági ellenőrzés kitöltésével.
            Ez segít megvédeni rendszerünket az automatizált programoktól.
          </p>
          <div id="g-recaptcha" class="g-recaptcha" :data-sitekey="siteKey"></div>
          <div class="centered-button">
            <button
              @click="goToNextPage"
              class="verification-button"
              :disabled="!isCaptchaVerified || loading"
            >
              <span v-if="!loading">Ellenőrzés</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      activePage: 1,
      showCaptcha: false,
      isCaptchaVerified: false,
      loading: false,
      siteKey: '',
      pages: [
        {
          title: "RENDEZVÉNY BEJELENTÉSE",
          description: "Ezen az űrlapon keresztül jelentheti be hivatalosan rendezvényét a Széchenyi Egyetem rendszerében. A bejelentés folyamata egyszerű: töltse ki a szükséges adatokat, és küldje be az űrlapot. A sikeres bejelentés után visszaigazolást kap, és a rendszer automatikusan értesíti az illetékes szervezeti egységeket."
        },
      ],
    };
  },
  methods: {
    handleFillOut() {
      console.log('Űrlap kitöltése gombra kattintva');
      this.showCaptcha = true;
      this.$nextTick(() => {
        const captchaSection = this.$el.querySelector('.captcha-section');
        if (captchaSection) {
          captchaSection.classList.add('visible');
        }
      });
      this.loadRecaptcha();
    },
    async onCaptchaVerified(token) {
      try {
        const response = await axios.post("http://localhost:3002/verify-captcha", { token });
        if (response.data.success) {
          console.log("CAPTCHA sikeresen ellenőrizve.");
          this.isCaptchaVerified = true;
        } else {
          console.error("CAPTCHA ellenőrzés sikertelen:", response.data.message);
        }
      } catch (error) {
        console.error("Hiba történt a CAPTCHA ellenőrzése során:", error);
      }
    },
    goToNextPage() {
      this.loading = true;
      setTimeout(() => {
        this.$emit("go-to-page", 1);
        this.loading = false;
      }, 1500);
    },
    loadRecaptcha() {
      console.log('reCAPTCHA szkript betöltése...');
      if (this.siteKey) {
        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log('reCAPTCHA szkript betöltve.');
          if (window.grecaptcha) {
            window.grecaptcha.render('g-recaptcha', {
              sitekey: this.siteKey,
              callback: this.onCaptchaVerified,
            });
          } else {
            console.error('grecaptcha objektum nem található a betöltés után.');
          }
        };
        script.onerror = () => {
          console.error('Hiba történt a reCAPTCHA szkript betöltése közben.');
        };
        document.head.appendChild(script);
      } else {
        console.warn('A siteKey még nincs lekérve, a reCAPTCHA nem tölthető be.');
        this.fetchRecaptchaKey();
      }
    },
    async fetchRecaptchaKey() {
      console.log('reCAPTCHA site key lekérése...');
      try {
        const response = await axios.get('http://localhost:3002/api/recaptcha-site-key');
        console.log('Site key érkezett:', response.data);
        this.siteKey = response.data.siteKey;
        this.loadRecaptcha();
      } catch (error) {
        console.error('Hiba a reCAPTCHA site key lekérése közben:', error);
      }
    },
  },
  mounted() {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.5/font/bootstrap-icons.min.css";
    document.head.appendChild(linkElement);

    this.fetchRecaptchaKey();
  },
};
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
}

.page {
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin: 20px 0;
}

.page-title {
  color: #ffffff;
  text-align: center;
  margin-bottom: 30px;
  font-weight: 600;
  font-size: 28px;
  border-bottom: 2px solid #50adc9;
  padding-bottom: 15px;
}

.description-container {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  border-left: 4px solid #50adc9;
}

.description-container p {
  color: #495057;
  line-height: 1.6;
  margin: 0;
  font-size: 16px;
}

.centered-button {
  text-align: center;
  margin: 25px 0;
}

.start-button, .verification-button {
  background-color: #50adc9;
  color: white;
  border: none;
  padding: 12px 30px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 5px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.start-button:hover, .verification-button:hover:not(:disabled) {
  background-color: #3d8ca1;
}

.verification-button:disabled {
  background-color: #b0b0b0;
  cursor: not-allowed;
}

.captcha-section {
  margin: 0 auto 20px auto;
  border-radius: 5px;
  padding: 15px;
  max-width: 600px;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.captcha-section.visible {
  opacity: 1;
}

.section-title {
  background-color: #50adc9;
  color: white;
  padding: 15px 20px;
  border-radius: 5px 5px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}

.section-title h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bi-info-circle {
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.captcha-container {
  background-color: #fff;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 5px 5px;
}

.captcha-explanation {
  color: #495057;
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.5;
}

.g-recaptcha {
  display: flex;
  justify-content: center;
  margin: 15px 0;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

.verification-button {
  background-color: #50adc9;
  color: white;
  border: none;
  padding: 12px 30px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 5px;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.verification-button:hover:not(:disabled) {
  background-color: #3d8ca1;
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.15);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .page {
    padding: 20px;
    margin: 10px 0;
  }

  .page-title {
    font-size: 24px;
  }

  .section-title h3 {
    font-size: 18px;
  }

  .start-button,
  .verification-button {
    padding: 10px 20px;
    font-size: 14px;
  }

  .description-container {
    padding: 15px;
  }

  .description-container p,
  .captcha-explanation {
    font-size: 14px;
  }

  .g-recaptcha {
    margin: 10px 0;
  }

  .captcha-section {
    max-width: 95%;
  }
}
</style>