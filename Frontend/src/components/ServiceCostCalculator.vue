<template>
  <div>
    <div class="modal fade" id="serviceCostModal" tabindex="-1" ref="modal" aria-hidden="true">
      <!-- nagyobb modal: modal-xl -->
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content modal-content--overflow"> <!-- overflow-visible -->
          <div class="modal-header">
            <h5 class="modal-title">Költségkalkulátor — {{ event?.nev || 'Rendezvény' }}</h5>
            <button type="button" class="btn-close" @click="hide"></button>
          </div>

          <div class="modal-body">
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border" role="status"></div>
            </div>

            <div v-else>
              <div v-if="prices.length === 0" class="alert alert-warning">Nincsenek elérhető szolgáltatások.</div>

              <div class="mb-3">
                <button class="btn btn-sm btn-outline-primary" @click="addRow">
                  <i class="fas fa-plus me-1"></i> Szolgáltatás hozzáadása
                </button>
                <button class="btn btn-sm btn-outline-secondary ms-2" @click="clearState" title="Súgó: törli a mentett kalkulációt">
                  <i class="fas fa-trash-alt"></i> LocalStorage törlése
                </button>
              </div>

              <div v-for="(row, idx) in rows" :key="row.id" class="d-flex gap-2 align-items-center mb-2 row-with-trash">
                <select class="form-select form-select-sm service-select" style="min-width:260px;"
                        v-model="row.serviceId" @change="onServiceChange(row)">
                  <option :value="null">-- válassz szolgáltatást --</option>
                  <option v-for="p in prices" :key="p.id" :value="p.id">{{ p.name }} — {{ p.category }}</option>
                </select>

                <select class="form-select form-select-sm rate-select" v-model="row.rateKey">
                  <option value="priceUniversity">Egyetemi — Normál</option>
                  <option value="priceUniversityWeekend">Egyetemi — Hétvége/Éjszaka</option>
                  <option value="priceExternal">Külső — Normál</option>
                  <option value="priceExternalWeekend">Külső — Hétvége/Éjszaka</option>
                </select>

                <input type="number" min="0" step="0.25" class="form-control form-control-sm hours-input"
                       style="width:110px;" v-model="row.hours" placeholder="óra" title="Órák" />

                <!-- ÚJ: létszám -->
                <input type="number" min="0" step="1" class="form-control form-control-sm persons-input"
                       style="width:90px;" v-model="row.persons" placeholder="fő" title="Fő (létszám)" />

                <div style="min-width:140px; text-align:right;">
                  <div class="fw-bold">{{ formatMoney(getRowUnitPrice(row)) }}</div>
                  <div class="text-muted small" v-if="getRowUnitText(row)">{{ getRowUnitText(row) }}</div>
                </div>

                <div style="min-width:130px; text-align:right;">
                  <div class="fw-bold">{{ formatMoney(getRowTotal(row)) }}</div>
                </div>

                <!-- kuka gomb: kilógó stílus -->
                <button class="btn btn-sm btn-outline-danger trash-out" @click="removeRow(idx)" title="Töröl">
                  <i class="fas fa-trash"></i>
                </button>
              </div>

              <hr />

              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <small class="text-muted">Sorok: {{ rows.length }}</small>
                </div>
                <div class="text-end">
                  <div class="h5 mb-0">Összesen: {{ formatMoney(total) }}</div>
                </div>
              </div>

              <div v-if="error" class="alert alert-danger mt-2">{{ error }}</div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="hide">Mégse</button>
            <button class="btn btn-primary" :disabled="rows.length===0" @click="apply">
              Alkalmaz és vissza a rendezvényhez
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import { Modal } from 'bootstrap';

