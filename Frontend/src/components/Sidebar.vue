<template>
  <div class="sidebar pe-4 pb-3" :class="{ dark: isDarkMode }">
    <nav class="navbar navbar-light">
      <div class="navbar-brand d-none d-md-flex align-items-center mx-4 mb-3">
        <img src="/images/sze_logo.png" alt="SZE Rendezvény" class="logo-image">
      </div>

      <div class="navbar-nav w-100 nav-list">
        <a href="#" @click.prevent="navigateTo('/admin')" class="nav-item nav-link" :class="{ active: isActivePath('/admin') }">
          <i class="fa fa-tachometer-alt me-2"></i>Főoldal
        </a>
        <a href="#" @click.prevent="navigateTo('/admin/archived')" class="nav-item nav-link"
           :class="{ active: isActivePath('/admin/archived') }" v-if="!isUfRole">
          <i class="fa fa-archive me-2"></i>Archivált
        </a>
        <a href="signin.html" class="nav-item nav-link"><i class="fa fa-chart-bar me-2"></i>Teszt</a>
        <router-link to="/price-list" class="nav-item nav-link" v-if="!isUfRole">
          <i class="fa fa-table me-2"></i>Árak
        </router-link>
        <router-link to="/admin/users" class="nav-item nav-link" :class="{ active: isActivePath('/admin/users') }" v-if="!isUfRole">
          <i class="fa fa-users me-2"></i>Felhasználók
        </router-link>
        <div class="nav-item dropdown">
          <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">
            <i class="far fa-file-alt me-2"></i>Egyéb
          </a>
          <div class="dropdown-menu bg-transparent border-0">
            <a href="" class="dropdown-item" style="color:#50adc9;">oldal</a>
            <a href="" class="dropdown-item" style="color:#50adc9;">oldal</a>
            <a href="" class="dropdown-item" style="color:#50adc9;">oldal</a>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
import auth from '../services/auth';

export default {
  props:{ isDarkMode:Boolean },
  data(){ return { userRole:null }; },
  async mounted(){
    const user = await auth.ensureAuthUser();
    if (user){
      this.userRole = user.role || null;
    }
  },
  methods:{
    navigateTo(p){ this.$router.push(p); },
    isActivePath(p){ return this.$route && this.$route.path === p; }
  },
  computed:{
    isUfRole(){
      const r = String(this.userRole||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[_-]/g,' ').trim();
      return ['UF','UNI FAMULUS','UNIFAMULUS','RENDEZVENYSZERVEZO','RENDEZVENY SZERVEZO'].includes(r);
    }
  }
};
</script>

<style scoped>
.sidebar {
  position:relative;
  background:#242943;
  color:#fff;
  width:240px;
  height:auto;
  align-self:stretch;
  display:flex;
  flex-direction:column;
}
.sidebar.dark { background:#1c1c1c; }
.navbar { background:transparent; padding:0; flex:1; display:flex; flex-direction:column; }
.navbar-brand { display:flex; align-items:center; min-height:70px; justify-content:center; width:100%; }
.logo-image { max-height:65px; width:auto; object-fit:contain; }

.nav-list {
  display:flex;
  flex-direction:column;
  gap:.15rem;
  position:relative;
  overflow:hidden;
  padding:.25rem .25rem .6rem;
  flex:1;
  overflow-y:auto; /* ha sok menüpont lenne */
}
.nav-link {
  display:flex !important; align-items:center; gap:.55rem;
  line-height:1.15; white-space:normal !important; word-break:break-word;
  padding:.55rem .9rem; font-size:.9rem; border-radius:6px;
  background:transparent; border:none; color:#fff;
}
.nav-link i { width:1.25rem; text-align:center; flex-shrink:0; font-size:.95rem; }

.nav-link.active { background:rgba(80,173,201,.18); font-weight:600; }
.nav-link:hover { background:rgba(255,255,255,.07); }

.nav-item.dropdown .dropdown-menu { backdrop-filter: blur(6px); }
</style>