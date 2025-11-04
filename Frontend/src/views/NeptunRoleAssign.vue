<template>
  <div class="sze-page">
    <!-- HEADER: csak a nagy, középre igazított logó; vissza-gomb csak ikon formában bal oldalon -->
    <header class="sze-header">
      <img src="@/assets/sze_logo.png" alt="Széchényi Egyetem" class="sze-logo-image" />
      <router-link to="/admin" class="btn-back btn-icon" title="Vissza az admin oldalra" aria-label="Vissza">
        <i class="fa fa-arrow-left" aria-hidden="true"></i>
      </router-link>
    </header>

    <main class="container neptun-container">
      <div class="card search-card mb-4">
        <div class="card-body">
          <form class="row g-2 align-items-end" @submit.prevent="lookup">
            <div class="col-12 col-sm-6 col-md-4">
              <label class="form-label small mb-1">Neptun kód</label>
              <input v-model="qNeptun" class="form-control text-uppercase" maxlength="6" placeholder="Pl. ABC123" />
              <div v-if="errors.neptun" class="form-text text-danger">{{ errors.neptun }}</div>
            </div>

            <div class="col-12 col-sm-6 col-md-4">
              <label class="form-label small mb-1">Email</label>
              <input v-model="qEmail" type="email" class="form-control" placeholder="user@example.com" />
              <div v-if="errors.email" class="form-text text-danger">{{ errors.email }}</div>
            </div>

            <!-- Keresés gomb: mutassa a folyamatot szövegben is -->
            <div class="col-auto">
              <button
                type="submit"
                class="btn-search"
                :disabled="loadingLookup"
                :aria-busy="loadingLookup ? 'true' : 'false'"
                aria-live="polite"
              >
                <span class="search-icon" aria-hidden="true">
                  <i class="fa fa-search"></i>
                </span>
                <span class="search-label">{{ loadingLookup ? 'Keresés...' : 'Keresés' }}</span>
                <span v-if="loadingLookup" class="search-spinner" aria-hidden="true"></span>
              </button>
            </div>

            <div class="col-12">
              <small class="text-muted">Használj Neptun kódot vagy emailt a kereséshez. Ha nincs találat, létrehozhatsz új felhasználót.</small>
            </div>
          </form>
        </div>
      </div>

      <div v-if="flash" class="alert" :class="flashClass" role="alert">{{ flash }}</div>

      <div class="row g-3">
        <div class="col-12 col-lg-6">
          <div class="card h-100 user-card">
            <div class="card-header">
              <strong>{{ user ? 'Felhasználó szerkesztése' : 'Új felhasználó létrehozása' }}</strong>
            </div>

            <div class="card-body">
              <form @submit.prevent="createOrUpdate">
                <div class="mb-2">
                  <label class="form-label small">Teljes név</label>
                  <input v-model="form.full_name" class="form-control" />
                  <div v-if="errors.full_name" class="form-text text-danger">{{ errors.full_name }}</div>
                </div>

                <div class="mb-2">
                  <label class="form-label small">Email</label>
                  <input v-model="form.email" type="email" class="form-control" />
                  <div v-if="errors.email_create" class="form-text text-danger">{{ errors.email_create }}</div>
                </div>

                <div class="mb-2">
                  <label class="form-label small">Neptun kód</label>
                  <input v-model="form.neptun_code" class="form-control text-uppercase" maxlength="6" />
                  <div v-if="errors.neptun_create" class="form-text text-danger">{{ errors.neptun_create }}</div>
                </div>

                <div class="mb-2">
                  <label class="form-label small">Jelszó (opcionális)</label>
                  <input v-model="form.password" type="password" class="form-control" placeholder="Ha üres, nem hoz létre jelszót" />
                  <div v-if="errors.password" class="form-text text-danger">{{ errors.password }}</div>
                </div>

                <div class="d-flex gap-2">
                  <button class="btn btn-success" type="submit" :disabled="loadingCreate">
                    <span v-if="loadingCreate" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {{ loadingCreate ? 'Mentés...' : 'Mentés / Létrehoz' }}
                  </button>
                  <button v-if="user" class="btn btn-outline-secondary" type="button" @click="fillFormFromUser" :disabled="loadingCreate">Betöltés szerkesztéshez</button>
                  <button class="btn btn-outline-dark ms-auto" type="button" @click="clearAll" :disabled="loadingCreate || loadingLookup || loadingAssign">Töröl</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-6">
          <div class="card h-100 role-card">
            <div class="card-header"><strong>Szerepkör kiosztás</strong></div>
            <div class="card-body">
              <div class="mb-2">
                <label class="form-label small">Cél (Neptun vagy email)</label>
                <input class="form-control" :value="targetDisplay" disabled />
              </div>

              <div class="mb-2">
                <label class="form-label small">Szerepkör</label>
                <select v-model="role" class="form-select">
                  <option value="Admin">Admin</option>
                  <option value="Főadmin">Főadmin</option>
                  <option value="Uni-Famulus">Uni-Famulus</option>
                  <option value="Rendezvényszervező">Rendezvényszervező</option>
                </select>
              </div>

              <div class="mb-2">
                <label class="form-label small">Indok (opcionális)</label>
                <textarea v-model="reason" rows="3" class="form-control"></textarea>
              </div>

              <div class="d-flex gap-2">
                <button
                  type="button"
                  class="btn-search"
                  @click="assignRole"
                  :disabled="loadingAssign || !hasTarget"
                  :aria-busy="loadingAssign ? 'true' : 'false'"
                  aria-live="polite"
                >
                  <span class="search-icon" aria-hidden="true"><i class="fa fa-user-plus"></i></span>
                  <span class="search-label">{{ loadingAssign ? 'Kiosztás...' : 'Kioszt / Frissít' }}</span>
                  <span v-if="loadingAssign" class="search-spinner" aria-hidden="true"></span>
                </button>

                <button class="btn btn-outline-secondary" type="button" @click="useFormAsTarget" :disabled="!form.email && !form.neptun_code">Használja létrehozottat</button>
              </div>

              <small class="form-text text-muted mt-3">A kiosztás a /api/admin/assign-role végpontot hívja. Győződj meg róla, hogy admin tokennel vagy bejelentkezve.</small>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';