export default {
  name: 'ServiceCostCalculator',
  props: {
    event: { type: Object, default: null }
  },
  emits: ['calculated','status-updated','refresh-events'],
  setup(props, { emit }) {
    const TARGET_STATUS = 'UF_ARAJANLAT_ELFOGADASARA_VAR';
    const modal = ref(null);
    let modalInstance = null;
    const loading = ref(false);
    const error = ref('');
    const prices = ref([]);
    const rows = reactive([]);
    const saving = ref(false);

    const storageKey = (eventId) => `serviceCalc:${eventId ?? 'global'}`;

    const fetchPrices = async () => {
      loading.value = true;
      error.value = '';
      try {
        const res = await fetch('/api/prices/famulus');
        if (!res.ok) throw new Error('Árak betöltése sikertelen');
        const data = await res.json();
        prices.value = Array.isArray(data) ? data.map(p => ({
          id: p.id,
          name: p.megnevezes ?? p.name ?? '',
          category: p.kategoria ?? p.category ?? '',
          priceUniversity: Number(p.ar_egyetem ?? p.priceUniversity ?? 0) || 0,
          priceUniversityWeekend: Number(p.ar_egyetem_hetvege ?? p.priceUniversityWeekend ?? 0) || 0,
          priceExternal: Number(p.ar_kulso ?? p.priceExternal ?? 0) || 0,
          priceExternalWeekend: Number(p.ar_kulso_hetvege ?? p.priceExternalWeekend ?? 0) || 0,
          unit: p.mertekegyseg ?? p.unit ?? ''
        })) : [];
      } catch (e) {
        error.value = e.message || String(e);
      } finally {
        loading.value = false;
      }
    };

    const addRow = () => {
      rows.push({
        id: Date.now() + Math.random(),
        serviceId: null,
        rateKey: 'priceUniversity',
        hours: '',      // üres => placeholder látszik
        persons: ''     // üres => placeholder látszik
      });
    };

    const removeRow = (idx) => rows.splice(idx, 1);

    const findPriceById = (id) => prices.value.find(p => p.id === id) || null;

    const getRowUnitPrice = (row) => {
      const p = findPriceById(row.serviceId);
      if (!p) return 0;
      const base = Number(p[row.rateKey] ?? 0) || 0;
      // ha a választott tarifa külső (a táblázatban +Áfa), akkor hozzáadjuk a 27% ÁFÁ-t
      if (row.rateKey === 'priceExternal' || row.rateKey === 'priceExternalWeekend') {
        return Math.round(base * 1.27 * 100) / 100;
      }
      return base;
    };

    const getRowUnitText = (row) => {
      const p = findPriceById(row.serviceId);
      // Ha nincs szolgáltatás kiválasztva, nincs szöveg
      if (!p) return '';
      // Ha van mértékegység, a megszokott formátumot adjuk vissza
      if (p.unit) {
        if (row.rateKey === 'priceExternal' || row.rateKey === 'priceExternalWeekend') {
          return `+Áfa / ${p.unit}`;
        }
        return `/ ${p.unit}`;
      }
      // Ha nincs mértékegység, de külső tarifa van választva, mutassuk a "+Áfa" jelzést
      if (row.rateKey === 'priceExternal' || row.rateKey === 'priceExternalWeekend') {
        return '+Áfa';
      }
      return '';
    };

    const getRowTotal = (row) => {
      // Üres vagy nem szám -> 0
      const h = row.hours === '' ? 0 : (Number(row.hours) || 0);
      const pe = row.persons === '' ? 0 : (Number(row.persons) || 0);
      return getRowUnitPrice(row) * h * pe;
    };

    const total = computed(() => {
      return rows.reduce((s, r) => s + getRowTotal(r), 0);
    });

    const formatMoney = (v) => {
      return (Number(v) || 0).toLocaleString('hu-HU') + ' Ft';
    };

    // ----- persistence: per-event localStorage -----
    const saveState = (eventId) => {
      try {
        const key = storageKey(eventId);
        const payload = {
          rows: rows.map(r => ({
            id: r.id,
            serviceId: r.serviceId,
            rateKey: r.rateKey,
            hours: r.hours === '' ? null : r.hours,
            persons: r.persons === '' ? null : r.persons
          })),
          savedAt: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(payload));
      } catch (e) {
        console.error('saveState error', e);
      }
    };

    const loadState = (eventId) => {
      try {
        const key = storageKey(eventId);
        const raw = localStorage.getItem(key);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.rows)) return false;
        rows.splice(0, rows.length);
        parsed.rows.forEach(r => {
          rows.push({
            id: r.id ?? (Date.now() + Math.random()),
            serviceId: r.serviceId ?? null,
            rateKey: r.rateKey ?? 'priceUniversity',
            hours: (r.hours === null || r.hours === undefined) ? '' : r.hours,
            persons: (r.persons === null || r.persons === undefined) ? '' : r.persons
          });
        });
        return true;
      } catch (e) {
        console.error('loadState error', e);
        return false;
      }
    };

    const clearState = () => {
      try {
        const key = storageKey(props.event?.id);
        localStorage.removeItem(key);
        // also clear current rows
        rows.splice(0, rows.length);
      } catch (e) {
        console.error('clearState error', e);
      }
    };

    // autosave on rows change (deep)
    watch(rows, () => {
      if (props.event && props.event.id != null) saveState(props.event.id);
    }, { deep: true });

    // if event prop changes, attempt to load saved state for that event
    watch(() => props.event, (newEv) => {
      if (newEv && newEv.id != null) {
        const loaded = loadState(newEv.id);
        if (!loaded) {
          // no saved state: ensure at least one empty row
          rows.splice(0, rows.length);
          addRow();
        }
      } else {
        // no event: keep one row
        rows.splice(0, rows.length);
        addRow();
      }
    }, { immediate: false });

    const show = async () => {
      if (!modalInstance) modalInstance = new Modal(modal.value, { backdrop: 'static' });
      await fetchPrices();
      // try to load saved state for current event when showing
      if (props.event && props.event.id != null) {
        const ok = loadState(props.event.id);
        if (!ok && rows.length === 0) addRow();
      } else {
        if (rows.length === 0) addRow();
      }
      modalInstance.show();
    };

    const hide = () => {
      if (props.event && props.event.id != null) saveState(props.event.id);
      if (modalInstance) modalInstance.hide();
    };

    // státusz váltás: UF Árajánlat elfogadására vár
    const setStatusUFOfferPending = async () => {
      if (!props.event || props.event.id == null) return;
      const res = await fetch(`/api/kerveny/${props.event.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusz: TARGET_STATUS })
      });
      if (!res.ok) {
        const t = await res.text().catch(()=> '');
        throw new Error(`Státusz váltás hiba: ${res.status} ${t}`);
      }
    };

    const saveAndAdvanceStatus = async (payload) => {
      if (!props.event || props.event.id == null) return;
      saving.value = true;
      try {
        const res = await fetch(`/api/kerveny/${props.event.id}/costs/commit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Mentés hiba');
        return await res.json();
      } finally {
        saving.value = false;
      }
    };

    const apply = async () => {
      const breakdown = rows.map(r => {
        const p = findPriceById(r.serviceId);
        return {
          serviceId: r.serviceId,
          serviceName: p ? p.name : null,
          hours: (r.hours === '' ? 0 : (Number(r.hours) || 0)),
          persons: (r.persons === '' ? 0 : (Number(r.persons) || 0)),
          unitPrice: getRowUnitPrice(r),
          lineTotal: getRowTotal(r),
          unit: p ? p.unit : null,
          rateKey: r.rateKey
        };
      });

      const payload = { breakdown, total: total.value };
      try {
        await saveAndAdvanceStatus(payload);         // költségek mentése
        await setStatusUFOfferPending();            // státusz átállítás UF_ARAJANLAT_ELFOGADASARA_VAR-ra
      } catch (e) {
        error.value = e.message || 'Mentési hiba';
        return;
      }

      if (props.event && props.event.id != null) saveState(props.event.id);
      emit('status-updated', { id: props.event.id, statusz: TARGET_STATUS });
      emit('refresh-events');                       // szülő komponens frissítse a listát
      emit('calculated', { event: props.event, breakdown, total: total.value });
      hide();
    };

    const onServiceChange = (row) => {
      // ha szeretnél automatikusan beállítani valamit a sorban, ide
    };

    return {
      modal, loading, prices, rows, addRow, removeRow,
      getRowUnitPrice, getRowTotal, total, formatMoney,
      show, hide, apply, error, onServiceChange, getRowUnitText,
      clearState, saving
    };
  }
};
</script>

