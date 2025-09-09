<template>
  <div :class="['container-fluid position-relative d-flex p-0', { 'bg-dark text-white': isDarkMode, 'bg-white': !isDarkMode }]">
    <!-- Sidebar Start -->
    <Sidebar :isDarkMode="isDarkMode" />
    <!-- Sidebar End -->

    <!-- Content Start -->
    <div class="content">
      <!-- Navbar Start -->
      <Navbar_AdminPage :isDarkMode="isDarkMode" @toggle-dark-mode="toggleDarkMode" />
      <!-- Navbar End -->

      <!-- Státusz szűrő gombok -->
      <Table 
        :is-dark-mode="isDarkMode"
      />
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue';
import Navbar_AdminPage from '../components/Navbar_AdminPage.vue';
import Table from '../components/Table.vue';
import auth from '../services/auth'; // token feldolgozásához

export default {
  name: 'AdminPage',
  components: {
    Sidebar,
    Navbar_AdminPage,
    Table
  },
  props: {
    token: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      isDarkMode: localStorage.getItem('darkMode') === 'true' || false,
      userImage: null,
      userName: null
    };
  },
  mounted() {
    this.applyTheme();

    // Token kezelés: először a prop, ha nincs akkor localStorage
    const token = this.token || localStorage.getItem('authToken');
    this.handleToken(token);

    // figyeljük a prop változását (ha a szülő új token-t ad)
    if (this.$options.props && this.$options.props.token) {
      this.$watch('token', (newToken) => {
        this.handleToken(newToken);
      });
    }

    // Dynamically import the external JavaScript file
    import('../assets/js/main.js').then(() => {
      console.log('main.js loaded');
    });

  },
  methods: {
    handleToken(token) {
      if (!token) {
        this.$router.push('/login');
        return;
      }
      try {
        const payload = auth._safeDecodeJWT ? auth._safeDecodeJWT(token) : null;
        const p = payload || (function(t) {
          try {
            const part = t.split('.')[1] || '';
            const b = part.replace(/-/g, '+').replace(/_/g, '/');
            const pad = b.length % 4;
            const padded = b + (pad ? '='.repeat(4 - pad) : '');
            return JSON.parse(atob(padded));
          } catch { return null; }
        })(token);

        if (!p) throw new Error('Nem dekódolható token');

        // A név a backend/DB mezőjéből: full_name legyen elsődleges
        const first = p.first_name || p.given_name || '';
        const last = p.last_name || p.family_name || '';
        const built = (first || last) ? (first + (first && last ? ' ' : '') + last) : null;
        // preferáljuk a full_name mezőt (adatbázisból), majd fullName/name, végül az összerakott értéket
        const full = p.full_name || p.fullName || p.name || built || null;
        this.userName = full || p.email || 'Vendég';
         this.userRole = p.role || null;
         this.userImage = p.avatar || p.picture || null;
         console.log('Felhasználói adatok (AdminPage):', { name: this.userName, role: this.userRole });
      } catch (err) {
        console.error('Hiba a token feldolgozásakor:', err);
        this.$router.push('/login');
      }
    },

    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('darkMode', this.isDarkMode);
      this.applyTheme();
    },
    applyTheme() {
      if (this.isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  }
};
</script>

<style scoped>
:root{
  --dark-bg-primary: #1c1c1c;
  --dark-bg-secondary: #242424;
  --dark-text-primary: #f0f0f0;
  --dark-text-secondary: #cccccc;
  --dark-border: rgba(255,255,255,0.08);
  --dark-accent: #50adc9;
}

/* alap layout */
.container-fluid { width:100%; }
.content { flex:1; min-height:100vh; }

/* header */
.header { margin-bottom:14px; padding:6px 0; display:flex; justify-content:space-between; align-items:center; }
.title { margin:0; font-size:28px; font-weight:800; color:#0b3a66; }
.controls { display:flex; gap:8px; align-items:center; }

/* egyszerű gomb-stílusok */
.btn { border:0; padding:8px 10px; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; font-weight:600; }
.btn:disabled { opacity:.6; cursor:not-allowed; }

/* dark mode egyszerűsítve: csak a legfontosabb változtatások */
.dark-mode {
  background-color: var(--dark-bg-primary);
  color: var(--dark-text-primary);
}
.dark-mode .card,
.dark-mode .navbar,
.dark-mode .sidebar {
  background-color: var(--dark-bg-secondary);
  color: var(--dark-text-primary);
  border-color: var(--dark-border);
}

/* táblázatok és űrlapok - alaphelyzetben öröklik a színeket */
.dark-mode table, .dark-mode .form-control { color:var(--dark-text-primary); }

/* scrollbar finomítás (opcionális) */
.dark-mode ::-webkit-scrollbar { width:8px; height:8px; }
.dark-mode ::-webkit-scrollbar-thumb { background:var(--dark-border); border-radius:4px; }

/* responsive egyszerűsítve */
@media (max-width:900px){
  .title { font-size:20px; }
  .controls { gap:6px; }
}
</style>