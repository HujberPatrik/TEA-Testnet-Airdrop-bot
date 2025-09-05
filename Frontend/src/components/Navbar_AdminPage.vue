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

      <div class="nav-item dropdown position-relative" ref="profileRoot">
        <!-- ref és @click.prevent hozzáadva, aria attribútum kezelve -->
        <a href="#" ref="dropdownToggle" class="nav-link dropdown-toggle" role="button"
           aria-expanded="false" @click.prevent="onToggleClick">
          <img class="rounded-circle me-lg-2" src="../img/user.jpg" alt="" style="width: 40px; height: 40px;">
          <span class="d-none d-lg-inline-flex" :style="{ color: isDarkMode ? '#ffffff' : '#50adc9' }">{{ userName }}</span>
          <span class="d-none d-lg-inline-flex ms-1 text-muted" style="font-size: 0.8rem;">({{ userRole }})</span>
        </a>

        <div class="dropdown-menu dropdown-menu-end bg-light border-0 rounded-0 rounded-bottom m-0 position-absolute profile-dropdown"
             ref="dropdownMenu">
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

          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item text-warning" @click.prevent="clearStoredToken">
            <i class="fa fa-trash-alt me-2"></i> Token törlése
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
import { Dropdown } from 'bootstrap';
import auth from '../services/auth';

export default {
  props: {
    isDarkMode: Boolean
  },
  data() {
    return {
      userName: 'Vendég',
      userRole: null,
      dropdownInstance: null
    };
  },
  async mounted() {
    const user = await auth.ensureAuthUser();
    if (user) {
      this.userName = user.full_name || user.email || 'Vendég';
      this.userRole = user.role || null;
    } else {
      this.userName = 'Vendég';
      this.userRole = null;
    }
    // init Bootstrap Dropdown a ref alapján
    if (this.$refs.dropdownToggle) {
      this.dropdownInstance = new Dropdown(this.$refs.dropdownToggle, { popperConfig: { modifiers: [{ name: 'offset', options: { offset: [0, 6] } }] } });
    }
    // kattintás a body-n bezáráshoz, ha nyitva van
    document.addEventListener('click', this.onDocumentClick);
  },
  beforeUnmount() {
    if (this.dropdownInstance && typeof this.dropdownInstance.dispose === 'function') {
      this.dropdownInstance.dispose();
      this.dropdownInstance = null;
    }
    document.removeEventListener('click', this.onDocumentClick);
  },
  methods: {
    onToggleClick() {
      if (!this.dropdownInstance) return;
      this.dropdownInstance.toggle();
    },

    onDocumentClick(e) {
      // ha a kattintás nem a dropdown root vagy gyereke, zárjuk
      const root = this.$refs.profileRoot;
      if (!root) return;
      if (!root.contains(e.target)) {
        if (this.dropdownInstance && this.dropdownInstance._element && this.$refs.dropdownMenu?.classList.contains('show')) {
          this.dropdownInstance.hide();
        }
      }
    },

    showNotifications() {
      alert('Értesítések funkció hamarosan elérhető!');
    },

    navigateToProfile() {
      alert('Saját profil oldal hamarosan elérhető!');
    },

    navigateToSettings() {
      alert('Beállítások oldal hamarosan elérhető!');
    },

    logout() {
      auth.logout();
      this.$router.push('/login');
    },

    clearStoredToken() {
      auth.logout();
      this.userName = 'Vendég';
      this.userRole = null;
      this.$emit('token-cleared');
    }
  }
};
</script>

<style scoped>
.navbar {
    position: relative;
    z-index: 1000;
}
</style>