<style scoped>
/* opcionális kis kiegészítés: a két szám mező közelebb kerülhet */
.row-with-trash input[type=number] { text-align: right; }

/* egyszerű stílusok a modál sorokhoz */

/* megnövelt modal szélesség finomhangolása */
.modal-dialog.modal-xl { max-width: 1100px; }

/* engedélyezzük, hogy a .trash-out kilógjon a modalból */
.modal-content--overflow {
  overflow: visible;
}

/* sor konténer, hogy a kuka gomb pozícionálható legyen */
.row-with-trash { position: relative; }

/* kuka gomb — kilógó hatás a jobb oldalon */
.trash-out {
  position: relative;
  right: -12px; /* kilóg jobbra */
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  z-index: 60;
  border-radius: 8px;
  padding-left: 8px;
  padding-right: 8px;
}

/* kisebb képernyőn ne lógjon ki túl sokat */
@media (max-width: 576px) {
  .modal-dialog.modal-xl { max-width: 95%; }
  .trash-out { right: -6px; }
}

/* igény szerint további finomítások */

/* Szélesebb selectek, hogy kiférjen a szöveg */
.service-select { max-width: 340px; }
.rate-select { width: 230px; }

/* Placeholder szín (böngésző alap általában szürke, de egységesítjük) */
.hours-input::placeholder,
.persons-input::placeholder {
  color: #9aa0a6;
  opacity: 1;
  font-size: 0.75rem;
}

/* Üres (placeholder) állapotnál dönthetünk halvány háttérről */
.hours-input:placeholder-shown,
.persons-input:placeholder-shown {
  background: #f8f9fa;
}

/* Kisebb kijelzőn a szélességek igazítása */
@media (max-width: 768px) {
  .service-select { min-width: 200px; }
  .rate-select { width: 200px; }
}
</style>