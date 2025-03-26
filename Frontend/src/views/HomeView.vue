<template>
  <div id="app">
    <Navbar /> <!-- Navbar komponens -->

    <!-- komponens váltás -->
    <component
      :is="currentPage"
      :ref="'page' + activePage"
      @email-verified="updateEmailVerificationStatus"
    />

    <!-- Navigáció és kitöltési csík -->
    <div class="navigation-container bg-light fixed-bottom p-3">
      <button
        v-if="activePage !== 1"
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
        v-if="activePage !== totalPages"
        @click="validateAndNavigate"
        class="nav-button btn btn-primary"
      >
        <i class="bi bi-arrow-right"></i>
      </button>
      <button
        v-else
        @click="submit"
        :disabled="!isEmailVerified"
        class="submit-button btn btn-primary"
      >
        Küldés
      </button>
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue';
import Pages from '../components/Pages/Page.vue';
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

export default {
  components: {
    Navbar,
    Pages,
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
  },
  data() {
    return {
      currentPage: 'Pages', // Az első oldal alapértelmezett neve
      activePage: 1, // Az első oldal az aktív
      totalPages: 11, // Összes oldal száma
      formData: null,
      isEmailVerified: false, // E-mail hitelesítés állapota
    };
  },
  computed: {
    // Kitöltési százalék számítása
    progress() {
      if (this.totalPages === 1) {
        return 100;
      }
      return Math.round(((this.activePage - 1) / (this.totalPages - 1)) * 100);
    },
  },
  methods: {
    // Navigáció
    navigate(page) {
      this.saveCurrentPageData();

      if (page >= 1 && page <= this.totalPages) {
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
        'Pages',
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
      return pages[index - 1];
    },
    submit() {
      if (this.isEmailVerified) {
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          allData[key] = localStorage.getItem(key);
        }
        localStorage.setItem('allData', JSON.stringify(allData)); // Az összes adatot mentjük egy kulcs alá
        this.$router.push('/test'); // Átirányítás a test oldalra
      } else {
        alert('Az e-mail cím hitelesítése szükséges a küldéshez!');
      }
    },
    updateEmailVerificationStatus(status) {
      this.isEmailVerified = status;
    },
  },
  mounted() {
    const savedData = localStorage.getItem('formData');
    console.log('LocalStorage-ból betöltött adatok:', savedData); // Ellenőrzés
    if (savedData) {
      this.formData = JSON.parse(savedData);
    }

    // Oldal újratöltésekor állítsuk vissza az isEmailVerified értékét
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
  flex-wrap: nowrap; /* Flexbox nowrap */
}

/* Kitöltési csík */
.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px; 
  flex-grow: 1; /* Flexbox grow */
}

.custom-progress {
  width: 100%; /* Full width */
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
  background-color: #50adc9; /* Gombok színe */
  border-color: #50adc9; /* Gombok szegélyének színe */
}

.submit-button:disabled {
  background-color: #ccc; /* Letiltott gomb színe */
  border-color: #ccc;
  cursor: not-allowed;
}

/* Média lekérdezések kisebb képernyőkhöz */
@media (max-width: 768px) {
  .navigation-container {
    flex-direction: row; /* Always row */
    align-items: center;
    flex-wrap: nowrap; /* Prevent wrapping */
  }

  .progress-container {
    margin-top: 0; /* No margin top */
  }

  .nav-button, .submit-button {
    width: auto; /* Auto width */
    margin-top: 0; /* No margin top */
  }
}

/* Kitöltési csík elrejtése nagyon kicsi kijelzőnél */
@media (max-width: 100px) {
  .progress-container {
    display: none;
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
  background-color: #242943 !important; /* Override bg-light in dark mode */
}
</style>