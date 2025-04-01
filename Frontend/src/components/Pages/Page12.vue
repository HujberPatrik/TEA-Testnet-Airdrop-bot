<template>
  <div class="container custom-container">
    <div class="page">
      <h2><span>KÜLDÉS</span></h2>
      <div v-if="loading" class="spinner"></div>
      <div v-else-if="successMessage" class="success-message">
        <div class="icon-container success">
          <div class="icon">&#x2714;</div>
        </div>
        <div>{{ successMessage }}</div>
        <div class="small-text">Visszairányítás: {{ countdown }} másodperc</div>
      </div>
      <div v-else-if="errorMessage" class="error-message">
        <div class="icon-container error">
          <div class="iconerror">&#x2716;</div>
        </div>
        <div>{{ errorMessage }}</div>
        <div v-if="errorCode" class="small-text">
          Hibakód: {{ errorCode }}
        </div>
        <div v-if="countdown > 0" class="small-text">
          Próbálja meg újra: {{ countdown }} másodperc
        </div>
        <div v-if="countdown === 0" class="small-text">
          <a href="#" @click.prevent="retrySend">Újra küldés</a>
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
      loading: true,
      successMessage: '',
      errorMessage: '',
      errorCode: '', // Hibakód tárolása
      countdown: 10,
      countdownTimer: null,
    };
  },
  mounted() {
    this.sendAllLocalStorageData();
  },
  methods: {
    async sendAllLocalStorageData() {
      try {
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          allData[key] = localStorage.getItem(key);
        }

        const response = await Promise.race([
          axios.post('http://localhost:3001/api/data', allData, {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000)),
        ]);

        console.log('Adatok sikeresen elküldve:', response.data);
        this.successMessage = 'Sikeres küldés!';
        this.startCountdown(() => {
          window.location.href = '/'; // Itt átirányítunk a kezdőlapra
        });
      } catch (error) {
        console.error('Hiba történt az adatok küldésekor:', error);

        if (error.response) {
          this.errorCode = error.response.status;
          switch (error.response.status) {
            case 400:
              this.errorMessage = 'Hibás kérés! Ellenőrizze az adatokat.';
              break;
            case 401:
              this.errorMessage = 'Nincs jogosultsága a kérés végrehajtásához.';
              break;
            case 403:
              // CORS hiba kezelés
              if (error.response.data && error.response.data.error && error.response.data.error.message.includes('CORS')) {
                this.errorMessage = 'CORS hiba: A szerver nem engedélyezi az ön domainjéről való hozzáférést.';
              } else {
                this.errorMessage = 'Hozzáférés megtagadva! Jogosultsági hiba.';
              }
              break;
            case 404:
              this.errorMessage = 'A keresett erőforrás nem található!';
              break;
            case 500:
              this.errorMessage = 'Belső szerverhiba történt!';
              break;
            case 502:
              this.errorMessage = 'Kapcsolódási hiba a szerverhez!';
              break;
            case 503:
              this.errorMessage = 'A szolgáltatás nem elérhető! Próbálkozzon később.';
              break;
            default:
              this.errorMessage = `Ismeretlen hiba történt: ${error.response.status} - ${error.response.statusText}`;
              break;
          }
        } else if (error.message === 'Timeout') {
          this.errorMessage = 'A kérés időtúllépés miatt sikertelen!';
        } else {
          this.errorMessage = 'Sikertelen küldés!';
          this.errorCode = 'ismeretlen'; // Ismeretlen hiba esetén
        }

        this.startCountdown(() => {
          // Lehetőség arra, hogy próbálkozzunk újra vagy más akció történjen
        });
      } finally {
        this.loading = false;
      }
    },
    startCountdown(callback) {
      this.countdownTimer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          clearInterval(this.countdownTimer);
          if (callback) callback();
        }
      }, 1000);
    },
    retrySend() {
      // Újraindítja a küldést
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      this.countdown = 10;
      this.sendAllLocalStorageData();
    },
  },
  beforeDestroy() {
    clearInterval(this.countdownTimer);
  },
};
</script>

<style src="/src/assets/css/style_pages.css"></style>
