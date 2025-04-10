<template>
  <div id="app">
    <Navbar /> <!-- Navbar komponens -->

    <!-- komponens váltás -->
    <component
      :is="currentPage"
      :ref="'page' + activePage"
      @email-verified="updateEmailVerificationStatus"
      @verification-success="onVerificationSuccess"
      @go-to-page="navigate" 
    />

    <!-- Navigáció és kitöltési csík -->
    <div
      v-if="currentPage !== 'ControlPage'"
      class="navigation-container bg-light fixed-bottom p-3"
    >
      <button
        v-if="activePage !== 1 && activePage !== 12"
        @click="navigate(activePage - 1)"
        class="nav-button btn btn-primary"
      >
        <i class="bi bi-arrow-left"></i>
      </button>

      <!-- Kitöltési csík -->
      <div class="progress-container">
        <progress :value="progress" max="100" class="custom-progress"></progress>
        <span>{{ progress }}%</span>
      </div>

      <!-- Jobbra gomb vagy Küldés gomb (utolsó oldalon) -->
      <button
        v-if="activePage !== totalPages && activePage !== 12"
        @click="validateAndNavigate"
        class="nav-button btn btn-primary"
      >
        <i class="bi bi-arrow-right"></i>
      </button>
      <button
        v-else
        @click="submitDataToBackend"
        :disabled="!isVerified"
        class="submit-button btn btn-primary"
      >
        Küldés
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Navbar from '../components/Navbar.vue';
import ControlPage from '../components/Pages/ControlPage.vue'; // ControlPage importálása
import Page1 from '../components/Pages/Page1.vue';
import Pages2 from '../components/Pages/Page2.vue';
import Pages3 from '../components/Pages/Page3.vue';
import Pages4 from '../components/Pages/Page4.vue';
import Pages5 from '../components/Pages/Page5.vue';
import Pages6 from '../components/Pages/Page6.vue';
import Pages7 from '../components/Pages/Page7.vue';
import Pages8 from '../components/Pages/Page8.vue';
import Pages9 from '../components/Pages/Page9.vue';
import Pages10 from '../components/Pages/Page10.vue';
import Pages11 from '../components/Pages/Page11.vue';
import Page12 from '../components/Pages/Page12.vue'; // Új oldal importálása

export default {
  components: {
    Navbar,
    ControlPage, // ControlPage komponens
    Page1,
    Pages2,
    Pages3,
    Pages4,
    Pages5,
    Pages6,
    Pages7,
    Pages8,
    Pages9,
    Pages10,
    Pages11,
    Page12,
  },
  data() {
    return {
      currentPage: 'ControlPage', // Az első oldal a ControlPage
      activePage: 0, // Kezdetben nem szükséges oldal
      totalPages: 11, // Összes oldal száma
      formData: null,
      isEmailVerified: false,
      isVerified: false,
    };
  },
  computed: {
    progress() {
      if (this.activePage <= 1) {
        return 0; // Starting progress
      }
      if (this.activePage > this.totalPages) {
        return 100; // Completed progress
      }
      const actualTotalPages = this.totalPages - 1; // Subtract 1 to exclude ControlPage
      return Math.round(((this.activePage - 1) / actualTotalPages) * 100); // ActivePage - 1 to adjust progress
    },
  },
  methods: {
    navigate(page) {
      this.saveCurrentPageData();

      if (page >= 0 && page <= this.totalPages) {
        if (page !== this.totalPages) {
          this.isEmailVerified = false;
        }

        this.activePage = page;
        this.currentPage = this.getPageName(page);
      }
    },
    validateAndNavigate() {
      const currentPageRef = this.$refs[`page${this.activePage}`];
      if (currentPageRef && currentPageRef.validatePage) {
        if (currentPageRef.validatePage()) {
          this.navigate(this.activePage + 1);
        } else {
          console.log('Minden kötelező mezőt ki kell tölteni!');
        }
      }
    },
    saveCurrentPageData() {
      const currentPageRef = this.$refs[`page${this.activePage}`];
      if (currentPageRef && currentPageRef.saveDataToLocalStorage) {
        currentPageRef.saveDataToLocalStorage();
      }
    },
    getPageName(index) {
      const pages = [
        'ControlPage', // Az első oldal a ControlPage
        'Page1',
        'Pages2',
        'Pages3',
        'Pages4',
        'Pages5',
        'Pages6',
        'Pages7',
        'Pages8',
        'Pages9',
        'Pages10',
        'Pages11',
      ];
      return pages[index];
    },
    async submitDataToBackend() {
      try {
        const data = JSON.parse(localStorage.getItem('inputValues')) || {};
        console.log('Küldött adatok:', data); // Ellenőrizd az adatokat a konzolon
        const response = await axios.post('http://localhost:3000/api/kerveny', data);

        console.log('Sikeres mentés:', response.data);
        alert('Az összes oldal adatai sikeresen mentve az adatbázisba!');
        localStorage.removeItem('inputValues'); // Törlés a localStorage-ből sikeres mentés után
      } catch (error) {
        console.error('Hiba történt az API-kérés során:', error);
        alert('Nem sikerült menteni az adatokat. Próbálja újra később!');
      }
    },
    updateEmailVerificationStatus(status) {
      this.isEmailVerified = status;
    },
    onVerificationSuccess() {
      this.isVerified = true;
    },
  },
  mounted() {
    const savedData = localStorage.getItem('formData');
    console.log('LocalStorage-ból betöltött adatok:', savedData); 
    if (savedData) {
      this.formData = JSON.parse(savedData);
    }

    this.isEmailVerified = false;
  },
};
</script>

<style scoped>
/* Alap stílusok */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body,
html {
  height: 100%;
  font-family: Arial, sans-serif;
  background-color: #f1f3f5;
}

/* Navigációs konténer */
.navigation-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  width: 100%;
  padding: 10px;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1); 
  flex-wrap: nowrap;
}

/* Kitöltési csík */
.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px; 
  flex-grow: 1;
}

.custom-progress {
  width: 100%;
  height: 10px;
  border-radius: 5px;
  pointer-events: none; 
}

.custom-progress::-webkit-progress-bar {
  background-color: #ddd;
  border-radius: 5px;
}

.custom-progress::-webkit-progress-value {
  background-color: #50adc9;
  border-radius: 5px;
}

/* Gombok színezése */
.nav-button, .submit-button {
  background-color: #50adc9;
  border-color: #50adc9;
}

.submit-button:disabled {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}

/* Média lekérdezések kisebb képernyőkhöz */
@media (max-width: 768px) {
  .navigation-container {
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;
  }

  .progress-container {
    margin-top: 0;
  }

  .nav-button, .submit-button {
    width: auto;
    margin-top: 0;
  }
}

.dark-mode {
  background-color: #121212;
  color: #ffffff;
}

.dark-mode .navigation-container {
  background-color: #1e1e1e;
}

.dark-mode .custom-progress::-webkit-progress-bar {
  background-color: #333;
}

.dark-mode .bg-light {
  background-color: #242943 !important;
}
</style>
