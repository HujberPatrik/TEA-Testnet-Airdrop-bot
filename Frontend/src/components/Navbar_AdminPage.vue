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
          <img class="rounded-circle me-lg-2" :src="avatarSrc" alt="" style="width: 40px; height: 40px;">
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
import defaultAvatar from '@/assets/img/user.jpg';

export default {
  props: { isDarkMode: Boolean },
  data() {
    return {
      userName: 'Vendég',
      userRole: null,
      dropdownInstance: null,
      userAvatar: null
    };
  },
  computed: {
    avatarSrc() {
      // Forrás sorrend: state -> localStorage.avatar_url -> localStorage.user.avatar_url
      const storedDirect = localStorage.getItem('avatar_url');
      let storedFromUser = null;
      try {
        storedFromUser = JSON.parse(localStorage.getItem('user') || 'null')?.avatar_url || null;
      } catch {}
      const candidate = this.userAvatar || storedDirect || storedFromUser || null;
      const absolute = this.normalizeAvatar(candidate);
      return absolute || defaultAvatar;
    }
  },
  async mounted() {
    const user = await auth.ensureAuthUser();
    if (user) {
      this.userName = user.full_name || user.email || 'Vendég';
      this.userRole = user.role || null;
      // avatar beállítás és perzisztálás – userből elsődlegesen
      const uAvatar = user.avatar_url || (user.profile && user.profile.avatar_url) || null;
      this.setUserAvatar(uAvatar || localStorage.getItem('avatar_url') || null);
      // Ha most még nincs avatar az ensureAuthUser válaszban, megpróbáljuk újratölteni kicsit később
      if (!uAvatar) {
        setTimeout(() => this.refreshUserAvatar(), 300);
      }
    } else {
      // fallback: ha nincs user, de volt eltárolt avatar, használjuk
      const stored = localStorage.getItem('avatar_url');
      if (stored) this.userAvatar = stored;
    }

    window.addEventListener('avatar-updated', this.onAvatarUpdated);
    window.addEventListener('storage', this.onStorage);

    if (this.$refs.dropdownToggle) {
      this.dropdownInstance = new Dropdown(this.$refs.dropdownToggle, { popperConfig: { modifiers: [{ name: 'offset', options: { offset: [0, 6] } }] } });
    }
    document.addEventListener('click', this.onDocumentClick);
  },
  beforeUnmount() {
    window.removeEventListener('avatar-updated', this.onAvatarUpdated);
    window.removeEventListener('storage', this.onStorage);
    if (this.dropdownInstance?.dispose) this.dropdownInstance.dispose();
    document.removeEventListener('click', this.onDocumentClick);
  },
  methods: {
    onToggleClick() { if (this.dropdownInstance) this.dropdownInstance.toggle(); },
    onDocumentClick(e) {
      const root = this.$refs.profileRoot;
      if (!root) return;
      if (!root.contains(e.target)) {
        if (this.$refs.dropdownMenu?.classList.contains('show')) this.dropdownInstance?.hide();
      }
    },
    showNotifications() { alert('Értesítések funkció hamarosan elérhető!'); },
    navigateToProfile() { this.$router.push('/profile'); },
    navigateToSettings() { alert('Beállítások oldal hamarosan elérhető!'); },

    logout() {
      auth.logout();
      this.userName = 'Vendég';
      this.userRole = null;
      this.setUserAvatar(null);  // törlés localStorage-ból is
      this.$emit('token-cleared');
      this.dropdownInstance?.hide?.();
      this.$router.push('/login');
    },

    // Relatív/abszolút avatar URL normalizálás
    normalizeAvatar(url) {
      if (!url) return null;
      const u = String(url);
      if (/^https?:\/\//i.test(u)) return u;
      if (u.startsWith('/')) return u;
      const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      return `${base}/${u.replace(/^\/+/, '')}`;
    },

    setUserAvatar(url) {
      const normalized = url || null;
      if (normalized) {
        localStorage.setItem('avatar_url', normalized);
        this.userAvatar = normalized;
      } else {
        localStorage.removeItem('avatar_url');
        this.userAvatar = null;
      }
    },

    // ÚJ: avatar frissítése biztos forrásból (ensureAuthUser)
    async refreshUserAvatar() {
      try {
        const user = await auth.ensureAuthUser();
        const next = user?.avatar_url || user?.profile?.avatar_url || null;
        if (next) this.setUserAvatar(next);
      } catch {}
    },

    onAvatarUpdated(e) {
      const next = e?.detail?.avatar_url || null;
      this.setUserAvatar(next);
      // cache-elt user frissítése
      try {
        const u = JSON.parse(localStorage.getItem('user') || 'null');
        if (u) {
          u.avatar_url = next;
          localStorage.setItem('user', JSON.stringify(u));
        }
      } catch {}
    },

    onStorage(e) {
      // mind a külön avatar_url kulcsot, mind a user objektumot figyeljük
      if (e?.key === 'avatar_url') {
        this.userAvatar = e.newValue || null;
      }
      if (e?.key === 'user') {
        try {
          const u = JSON.parse(e.newValue || 'null');
          const next = u?.avatar_url || null;
          if (next) this.userAvatar = next;
        } catch {}
      }
    }
  }
};
</script>