const qNeptun = ref('');
const qEmail = ref('');
const user = ref(null);

const form = reactive({
  email: '',
  full_name: '',
  neptun_code: '',
  password: ''
});

const role = ref('user');
const reason = ref('');
const loadingLookup = ref(false);
const loadingCreate = ref(false);
const loadingAssign = ref(false);
const flash = ref('');
const flashType = ref('info');

const errors = reactive({});

const authHeader = () => {
  const t = localStorage.getItem('authToken');
  return t ? { Authorization: 'Bearer ' + t } : {};
};

const setFlash = (text, type = 'info') => {
  flash.value = text;
  flashType.value = type;
  setTimeout(() => { if (flash.value === text) flash.value = ''; }, 6000);
};

const flashClass = computed(() => {
  return flashType.value === 'success' ? 'alert-success' : flashType.value === 'danger' ? 'alert-danger' : 'alert-info';
});

const validateNeptun = s => !!s && /^[A-Za-z0-9]{6}$/.test(s.trim());
const validateEmail = s => !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

const clearAll = () => {
  qNeptun.value = '';
  qEmail.value = '';
  user.value = null;
  form.email = '';
  form.full_name = '';
  form.neptun_code = '';
  form.password = '';
  role.value = 'user';
  reason.value = '';
  Object.keys(errors).forEach(k => delete errors[k]);
  flash.value = '';
};

const lookup = async () => {
  Object.keys(errors).forEach(k => delete errors[k]);
  flash.value = '';
  user.value = null;

  const nq = qNeptun.value.trim();
  const eq = qEmail.value.trim();

  if (!nq && !eq) { errors.neptun = 'Adj meg Neptun kódot vagy emailt'; return; }
  if (nq && !validateNeptun(nq)) { errors.neptun = 'Neptun 6 karakter'; return; }
  if (eq && !validateEmail(eq)) { errors.email = 'Érvénytelen email'; return; }

  loadingLookup.value = true;
  try {
    let url = '/api/users?';
    if (nq) url += 'neptun=' + encodeURIComponent(nq);
    else url += 'email=' + encodeURIComponent(eq);

    const res = await fetch(url, { headers: { 'Accept': 'application/json', ...authHeader() }});
    if (!res.ok) {
      const j = await res.json().catch(()=>({})); setFlash(j.error || 'Lekérdezési hiba', 'danger'); return;
    }
    const d = await res.json();
    if (!d) { setFlash('Nincs találat', 'info'); user.value = null; return; }
    user.value = d;
    form.email = d.email || '';
    form.full_name = d.full_name || d.name || '';
    form.neptun_code = d.neptun_code || '';
    role.value = d.role || 'user';
    setFlash('Felhasználó betöltve', 'success');
  } catch (e) {
    console.error(e);
    setFlash('Hálózati hiba', 'danger');
  } finally {
    loadingLookup.value = false;
  }
};

