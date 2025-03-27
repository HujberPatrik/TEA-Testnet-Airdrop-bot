<template>
  <div class="container custom-container">
    <div class="page">
      <h2>
        <span>KÜLDÉS</span>
      </h2>
      <div v-if="loading" class="spinner"></div>
      <div v-else-if="successMessage" class="success-message">{{ successMessage }}</div>
      <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <router-link to="/test">Go to Test Page</router-link>
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
          axios.post('http://localhost:3001/api/data', allData), // Javított URL
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000)),
        ]);

        console.log('Adatok sikeresen elküldve:', response.data);
        this.successMessage = 'Sikeres küldés!';
        setTimeout(() => location.reload(), 2000);
      } catch (error) {
        console.error('Hiba történt az adatok küldésekor:', error);
        if (error.message === 'Timeout') {
          this.errorMessage = 'A kérés időtúllépés miatt sikertelen!';
        } else if (error.response) {
          this.errorMessage = `Hiba történt: ${error.response.status} - ${error.response.statusText}`;
        } else {
          this.errorMessage = 'Sikertelen küldés!';
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style src="/src/assets/css/style_pages.css"></style>
<style>
.page {
  min-height: 400px; /* Set the desired minimum height */
}
</style>
