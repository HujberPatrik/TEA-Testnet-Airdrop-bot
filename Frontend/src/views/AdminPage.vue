<template>
  <div class="app-layout" :class="{ 'dark-mode': isDarkMode }">
    <Sidebar :isDarkMode="isDarkMode" class="app-sidebar" />
    <div class="app-content">
      <Navbar_AdminPage :isDarkMode="isDarkMode" @toggle-dark-mode="toggleDarkMode" />
      <div class="page-inner">
        <Table :is-dark-mode="isDarkMode" />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue';
import Navbar_AdminPage from '../components/Navbar_AdminPage.vue';
import Table from '../components/Table.vue';
import auth from '../services/auth';

export default {
  name: 'AdminPage',
  components: { Sidebar, Navbar_AdminPage, Table },
  props: { token: { type: String, default: null } },
  data() {
    return {
      isDarkMode: localStorage.getItem('darkMode') === 'true' || false,
      userImage: null,
      userName: null,
      userRole: null
    };
  },
  mounted() {
    this.applyTheme();
    const token = this.token || localStorage.getItem('authToken');
    this.handleToken(token);
    if (this.$options.props && this.$options.props.token) {
      this.$watch('token', (newToken) => this.handleToken(newToken));
    }
    import('../assets/js/main.js');
  },
  methods: {
    handleToken(token) {
      if (!token) { this.$router.push('/login'); return; }
      try {
        const payload = auth._safeDecodeJWT ? auth._safeDecodeJWT(token) : null;
        const p = payload || (() => {
          try {
            const part = token.split('.')[1] || '';
            const b = part.replace(/-/g, '+').replace(/_/g, '/');
            const pad = b.length % 4;
            const padded = b + (pad ? '='.repeat(4 - pad) : '');
            return JSON.parse(atob(padded));
          } catch { return null; }
        })();
        if (!p) throw new Error('decode error');
        const first = p.first_name || '';
        const last = p.last_name || '';
        const built = (first || last) ? `${first}${first && last ? ' ' : ''}${last}` : null;
        const full = p.full_name || p.fullName || p.name || built || null;
        this.userName = full || p.email || 'Vendég';
        this.userRole = p.role || null;
        this.userImage = p.avatar || p.picture || null;
      } catch {
        this.$router.push('/login');
      }
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('darkMode', this.isDarkMode);
      this.applyTheme();
    },
    applyTheme() {
      document.body.classList.toggle('dark-mode', this.isDarkMode);
    }
  }
};
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  align-items: stretch; /* gyerekek nyújtása */
  width: 100%;
  background: #f5f7fa;
}
.dark-mode.app-layout { background:#1c1f27; }

.app-sidebar {
  width: 250px;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  display:flex;
  flex-direction:column;
}
.app-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 0;              /* Nullázás */
}
/* Kisebb alap belső padding, hogy ne tűnjön túl nagy hézagnak */
.page-inner {
  padding: 20px 28px 36px;
  flex: 1;
  max-width: 100%;
}
/* Táblázat/kártyák ne legyenek mesterségesen keskenyek */
.page-inner > .container,
.page-inner > .container-fluid,
.page-inner .table-container {
  max-width: 100% !important;
  width: 100% !important;
}
/* Status kártya sor (ha a Table-ben használod) teljes szélesség */
.page-inner .row,
.page-inner .card-group {
  margin-left: 0;
  margin-right: 0;
}
/* Dark mód alap */
.dark-mode .page-inner { background:#1c1f27; color:#f0f0f0; }
/* Scrollbar finom */
.page-inner::-webkit-scrollbar { width: 10px; }
.page-inner::-webkit-scrollbar-thumb { background:#c8ced6; border-radius:6px; }
.dark-mode .page-inner::-webkit-scrollbar-thumb { background:#2e3542; }
/* Responsive finomhangolás */
@media (max-width: 1100px) {
  .app-sidebar { width: 230px; }
  .page-inner { padding: 18px 22px 30px; }
}
@media (max-width: 820px) {
  .app-sidebar { width: 210px; }
  .page-inner { padding: 16px 16px 26px; }
}
</style>