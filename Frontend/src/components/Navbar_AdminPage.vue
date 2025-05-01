<template>
  <nav class="navbar navbar-expand-lg navbar-light sticky-top px-4 py-0" 
       :class="{ 'navbar-dark bg-dark': isDarkMode, 'navbar-light bg-light': !isDarkMode }"
       style="z-index: 1100;">

    <div class="d-flex align-items-center flex-nowrap flex-grow-1">
      <a href="#" class="sidebar-toggler flex-shrink-0 me-3">
        <i class="fa fa-bars"></i>
      </a>

      <form class="d-flex flex-grow-1" style="max-width: 200px;">
        <input class="form-control border-0" type="search" placeholder="Keresés">
        <button class="btn button_navbar ms-2 rounded-circle" id="buttons_navbar" type="submit">
          <i class="fa fa-search" :style="{ color: isDarkMode ? '#ffffff' : '#242943' }"></i>
        </button>
      </form>
    </div>

    <div class="navbar-nav align-items-center ms-auto">
      <div class="nav-item d-none d-lg-flex">
        <button class="btn button_navbar ms-2 rounded-circle" id="dark-mode-toggle" @click="$emit('toggle-dark-mode')">
          <i :class="isDarkMode ? 'fa fa-sun' : 'fa fa-moon'" :style="{ color: isDarkMode ? '#ffffff' : '#242943' }"></i>
        </button>
      </div>

      <div class="nav-item dropdown d-none d-lg-flex">
        <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">
          <i class="fa fa-bell me-lg-2" :style="{ color: isDarkMode ? '#ffffff' : '#242943' }"></i>
          <span class="d-none d-lg-inline-flex">Értesítések</span>
        </a>
        <div class="dropdown-menu dropdown-menu-end bg-light border-0 rounded-0 rounded-bottom m-0">
          <a href="#" class="dropdown-item">
            <h6 class="fw-normal mb-0">Teszt</h6>
            <small>Teszt</small>
          </a>
        </div>
      </div>

      <div class="nav-item dropdown position-relative">
        <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">
          <img class="rounded-circle me-lg-2" src="../img/user.jpg" alt="" style="width: 40px; height: 40px;">
          <span class="d-none d-lg-inline-flex" :style="{ color: isDarkMode ? '#ffffff' : '#50adc9' }">Teszt Pista</span> 
          <span class="d-none d-lg-inline-flex ms-1 text-muted" style="font-size: 0.8rem;">(Admin)</span>
        </a>
        <div class="dropdown-menu dropdown-menu-end bg-light border-0 rounded-0 rounded-bottom m-0 position-absolute profile-dropdown">
          <a href="#" class="dropdown-item d-block d-lg-none" id="notifications-text" :style="{ color: isDarkMode ? '#ffffff' : '#50adc9' }">
            Teszt Pista (Admin)
          </a>

          <a href="#" class="dropdown-item d-block d-lg-none" id="dark-mode-text">
            <i :class="isDarkMode ? 'fa fa-sun me-2' : 'fa fa-moon me-2'"></i> Sötét mód
          </a>
          <a href="#" class="dropdown-item d-block d-lg-none" id="notifications-text">
            <i class="fa fa-bell me-2"></i> Értesítések
          </a>

          <a href="#" class="dropdown-item">
            <i class="fa fa-user me-2"></i> Saját profil
          </a>
          <a href="#" class="dropdown-item">
            <i class="fa fa-cogs me-2"></i> Beállítások
          </a>

          <a href="#" class="dropdown-item text-danger">
            <i class="fa fa-sign-out-alt me-2"></i> Kijelentkezés
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  props: {
    isDarkMode: Boolean
  }
};
</script>

<style scoped>
.navbar {
    position: relative;
    z-index: 1000; /* Alacsonyabb érték */
}
</style>