<template>
  <div class="prices-page">
    <div class="header d-flex justify-content-between align-items-center">
      <h2 class="title">Árlista</h2>
      <div class="controls">
        <button class="btn btn-ghost" @click="fetchPrices" :disabled="isLoading" title="Frissítés">
          <i class="fas fa-sync-alt"></i>
        </button>
        <button class="btn btn-ghost" @click="showAddModal" title="Új ár">
          <i class="fas fa-plus me-1"></i> Hozzáadás
        </button>
        <button class="btn btn-ghost" @click="goDashboard" title="Vissza">
          <i class="fas fa-home"></i>
        </button>
      </div>
    </div>

    <div class="card price-card">
      <div class="table-wrap">
        <table class="price-table">
          <thead>
            <tr class="main-head">
              <th class="col-service" rowspan="2">Szolgáltatás</th>
              <th class="col-group left-group" colspan="2">Egyetemi</th>
              <th class="col-group right-group" colspan="2">Külső</th>
              <th class="col-actions" rowspan="2">Műveletek</th>
            </tr>
            <tr class="sub-head">
              <th class="sub-col">Normál</th>
              <th class="sub-col">Hétvége/Éjszaka</th>
              <th class="sub-col">Normál</th>
              <th class="sub-col">Hétvége/Éjszaka</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="isLoading">
              <td :colspan="6" class="empty-row">
                <div class="loading">
                  <div class="spinner-border" role="status" aria-hidden="true"></div>
                  <small>Betöltés…</small>
                </div>
              </td>
            </tr>

            <tr v-else-if="items.length === 0">
              <td :colspan="6" class="empty-row">
                <div class="muted">Nincs megjeleníthető adat</div>
              </td>
            </tr>

            <tr v-else v-for="item in items" :key="item.id">
              <td class="service-cell">
                <div class="service-title">{{ item.name }}</div>
                <div class="service-meta">{{ item.category }}</div>
              </td>

              <td class="price-cell">
                <div class="price-badge">{{ formatPrice(item.priceUniversity) }}</div>
                <div class="unit" v-if="item.unit">{{ unitSuffix(item.unit, false) }}</div>
              </td>

              <td class="price-cell">
                <div class="price-badge">{{ formatPrice(item.priceUniversityWeekend) }}</div>
                <div class="unit" v-if="item.unit">{{ unitSuffix(item.unit, false) }}</div>
              </td>

              <td class="price-cell">
                <div class="price-badge price-external">{{ formatPrice(item.priceExternal) }}</div>
                <div class="unit">{{ unitSuffix(item.unit, true) }}</div>
              </td>

              <td class="price-cell">
                <div class="price-badge price-external">{{ formatPrice(item.priceExternalWeekend) }}</div>
                <div class="unit">{{ unitSuffix(item.unit, true) }}</div>
              </td>

              <td class="actions-cell">
                <button class="icon-btn" @click="showEditModal(item)" title="Szerkeszt">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="icon-btn danger" :disabled="deleting === item.id" @click="confirmDelete(item)" title="Törlés">
                  <span v-if="deleting === item.id" class="spinner-sm"></span>
                  <i v-else class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card-footer">
        <div v-if="error" class="error-row">
          <strong>Hiba:</strong> {{ error }}
          <button class="btn btn-link" @click="fetchPrices">Próbáld újra</button>
        </div>
      </div>
    </div>


    <!-- Modal (unchanged) -->
    <div class="modal fade" tabindex="-1" ref="priceModal" id="priceModal" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingItem ? 'Ár szerkesztése' : 'Új ár hozzáadása' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <!-- form fields (kept same as before) -->
            <div class="row g-2">
              <div class="col-md-8">
                <label class="form-label">Megnevezés</label>
                <input v-model="currentItem.name" type="text" class="form-control" />
                <div v-if="formErrors.name" class="text-danger small mt-1">{{ formErrors.name }}</div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Kategória</label>
                <input v-model="currentItem.category" type="text" class="form-control" />
              </div>

              <div class="col-md-4">
                <label class="form-label">Mértékegység</label>
                <input v-model="currentItem.unit" type="text" class="form-control" />
              </div>

              <div class="col-md-4">
                <label class="form-label">Egyetemi ár (normál)</label>
                <input v-model.number="currentItem.priceUniversity" type="number" min="0" class="form-control" />
              </div>

              <div class="col-md-4">
                <label class="form-label">Egyetemi ár (hétvégén)</label>
                <input v-model.number="currentItem.priceUniversityWeekend" type="number" min="0" class="form-control" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Külső ár (normál)</label>
                <input v-model.number="currentItem.priceExternal" type="number" min="0" class="form-control" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Külső ár (hétvégén)</label>
                <input v-model.number="currentItem.priceExternalWeekend" type="number" min="0" class="form-control" />
              </div>

              <div class="col-12">
                <label class="form-label">Megjegyzés</label>
                <textarea v-model="currentItem.notes" class="form-control" rows="2"></textarea>
              </div>
            </div>

            <div v-if="modalError" class="alert alert-danger mt-2 small">{{ modalError }}</div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">Mégse</button>
            <button class="btn btn-primary" :disabled="saving" @click="saveItem">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Mentés
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- /Modal -->
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import { useRouter } from 'vue-router';

