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
      <div v-else>
        <!-- Küldés gomb -->
        <button class="btn btn-primary" @click="sendAllLocalStorageData">Küldés</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      loading: false, // Alapértelmezés szerint nem tölt
      successMessage: '',
      errorMessage: '',
      errorCode: '', // Hibakód tárolása
      countdown: 10,
      countdownTimer: null,
    };
  },
};
</script>

<style src="/src/assets/css/style_pages.css"></style>
