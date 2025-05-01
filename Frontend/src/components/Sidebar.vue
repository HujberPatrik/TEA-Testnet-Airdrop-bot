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
        <a href="signin.html" class="nav-item nav-link"><i class="fa fa-chart-bar me-2"></i>Teszt </a>
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
</style>