export default {
  name: 'PricesView',
  setup () {
    const router = useRouter();
    const items = ref([]);
    const isLoading = ref(false);
    const error = ref('');

    const priceModal = ref(null);
    let priceModalInstance = null;

    const editingItem = ref(null);
    const currentItem = ref({
      id: null,
      name: '',
      category: 'Általános',
      unit: '',
      priceUniversity: 0,
      priceUniversityWeekend: 0,
      priceExternal: 0,
      priceExternalWeekend: 0,
      notes: ''
    });
    const formErrors = ref({});
    const modalError = ref('');
    const saving = ref(false);
    const deleting = ref(null);

    const mapServerItem = (i) => ({
      id: i.id,
      name: i.megnevezes ?? i.name ?? '',
      unit: i.mertekegyseg ?? i.unit ?? '',
      priceUniversity: Number(i.ar_egyetem ?? i.priceUniversity ?? i.priceuniversity) || 0,
      priceUniversityWeekend: Number(i.ar_egyetem_hetvege ?? i.priceUniversityWeekend ?? i.priceuniversityweekend) || 0,
      priceExternal: Number(i.ar_kulso ?? i.priceExternal ?? i.priceexternal) || 0,
      priceExternalWeekend: Number(i.ar_kulso_hetvege ?? i.priceExternalWeekend ?? i.priceexternalweekend) || 0,
      notes: i.megjegyzes ?? i.notes ?? '',
      category: i.kategoria ?? i.category ?? 'Általános'
    });

    const fetchPrices = async () => {
      isLoading.value = true;
      error.value = '';
      try {
        const res = await fetch('/api/prices');
        const ct = res.headers.get('content-type') || '';
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`HTTP ${res.status} — ${txt.substring(0, 300)}`);
        }
        if (!ct.includes('application/json')) {
          const text = await res.text();
          throw new Error('A szerver nem JSON-t adott vissza. Válasz röviden: ' + text.substring(0, 300));
        }
        const data = await res.json();
        items.value = Array.isArray(data) ? data.map(mapServerItem) : [];
      } catch (err) {
        console.error('fetchPrices error:', err);
        error.value = err.message || String(err);
        items.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const showAddModal = () => {
      editingItem.value = null;
      formErrors.value = {};
      modalError.value = '';
      currentItem.value = {
        id: null,
        name: '',
        category: 'Általános',
        unit: '',
        priceUniversity: 0,
        priceUniversityWeekend: 0,
        priceExternal: 0,
        priceExternalWeekend: 0,
        notes: ''
      };
      priceModalInstance.show();
    };

    const showEditModal = (item) => {
      editingItem.value = item;
      formErrors.value = {};
      modalError.value = '';
      currentItem.value = {
        id: item.id,
        name: item.name,
        category: item.category ?? 'Általános',
        unit: item.unit,
        priceUniversity: item.priceUniversity,
        priceUniversityWeekend: item.priceUniversityWeekend,
        priceExternal: item.priceExternal,
        priceExternalWeekend: item.priceExternalWeekend,
        notes: item.notes || ''
      };
      priceModalInstance.show();
    };

    const validateForm = () => {
      formErrors.value = {};
      let ok = true;
      if (!currentItem.value.name || !currentItem.value.name.trim()) {
        formErrors.value.name = 'A megnevezés kötelező';
        ok = false;
      }
      const nums = ['priceUniversity','priceUniversityWeekend','priceExternal','priceExternalWeekend'];
      nums.forEach(k => {
        const v = currentItem.value[k];
        if (v === null || v === undefined || isNaN(v) || Number(v) < 0) {
          formErrors.value[k] = 'Érvényes, 0 vagy nagyobb szám kell';
          ok = false;
        }
      });
      return ok;
    };

    const saveItem = async () => {
      if (!validateForm()) return;
      saving.value = true;
      modalError.value = '';
      try {
        const payload = {
          megnevezes: currentItem.value.name,
          kategoria: currentItem.value.category,
          mertekegyseg: (currentItem.value.unit && currentItem.value.unit.toString().trim() !== '') ? currentItem.value.unit.toString().trim() : null,
          ar_egyetem: Number(currentItem.value.priceUniversity) || 0,
          ar_egyetem_hetvege: Number(currentItem.value.priceUniversityWeekend) || 0,
          ar_kulso: Number(currentItem.value.priceExternal) || 0,
          ar_kulso_hetvege: Number(currentItem.value.priceExternalWeekend) || 0,
          megjegyzes: currentItem.value.notes || ''
        };

        let res;
        if (editingItem.value && editingItem.value.id) {
          res = await fetch(`/api/prices/${editingItem.value.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          res = await fetch('/api/prices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Szerverhiba ${res.status} — ${txt.substring(0,300)}`);
        }

        await fetchPrices();
        priceModalInstance.hide();
      } catch (err) {
        console.error('saveItem error:', err);
        modalError.value = err.message || String(err);
      } finally {
        saving.value = false;
      }
    };

    const closeModal = () => {
      priceModalInstance.hide();
    };

    const formatPrice = (v) => {
      if (v === null || v === undefined) return '-';
      return Number(v).toLocaleString('hu-HU') + ' Ft';
    };

    const unitSuffix = (unit, external = false) => {
      if (!unit) return external ? '+Áfa' : '';
      return external ? ('+Áfa / ' + unit) : ('/ ' + unit);
    };

    const goDashboard = () => {
      router.push('/admin');
    };

    const confirmDelete = async (item) => {
      const ok = window.confirm(`Biztosan törlöd a következőt?\n\n${item.name}`);
      if (!ok) return;
      await deleteItem(item.id);
    };

    const deleteItem = async (id) => {
      deleting.value = id;
      try {
        const res = await fetch(`/api/prices/${id}`, { method: 'DELETE' });
        if (!res.ok && res.status !== 204) {
          const txt = await res.text();
          throw new Error(`Törlési hiba ${res.status} — ${txt.substring(0,300)}`);
        }
        await fetchPrices();
      } catch (err) {
        console.error('deleteItem error:', err);
        alert('Törlés sikertelen: ' + (err.message || err));
      } finally {
        deleting.value = null;
      }
    };

    onMounted(() => {
      priceModalInstance = new Modal(priceModal.value, { backdrop: 'static' });
      fetchPrices();
    });

    return {
      items, isLoading, error, fetchPrices, formatPrice, unitSuffix,
      priceModal, showAddModal, showEditModal, saveItem, closeModal,
      currentItem, formErrors, modalError, saving, editingItem,
      goDashboard, confirmDelete, deleting
    };
  }
};
</script>