const createOrUpdate = async () => {
  Object.keys(errors).forEach(k => delete errors[k]);
  flash.value = '';

  if (!form.full_name || !form.full_name.trim()) { errors.full_name = 'Teljes név kötelező'; return; }
  if (!form.email || !validateEmail(form.email)) { errors.email_create = 'Érvényes email szükséges'; return; }
  if (!form.neptun_code || !validateNeptun(form.neptun_code)) { errors.neptun_create = 'Érvényes Neptun kód szükséges'; return; }
  if (form.password && form.password.length > 0 && form.password.length < 6) { errors.password = 'Jelszó legalább 6 karakter'; return; }

  loadingCreate.value = true;
  try {
    // build payload without forcing password=null; only include password when user provided one
    const payload = {
      email: form.email.trim(),
      full_name: form.full_name.trim(),
      neptun_code: form.neptun_code.trim().toUpperCase()
    };
    if (form.password && form.password.length > 0) {
      payload.password = form.password;
    }

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(payload)
    });
    const j = await res.json().catch(()=>({}));
    if (!res.ok) { setFlash(j.error || 'Létrehozási hiba', 'danger'); return; }
    // backend should return created/updated user
    user.value = j;
    form.email = j.email || form.email;
    form.full_name = j.full_name || form.full_name;
    form.neptun_code = j.neptun_code || form.neptun_code;
    setFlash('Felhasználó sikeresen létrehozva / frissítve', 'success');
  } catch (e) {
    console.error(e);
    setFlash('Hálózati hiba', 'danger');
  } finally {
    loadingCreate.value = false;
  }
};

const useFormAsTarget = () => {
  // noop - targetDisplay reads from form
};

const fillFormFromUser = () => {
  if (!user.value) return;
  form.email = user.value.email || '';
  form.full_name = user.value.full_name || user.value.name || '';
  form.neptun_code = user.value.neptun_code || '';
};

const hasTarget = computed(() => {
  return (form.neptun_code && validateNeptun(form.neptun_code)) || validateEmail(form.email) || (user.value && (user.value.neptun_code || user.value.email));
});

const targetDisplay = computed(() => {
  if (form.neptun_code) return form.neptun_code.toUpperCase();
  if (form.email) return form.email;
  if (user.value) return user.value.full_name || user.value.email || user.value.neptun_code || '-';
  return '-';
});

const assignRole = async () => {
  flash.value = '';
  if (!hasTarget.value) { setFlash('Adj meg célt (neptun vagy email)', 'danger'); return; }

  let targetNeptun = form.neptun_code ? form.neptun_code.trim().toUpperCase() : null;
  let targetEmail = form.email ? form.email.trim() : null;
  if (!targetNeptun && user.value && user.value.neptun_code) targetNeptun = user.value.neptun_code;
  if (!targetNeptun && !targetEmail && user.value && user.value.email) targetEmail = user.value.email;

  const payload = { neptun: targetNeptun, role: role.value, reason: reason.value || null, email: targetEmail };

  loadingAssign.value = true;
  try {
    const res = await fetch('/api/admin/assign-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(payload)
    });
    const j = await res.json().catch(()=>({}));
    if (!res.ok) { setFlash(j.error || 'Hiba a szerepkör kiosztásakor', 'danger'); return; }
    setFlash('Szerepkör sikeresen kiosztva', 'success');
    // frissítsük a felhasználót megjelenítéshez
    if (targetNeptun) { qNeptun.value = targetNeptun; await lookup(); }
    else if (targetEmail) { qEmail.value = targetEmail; await lookup(); }
  } catch (e) {
    console.error(e);
    setFlash('Hálózati hiba', 'danger');
  } finally {
    loadingAssign.value = false;
  }
};

onMounted(() => {
  // tiltjuk a body görgetést, amíg ezen az oldalon vagyunk
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
});

onBeforeUnmount(() => {
  // visszaállítjuk az eredeti viselkedést oldal elhagyásakor
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
});
</script>

<style scoped>
:root {
  --sze-navy: #0b3a66;
  --sze-gold: #ffd54f;
  --sze-accent: #50adc9;
  --sze-muted: #6b7280;
  --card-radius: 10px;
}

.sze-page {
  min-height: 100vh;
  background: linear-gradient(180deg, rgba(11,58,102,0.03) 0%, rgba(11,58,102,0.01) 100%);
  padding-bottom: 48px;
}

/* header */
.sze-header {
  position: sticky;
  top: 0;
  z-index: 2100;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center; /* logo középre */
  background-color: #0b3a66 !important; /* Széchényi kék, közvetlenül */
  padding: 8px 64px; /* hely a gombnak balra */
  box-shadow: 0 6px 18px rgba(11,58,102,0.08);
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

/* nagy, középre igazított logó */
.sze-logo-image {
  width: 320px;
  max-width: 60%;
  height: auto;
  display: block;
  object-fit: contain;
  user-select: none;
}

/* ikon-only vissza gomb: balra pozícionálva, nem zavarja a középre igazítást */
.btn-back.btn-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 6px;
  border-radius: 8px;
  background-color: rgba(255,255,255,0.08) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255,255,255,0.12) !important;
  box-shadow: 0 6px 18px rgba(11,58,102,0.12);
}

