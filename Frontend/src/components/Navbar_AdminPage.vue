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
      <div class="nav-item dropdown position-relative">
        <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">
          <img class="rounded-circle me-lg-2" src="../img/user.jpg" alt="" style="width: 40px; height: 40px;">
          <span class="d-none d-lg-inline-flex" :style="{ color: isDarkMode ? '#ffffff' : '#50adc9' }">{{ userName }}</span> 
          <span class="d-none d-lg-inline-flex ms-1 text-muted" style="font-size: 0.8rem;">({{ userRole }})</span>
        </a>
        <div class="dropdown-menu dropdown-menu-end bg-light border-0 rounded-0 rounded-bottom m-0 position-absolute profile-dropdown">
          <a href="#" class="dropdown-item d-block d-lg-none" id="notifications-text" :style="{ color: isDarkMode ? '#ffffff' : '#50adc9' }">
            {{ userName }} ({{ userRole }})
          </a>

          <a href="#" class="dropdown-item d-block d-lg-none" id="dark-mode-text" @click="$emit('toggle-dark-mode')">
            <i :class="isDarkMode ? 'fa fa-sun me-2' : 'fa fa-moon me-2'"></i> Sötét mód
          </a>
          <a href="#" class="dropdown-item d-block d-lg-none" id="notifications-text" @click="showNotifications">
            <i class="fa fa-bell me-2"></i> Értesítések
          </a>

          <a href="#" class="dropdown-item" @click="navigateToProfile">
            <i class="fa fa-user me-2"></i> Saját profil
          </a>
          <a href="#" class="dropdown-item" @click="navigateToSettings">
            <i class="fa fa-cogs me-2"></i> Beállítások
          </a>

          <a href="#" class="dropdown-item text-danger" @click="logout">
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
  },
  data() {
    return {
      userName: '',
      userRole: ''
    };
  },
  created() {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(this.decodeBase64(token.split('.')[1]));
        this.userName = payload.name || 'Ismeretlen felhasználó';
        this.userRole = payload.role || 'Nincs szerepkör';
      } catch (error) {
        console.error('Hiba a token dekódolásakor:', error);
        this.userName = 'Ismeretlen felhasználó';
        this.userRole = 'Nincs szerepkör';
      }
    } else {
      this.userName = 'Ismeretlen felhasználó';
      this.userRole = 'Nincs szerepkör';
    }
  },
  methods: {
    decodeBase64(base64) {
      try {
        return decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      } catch (error) {
        console.error('Hiba az UTF-8 dekódolásakor:', error);
        return '';
      }
    },
    
    // Új metódusok a dropdown menü gombjaihoz
    showNotifications() {
      alert('Értesítések funkció hamarosan elérhető!');
    },
    
    navigateToProfile() {
      // Átirányítás a profil oldalra
      // Ha létezik a profil oldal, használd a következő sort:
      // this.$router.push('/profile');
      alert('Saját profil oldal hamarosan elérhető!');
    },
    
    navigateToSettings() {
      // Átirányítás a beállítások oldalra
      // Ha létezik a beállítások oldal, használd a következő sort:
      // this.$router.push('/settings');
      alert('Beállítások oldal hamarosan elérhető!');
    },
    
    logout() {
      // Token törlése a localStorage-ból
      localStorage.removeItem('authToken');
      // Átirányítás a bejelentkező oldalra
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.navbar {
    position: relative;
    z-index: 1000; /* Alacsonyabb érték */
}
</style>