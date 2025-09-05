<template>
  <div class="profile-edit container py-4">
    <div class="header d-flex align-items-center mb-3">
      <button class="btn btn-outline-primary btn-back me-3" @click="goHome" aria-label="Vissza az admin oldalra">
        ← Admin oldal
      </button>
      <div class="title">
        <h3 class="mb-0">Saját profil</h3>
        <small class="subtitle">Profilkép feltöltése — Széchényi hangulat</small>
      </div>
    </div>

    <div class="card p-4 profile-card mx-auto" style="max-width:520px;">
      <div class="text-center mb-4 avatar-wrap">
        <div class="avatar-frame">
          <img :src="preview || userAvatar || '/img/user.jpg'" alt="avatar" class="avatar-img" />
        </div>
      </div>

      <div class="mb-3">
        <input type="file" accept="image/*" @change="onFileChange" class="form-control" />
        <small class="form-text text-muted mt-2">Javasolt méret: négyzet (max 2MB). JPG/PNG</small>
      </div>

      <div class="d-flex gap-2 justify-content-end">
        <button class="btn btn-secondary" @click="cancel" :disabled="loading">Mégse</button>
        <button class="btn btn-primary" :disabled="!file || loading" @click="upload">
          Mentés
          <span v-if="loading" class="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
        </button>
      </div>

      <div v-if="message" class="mt-3 alert" :class="messageType" role="status">{{ message }}</div>
    </div>
  </div>
</template>

<script>
import auth from '@/services/auth';

export default {
  name: 'ProfileEdit',
  data() {
    return {
      user: null,
      userAvatar: null,
      file: null,
      preview: null,
      loading: false,
      message: '',
      messageType: 'alert-success'
    };
  },
  async mounted() {
    // megtámogatjuk, ha ensureAuthUser wrapper-rel tér vissza
    const u = await auth.ensureAuthUser();
    let actual = u;
    if (u && u.user) actual = u.user;
    if (u && u.data && u.data.user) actual = u.data.user;

    this.user = actual || null;
    if (this.user) this.userAvatar = this.user.avatar_url || this.user.avatar || null;
  },
  methods: {
    goHome() {
      // vissza az admin főoldalra
      const adminPath = '/admin'; // szükség esetén módosítsd
      if (this.$router) this.$router.push(adminPath);
      else window.location.href = adminPath;
    },
    onFileChange(e) {
      const f = e.target.files && e.target.files[0];
      this.file = f || null;
      this.preview = this.file ? URL.createObjectURL(this.file) : null;
    },
    cancel() {
      this.file = null;
      if (this.preview) {
        URL.revokeObjectURL(this.preview);
      }
      this.preview = null;
      this.message = '';
    },
    async upload() {
      if (!this.file || !this.user) {
        this.message = 'Válassz képet feltöltéshez.';
        this.messageType = 'alert-warning';
        return;
      }
      this.loading = true;
      this.message = '';

      try {
        const form = new FormData();
        form.append('avatar', this.file);
        form.append('userId', String(this.user.id));

        // token megszerzése az auth szervizből (ha van)
        const token = (auth.getToken && auth.getToken()) || (auth._getStoredToken && auth._getStoredToken()) || null;
        const headers = token ? { Authorization: 'Bearer ' + token } : {};

        const res = await fetch('/api/users/avatar', {
          method: 'POST',
          body: form,
          headers
        });

        if (!res.ok) throw new Error('Upload failed: ' + res.status);
        const data = await res.json();

        // frissítjük a megjelenített avatart; próbáljuk több lehetséges mezőt
        this.userAvatar = data.avatar_url || data.avatar || this.userAvatar || null;

        // frissítjük a helyi auth_user és értesítjük a UI-t
        if (auth.refreshUser) {
          try { await auth.refreshUser(); } catch (e) { /* ignore */ }
        } else {
          // ha nincs refreshUser, próbáljuk frissíteni a storage-t és diszpécselni az eseményt
          try {
            const cached = localStorage.getItem('auth_user');
            if (cached) {
              const parsed = JSON.parse(cached);
              const pu = parsed.user ? parsed.user : parsed;
              pu.avatar_url = this.userAvatar;
              localStorage.setItem('auth_user', JSON.stringify(parsed.user ? { user: pu } : pu));
            }
          } catch (e) { /* ignore */ }
        }

        // értesítjük a többi komponens(ek)et
        window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { avatar_url: this.userAvatar } }));
        window.dispatchEvent(new CustomEvent('user-logged-in', { detail: (this.user || {}) }));

        this.message = 'Profilkép sikeresen frissítve.';
        this.messageType = 'alert-success';
      } catch (err) {
        console.error(err);
        this.message = 'Hiba történt a feltöltés során.';
        this.messageType = 'alert-danger';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.profile-edit { font-family: Georgia, "Times New Roman", serif; color: #153a5b; }
.header .btn-back {
  border-color: rgba(11,94,166,0.15);
  color: #0b5ea6;
  background: transparent;
}
.title .subtitle { color: #6b7785; font-size: 0.9rem; }

.profile-card {
  border: 1px solid rgba(11,94,166,0.08);
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(15,40,60,0.06);
  background: linear-gradient(180deg, rgba(255,255,255,0.98), #fbfdff);
}

.avatar-wrap { display:flex; justify-content:center; }
.avatar-frame {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  padding: 6px;
  background: linear-gradient(180deg, rgba(197,161,74,0.12), rgba(11,94,166,0.04));
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow: 0 6px 14px rgba(11,94,166,0.06);
}
.avatar-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255,255,255,0.6);
  background: #f6f8fb;
}

.btn-primary {
  background-color: #0b5ea6;
  border-color: #0b5ea6;
}
.btn-primary:hover { background-color: #094e87; border-color:#094e87; }

.alert { border-radius: 6px; }
</style>