<style scoped>
:root {
  --bg: #f6f9fb;
  --card: #ffffff;
  --muted: #6b7280;
  --accent: #2563eb;
  --accent-2: #1e40af;
  --danger: #ef4444;
  --glass: rgba(255,255,255,0.8);
}

/* page layout */
.prices-page {
  padding: 18px;
  background: var(--bg);
  min-height: calc(100vh - 40px);
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  color: #0f172a;
}

/* header */
.header {
  margin-bottom: 14px;
  align-items: center;
  position: relative;
  z-index: 60;
  background: transparent;
  padding: 6px 0;
}
.title {
  margin: 0;
  font-size: 28px; /* nagyobb árlista szöveg */
  font-weight: 800;
  color: #0b3a66;
}
.controls { display: flex; gap: 8px; align-items: center; }

/* buttons */
.btn {
  border: 0;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost {
  background: transparent;
  color: var(--accent-2);
  border: 1px solid rgba(30,64,175,0.08);
}
.btn-primary {
  background: linear-gradient(180deg,var(--accent),var(--accent-2));
  color: white;
  box-shadow: 0 6px 18px rgba(37,99,235,0.12);
}

/* floating add button (always visible) */
.fab-add {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 200;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg,var(--accent),var(--accent-2));
  color: #fff;
  box-shadow: 0 10px 30px rgba(16,40,90,0.18);
  cursor: pointer;
  font-size: 18px;
}

