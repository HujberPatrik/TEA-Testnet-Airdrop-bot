<template>
  <div class="sidebar pe-4 pb-3" :style="{ backgroundColor: isDarkMode ? '#1c1c1c' : '#242943', color: isDarkMode ? '#ffffff' : '#ffffff' }">
    <nav class="navbar navbar-light" style="background-color: rgb(36, 41, 67);">
      <!-- Széchenyi Egyetem logó -->
      <div class="navbar-brand d-none d-md-flex align-items-center mx-4 mb-3">
        <img src="/images/sze_logo.png" alt="SZE Rendezvény" class="logo-image">
      </div>
      
      <div class="d-flex d-md-none" style="height: 95px; margin-top: 15px;"></div>
      <div class="d-flex align-items-center ms-4 mb-4"></div>
      <div class="navbar-nav w-100" style="flex-wrap: nowrap; overflow-x: auto; white-space: nowrap; position: relative;">
        <a href="#" @click.prevent="navigateTo('/admin')" class="nav-item nav-link" :class="{ active: isActivePath('/admin') }">
          <i class="fa fa-tachometer-alt me-2"></i>Főoldal
        </a>
        <a href="#" @click.prevent="navigateTo('/admin/archived')" class="nav-item nav-link" :class="{ active: isActivePath('/admin/archived') }">
          <i class="fa fa-archive me-2"></i>Archivált
        </a>
        <a href="#" @click.prevent="navigateToRoot" class="nav-item nav-link">
          <i class="fa fa-home me-2"></i>Űrlap
        </a>
        <a href="signin.html" class="nav-item nav-link"><i class="fa fa-chart-bar me-2"></i>Teszt </a>
        <router-link to="/price-list" class="nav-item nav-link">
          <i class="fa fa-table me-2"></i>Árak
        </router-link>
        <div class="nav-item dropdown">
          <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown"><i class="far fa-file-alt me-2"></i>Egyéb</a>
          <div class="dropdown-menu bg-transparent border-0">
            <a href="" class="dropdown-item" style="color: #50adc9;">oldal</a>
            <a href="" class="dropdown-item" style="color: #50adc9;">oldal</a>
            <a href="" class="dropdown-item" style="color: #50adc9;">oldal</a>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  props: {
    isDarkMode: Boolean
  },
  methods: {
    navigateTo(path) {
      this.$router.push(path);
    },
    isActivePath(path) {
      return this.$route && this.$route.path === path;
    },
    navigateToRoot() {
      // A böngésző ablakot irányítja át a localhost gyökeréhez
      window.location.href = "http://localhost:5173/";
    }
  }
};
</script>

<style scoped>
/* Logo stílus */
.navbar-brand {
  display: flex;
  align-items: center;
  min-height: 70px;
  justify-content: center;
  width: 100%;
}

.logo-image {
  max-height: 65px; /* Növeltem a magasságot 50-ről 65-re */
  width: auto;
  object-fit: contain;
}

/* Aktív menüpont kiemelése */
.nav-item.active, .nav-link.active {
  color: #50adc9 !important;
  font-weight: bold;
}

/* Hover effektus a menüpontokra */
.nav-item:hover {
  background-color: rgba(80, 173, 201, 0.1);
  border-radius: 5px;
}
</style>