<template>
  <div class="container">
    <div
      v-for="(page, index) in pages"
      :key="index"
      :id="'page' + (index + 1)"
      class="page"
      :style="{ display: activePage === index + 1 ? 'block' : 'none' }"
    >
      <h2>
        <span>{{ page.title }}</span>
      </h2>

      <div v-if="!showCaptcha" class="centered-button">
        <button class="StartButton" @click="handleFillOut">Kitöltés</button>
      </div>

      <div v-if="!showCaptcha">
        Kérjük, a Rendezvénybejelentő űrlap kitöltése során minden adatot pontosan és helyesen adjon meg. A * jellel ellátott mezők kitöltése kötelező, mivel ezek az információk alapvetőek a rendezvény bejelentéséhez és feldolgozásához. A % jelzi, hogy hány oldal kitöltése van még hátra. A folyamat végén hitelesítés céljából meg kell adnia az email címét, amelyre egy biztonsági kódot fog kapni.
      </div>
      <div v-if="showCaptcha" class="captcha-container">
        <div class="captcha-box">
          <h3>Robot ellenőrzés</h3>
          <div class="checkbox-container">
            <label class="custom-checkbox">
              <input type="checkbox" v-model="isRobotChecked" />
              <span class="checkmark"></span>
              <span class="checkbox-text">Nem vagyok robot</span>
            </label>
          </div>
          <div v-if="loading" class="loading-circle-captcha"></div>
          <div v-if="!loading" class="centered-button">
            <button @click="goToNextPage" class="btn btn-primary" :disabled="!isRobotChecked || loading">Ellenőrzés</button>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activePage: 1,
      isRobotChecked: false,
      showCaptcha: false,
      loading: false, // Track loading state
      pages: [
        {
          title: 'RENDEZVÉNY BEJELENTÉSE',
        },
      ],
    };
  },
  methods: {
    handleFillOut() {
      this.showCaptcha = true;
    },
    goToNextPage() {
      this.loading = true; // Start loading animation
      setTimeout(() => {
        this.$emit('go-to-page', 1);
        this.loading = false; // Stop loading animation after 1.5 seconds
      }, 1500); // Delay of 1.5 seconds before going to the next page
    },
  },
};
</script>

<style scoped>
.centered-button {
  text-align: center;
  margin-top: 20px;
}

.StartButton {
  background-color: #50adc9;
  color: white;
  border: none;
  padding: 15px 30px;
  cursor: pointer;
  font-size: 18px;
  border-radius: 5px;
  margin-top: 50px;
  margin-bottom: 50px;
}

.StartButton:hover {
  background-color: #3d8ca1;
}

/* CAPTCHA Modern Styles */
.captcha-container {
  text-align: center;
  margin-top: 50px;
  margin-bottom: 50px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.captcha-box {
  display: inline-block;
  padding: 20px;
  border: 2px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  width: 100%; /* Make it take full width on smaller screens */
  max-width: 350px; /* Set a max width */
  height: auto;
  box-sizing: border-box;
}

.checkbox-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
}

.checkmark {
  width: 24px;
  height: 24px;
  background-color: #ddd;
  border-radius: 5px;
  margin-right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.custom-checkbox input:checked + .checkmark {
  background-color: #50adc9;
}

.checkbox-text {
  font-size: 18px;
}

.loading-circle-captcha {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #50adc9;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin: 20px auto;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .captcha-box {
    padding: 15px;
    width: 90%;
    max-width: 100%;
  }
  
  .checkbox-text {
    font-size: 16px;
  }

  .loading-circle-captcha {
    width: 30px;
    height: 30px;
  }
  
  .btn-primary {
    padding: 12px 20px;
    font-size: 16px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>

<style src="/src/assets/css/style_pages.css"></style>
