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
        // Összes adat begyűjtése a localStorage-ból
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          allData[key] = localStorage.getItem(key);
        }

        // Adatok küldése a backendnek
        const response = await Promise.race([
          axios.post('http://localhost:3000', allData),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000)),
        ]);

        console.log('Adatok sikeresen elküldve:', response.data);
        this.successMessage = 'Sikeres küldés!';
        setTimeout(() => location.reload(), 2000);
      } catch (error) {
        console.error('Hiba történt az adatok küldésekor:', error);
        this.errorMessage = 'Sikertelen küldés!';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style>
.page {
  min-height: 400px; /* Set the desired minimum height */
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #000;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 100px auto; /* Increased margin */
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.success-message,
.error-message {
  text-align: center;
  font-size: 1.5rem;
  margin-top: 100px; /* Increased margin */
}

.success-message {
  color: green;
}

.error-message {
  color: red;
}

.link-container {
  text-align: center;
  margin-top: 20px;
}

.link-container a {
  text-decoration: none;
  color: #007bff;
  font-size: 1.2rem;
}

.link-container a:hover {
  text-decoration: underline;
}
.verification-btn {
  background-color: #50adc9;
  color: white;
  border: none;
}
</style>
<style src="/src/assets/css/style_pages.css"></style>