/* main container */
.neptun-container { max-width:1100px; margin: 20px auto; padding: 0 12px 40px; }

/* cards */
.card { border-radius: var(--card-radius); box-shadow: 0 6px 18px rgba(11,58,102,0.04); border: none; }
.card-header { background: linear-gradient(90deg, rgba(11,58,102,0.04), rgba(80,173,201,0.02)); font-weight:700; color: var(--sze-navy); border-bottom: 1px solid rgba(11,58,102,0.04); }

/* buttons and inputs theme */
.form-control:focus { box-shadow: 0 0 0 0.12rem rgba(80,173,201,0.18); border-color: var(--sze-accent); }
.btn-primary { background: var(--sze-navy); border-color: var(--sze-navy); }
.btn-primary:hover { background: #083254; border-color:#083254; }
.btn-success { background: #2e7d32; border-color: #2e7d32; }
.form-text.text-muted { color: var(--sze-muted); }

/* Direkt, változók nélkül: Széchényi kék felső sáv (felülír minden Bootstrap/inline beállítást) */
.sze-header {
  background-color: #0b3a66 !important;
  background-image: none !important;
  color: #ffffff !important;
  box-shadow: 0 6px 18px rgba(11,58,102,0.08);
}

/* biztosítjuk, hogy a címsor és a gombok szövege fehér legyen */
.sze-header .sze-title,
.sze-header .sze-title .main,
.sze-header .sze-title .sub,
.sze-header .btn-back,
.sze-header .btn-back * {
  color: #ffffff !important;
}

/* vissza gomb hangsúlyosabb, fehér szöveg, halvány fehér háttér */
.btn-back {
  background-color: rgba(255,255,255,0.08) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255,255,255,0.12) !important;
}

/* logó kép stílus — középre igazítva és responsive */
.sze-logo-image {
  width: 140px;
  height: auto;
  object-fit: contain;
  border-radius: 6px;
  background: transparent;
  box-shadow: 0 6px 18px rgba(11,58,102,0.08);
}

/* gomb szöveg stabilítás, hogy spinner mellett ne ugráljon */
.btn-text { line-height: 1; }

/* kisebb képernyőn csökkentett logó méret */
@media (max-width: 576px) {
  .sze-logo-image { width: 100px; }
}

/* responsive tweaks */
@media (max-width: 768px) {
  .sze-header { padding: 12px 14px; }
  .sze-logo { width:44px; height:44px; font-size:18px; }
  .neptun-container { padding: 0 8px; }
}

/* Szebb keresés gomb, spinnerrel és szöveges folyamat jelzéssel */
.btn-search {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: linear-gradient(90deg,#0b3a66 0%,#0e5078 100%);
  color: #fff;
  border: none;
  border-radius: 999px;
  box-shadow: 0 6px 18px rgba(11,58,102,0.18);
  font-weight: 600;
  cursor: pointer;
  transition: transform .08s ease, box-shadow .12s ease, opacity .12s;
  user-select: none;
}
.btn-search:active { transform: translateY(1px); }
.btn-search[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
}

/* icon balra */
.btn-search .search-icon { display:inline-flex; align-items:center; justify-content:center; width:20px; color:rgba(255,255,255,0.95); font-size:14px; }

/* label stabilan jelenik meg (spinner ne okozza ugrást) */
.btn-search .search-label { white-space:nowrap; }

/* kis kör alakú spinner (fehér) */
.search-spinner {
  width:16px;
  height:16px;
  border: 2px solid rgba(255,255,255,0.22);
  border-top-color: #ffffff;
  border-radius:50%;
  animation: btn-spin .8s linear infinite;
  margin-left: 4px;
  flex: 0 0 16px;
}

/* spinner animáció */
@keyframes btn-spin { to { transform: rotate(360deg); } }

/* mobilon kisebb gomb */
@media (max-width: 576px) {
  .btn-search { padding: 7px 10px; gap:8px; font-size:14px; }
  .sze-logo-image { width: 160px; }
}

/* --- ÚJ: minden gomb kerekítése --- */
.btn,
.btn-primary,
.btn-success,
.btn-outline-secondary,
.btn-outline-dark,
.btn-search,
.btn-back {
  border-radius: 999px !important;
}
</style>