/* card */
.price-card {
  background: var(--card);
  border-radius: 12px;
  box-shadow: 0 6px 30px rgba(15,23,42,0.06);
  padding: 12px;
  overflow: hidden;
}

/* table wrapper for scroll */
.table-wrap {
  width: 100%;
  overflow: auto;
  border-radius: 10px;
}

/* table base */
.price-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 920px;
  font-size: 14px;
}

/* header rows sticky and opaque */
.price-table thead th {
  position: sticky;
  background-clip: padding-box;
  text-align: left;
  padding: 14px 16px;
  color: white;
  border: none;
}

/* main head: separate left/right groups visually */
.main-head th {
  top: 0;
  background: linear-gradient(180deg,#0f4ab1,#0f4ab1);
  font-weight: 700;
  font-size: 13px;
  text-align: center;
}

/* left group slightly darker */
.main-head th.left-group {
  background: linear-gradient(180deg,#1359c7,#0d47a1);
  /* divider on the right side */
  box-shadow: inset -2px 0 0 rgba(255,255,255,0.06);
}

/* right group slightly different tint */
.main-head th.right-group {
  background: linear-gradient(180deg,#0e62df,#0a4fb0);
  box-shadow: inset 2px 0 0 rgba(0,0,0,0.06);
}

.sub-head th {
  top: 48px;
  background: linear-gradient(180deg,#1663d6,#1450b0);
  font-weight: 700;
  font-size: 12px;
  color: #f8fafc;
  text-align: center;
}

/* add clear divider between the two groups in sub-head */
.sub-head th.sub-col:nth-child(3) {
  border-left: 2px solid rgba(255,255,255,0.12);
}

/* ensure rowspan cell covers both header rows */
th[rowspan="2"] {
  top: 0;
  height: calc(48px + 40px);
  vertical-align: middle;
  text-align: center;
}

/* body cells */
.price-table tbody td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(15,23,42,0.04);
  vertical-align: middle;
  background: transparent;
}

/* zebra and hover */
.price-table tbody tr:nth-child(odd) td {
  background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.6));
}
.price-table tbody tr:hover td {
  background: linear-gradient(90deg,#f8fafc,#eef6ff);
  transform: translateZ(0);
}

/* service column */
.col-service { width: 340px; max-width: 420px; }
.service-cell { display: flex; flex-direction: column; gap: 6px; }
.service-title { font-weight: 700; color: #0b3a66; font-size: 16px; }
.service-meta { font-size: 12px; color: var(--muted); }

/* price cell */
.price-cell { text-align: center; width: 170px; }
.price-badge {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 999px;
  background: linear-gradient(90deg,#ffffff,#f3f9ff);
  color: #0b3a66;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(9,30,66,0.06);
}
.price-external {
  background: linear-gradient(90deg,#fff7f7,#fff3f3);
  color: var(--danger);
}

/* unit text */
.unit { font-size: 12px; color: var(--muted); margin-top: 6px; }

/* action column */
.col-actions { width: 110px; text-align: center; }
.actions-cell { display:flex; gap:8px; justify-content:center; align-items:center; }
.icon-btn {
  width:36px; height:36px; border-radius:8px; display:inline-flex; align-items:center; justify-content:center;
  background: rgba(15,23,42,0.03); border: none; cursor: pointer; color: #0b3a66;
}
.icon-btn.danger { background: linear-gradient(180deg,#fff5f5,#fff2f2); color: var(--danger); }

/* small spinner for delete */
.spinner-sm {
  width:18px; height:18px; border:2px solid rgba(0,0,0,0.08); border-top-color: rgba(0,0,0,0.3);
  border-radius:50%; display:inline-block; animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* empty / loading rows */
.empty-row { text-align:center; padding: 40px 10px; color: var(--muted); }
.loading { display:flex; flex-direction:column; gap:8px; align-items:center; }

/* footer */
.card-footer { padding-top: 10px; display:flex; justify-content:flex-end; }
.error-row { color: var(--danger); font-size: 13px; display:flex; gap:12px; align-items:center; }

/* responsive */
@media (max-width: 900px) {
  .price-table { min-width: 800px; }
  .col-service { width: 260px; }
  .price-cell { width: 140px; }
  .fab-add { right: 14px; bottom: 14px; width:48px; height:48px; }
}
</style>