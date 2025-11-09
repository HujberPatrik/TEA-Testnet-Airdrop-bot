<template>
  <div class="scc-overlay" @click.self="$emit('close')" role="dialog" aria-modal="true">
    <div class="scc-modal">
      <div class="scc-header">
        <h5 class="title mb-0 d-flex align-items-center gap-2">
          <i class="fas fa-calculator"></i>
          <span>Egyetemi kalkulátor — {{ event?.nev || 'Rendezvény' }}</span>
        </h5>
        <button class="pill-btn pill-light pill-sm" @click="$emit('close')" title="Bezárás">
          <i class="fas fa-times"></i>
          <span class="d-none d-sm-inline">Bezárás</span>
        </button>
      </div>

      <div class="scc-body">
        <div v-if="loading" class="text-center py-4">
          <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
        </div>

        <div v-else>
          <div v-if="prices.length === 0" class="alert alert-warning rounded-3">
            Nincsenek elérhető szolgáltatások.
          </div>

          <div class="toolbar d-flex justify-content-between align-items-center mb-3">
            <button type="button" class="pill-btn pill-primary pill-sm" @click="addRow()">
              <i class="fas fa-plus"></i> <span>Hozzáadás (Egyetemi)</span>
            </button>
            <div class="total-chip">
              <span class="label">Egyetemi összesen</span>
              <span class="value">{{ formatMoney(total) }}</span>
            </div>
          </div>

          <div v-for="(row, idx) in rows" :key="row.id" class="calc-row">
            <select
              class="fld select service-select"
              v-model="row.serviceId"
              @change="onServiceChange(row)"
            >
              <option :value="null">-- válassz szolgáltatást --</option>
              <option v-for="p in filteredPricesFor(row)" :key="p.id" :value="p.id">
                {{ p.name }} — {{ p.category }}
              </option>
            </select>

            <!-- Egyetemi fülön nincs külső tarifa -->
            <input type="hidden" v-model="row.rateKey" />

            <!-- Dinamikus mezők a mértékegység alapján -->
            <input
              v-if="showQuantity(row)"
              type="number"
              min="0"
              step="1"
              class="fld number"
              v-model="row.quantity"
              placeholder="db"
              title="Darabszám"
            />
            <input
              v-if="showOccasions(row)"
              type="number"
              min="0"
              step="1"
              class="fld number"
              v-model="row.occasions"
              placeholder="alkalom"
              title="Alkalom"
            />
            <input
              v-if="showDays(row)"
              type="number"
              min="0"
              step="0.25"
              class="fld number"
              v-model="row.days"
              placeholder="nap"
              title="Napok"
            />
            <input
              v-if="showHours(row)"
              type="number"
              min="0"
              step="0.25"
              class="fld number"
              v-model="row.hours"
              placeholder="óra"
              title="Órák"
            />
            <input
              v-if="showPersons(row)"
              type="number"
              min="0"
              step="1"
              class="fld number"
              v-model="row.persons"
              placeholder="fő"
              title="Fő (létszám)"
            />

            <div class="unit-price">
              <div class="val">{{ formatMoney(getRowUnitPrice(row)) }}</div>
              <div class="txt" v-if="getRowUnitText(row)">{{ getRowUnitText(row) }}</div>
            </div>

            <div class="line-total">
              <div class="val">{{ formatMoney(getRowTotal(row)) }}</div>
            </div>

            <button class="pill-btn pill-danger pill-sm" @click="removeRow(idx)" title="Törlés">
              <i class="fas fa-trash"></i>
            </button>
          </div>

          <div class="d-flex gap-2 mt-3">
            <button class="pill-btn pill-danger pill-sm" @click="onDeleteClicked" :disabled="saving">Törlés</button>
            <div class="flex-grow-1"></div>
            <button class="pill-btn pill-primary" :disabled="rows.length===0 || saving" @click="commit">
              <i v-if="!saving" class="fas fa-save"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
              <span>{{ saving ? 'Mentés...' : 'Mentés (Egyetemi)' }}</span>
            </button>
          </div>

          <div v-if="error" class="alert alert-danger rounded-3 mt-3">{{ error }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue';

export default {
  name: 'UniversityCostCalculator',
  props: { event: { type: Object, default: null } },
  emits: ['refresh-events', 'status-updated', 'close', 'calculated'],
  setup(props, { emit }) {
    const TARGET_STATUS = 'ARAJANLAT_ELFOGADASRA_VAR';
    const loading = ref(false);
    const error = ref('');
    const prices = ref([]);
    const rows = reactive([]);
    const saving = ref(false);

    const storageKey = (eventId) => `serviceCalc:${eventId ?? 'global'}:uni`;

    const fetchPrices = async () => {
      loading.value = true; error.value = '';
      try {
        let res = await fetch('/api/prices/university');
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
      } catch (e) { error.value = e.message || String(e); }
      finally { loading.value = false; }
    };

    const isUniCategory = (cat) => (cat ?? '').trim().toLowerCase() === 'egyetemi';
    const findPriceById = (id) => prices.value.find(p => p.id === id) || null;
    const filteredPricesFor = () => prices.value.filter(p => isUniCategory(p.category));

    const getRowUnitPrice = (row) => {
      const p = findPriceById(row.serviceId);
      if (!p) return 0;
      return Number(p[row.rateKey] ?? 0) || 0; // Egyetemi: nincs +ÁFA árazás itt
    };
    const getRowUnitText = (row) => {
      const p = findPriceById(row.serviceId);
      if (!p) return '';
      return p.unit ? `/ ${p.unit}` : '';
    };

    const normalizeUnit = (s) => (s ?? '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const unitFields = (unit) => {
      const u = normalizeUnit(unit);
      if (u.includes('db/alkalom')) return { qty:true, occ:true };
      if (u.includes('fo/ora'))     return { per:true, hrs:true };
      if (u.includes('nap'))        return { days:true };
      if (u.includes('ora'))        return { hrs:true };
      if (u === 'fo' || u.includes(' fo')) return { per:true };
      if (u.includes('alkalom'))    return { occ:true };
      if (u === 'db' || u.includes(' db')) return { qty:true };
      return { per:true, hrs:true };
    };

    const showPersons   = (row) => unitFields(findPriceById(row.serviceId)?.unit).per  === true;
    const showHours     = (row) => unitFields(findPriceById(row.serviceId)?.unit).hrs  === true;
    const showDays      = (row) => unitFields(findPriceById(row.serviceId)?.unit).days === true;
    const showOccasions = (row) => unitFields(findPriceById(row.serviceId)?.unit).occ  === true;
    const showQuantity  = (row) => unitFields(findPriceById(row.serviceId)?.unit).qty  === true;

    const getMultiplier = (row) => {
      const p = findPriceById(row.serviceId);
      const u = normalizeUnit(p?.unit);
      const h  = row.hours === '' ? 0 : Number(row.hours) || 0;
      const pe = row.persons === '' ? 0 : Number(row.persons) || 0;
      const d  = row.days === '' ? 0 : Number(row.days) || 0;
      const oc = row.occasions === '' ? 0 : Number(row.occasions) || 0;
      const q  = row.quantity === '' ? 0 : Number(row.quantity) || 0;

      if (u.includes('db/alkalom')) return q * oc;
      if (u.includes('fo/ora'))     return pe * h;
      if (u.includes('nap'))        return d;
      if (u.includes('ora'))        return h;
      if (u === 'fo' || u.includes(' fo')) return pe;
      if (u.includes('alkalom'))    return oc;
      if (u === 'db' || u.includes(' db')) return q;
      return pe * h;
    };
    const getRowTotal = (row) => getRowUnitPrice(row) * getMultiplier(row);
    const total = computed(() => rows.reduce((s, r) => s + getRowTotal(r), 0));
    const formatMoney = (v) => (Number(v) || 0).toLocaleString('hu-HU') + ' Ft';

    const addRow = () => {
      rows.push({
        id: Date.now() + Math.random(),
        pricingType: 'uni',
        serviceId: null,
        rateKey: 'priceUniversity',
        hours: '', persons: '', days: '', occasions: '', quantity: ''
      });
    };
    const removeRow = (idx) => rows.splice(idx, 1);

    const onServiceChange = (row) => {
      if (row?.serviceId == null) return;
      const p = findPriceById(row.serviceId);
      if (!p || !isUniCategory(p.category)) row.serviceId = null;
    };

    const saveState = () => {
      try {
        const id = props.event?.id;
        const key = storageKey(id);
        const payload = {
          rows: rows.map(r => ({
            id: r.id, pricingType: 'uni', serviceId: r.serviceId, rateKey: r.rateKey,
            hours: r.hours === '' ? null : r.hours,
            persons: r.persons === '' ? null : r.persons,
            days: r.days === '' ? null : r.days,
            occasions: r.occasions === '' ? null : r.occasions,
            quantity: r.quantity === '' ? null : r.quantity
          })),
          savedAt: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(payload));
      } catch {}
    };
    const loadState = () => {
      try {
        const id = props.event?.id;
        const key = storageKey(id);
        const raw = localStorage.getItem(key);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.rows)) return false;
        rows.splice(0, rows.length);
        parsed.rows.forEach(r => rows.push({
          id: r.id ?? (Date.now() + Math.random()),
          pricingType: 'uni',
          serviceId: r.serviceId ?? null,
          rateKey: r.rateKey ?? 'priceUniversity',
          hours: (r.hours == null) ? '' : r.hours,
          persons: (r.persons == null) ? '' : r.persons,
          days: (r.days == null) ? '' : r.days,
          occasions: (r.occasions == null) ? '' : r.occasions,
          quantity: (r.quantity == null) ? '' : r.quantity
        }));
        return true;
      } catch { return false; }
    };
    watch(rows, saveState, { deep: true });

    const postWithFallback = async (paths, payload) => {
      let lastErr;
      for (const p of paths) {
        try {
          const res = await fetch(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (res.ok) return await res.json();
          lastErr = new Error(`HTTP ${res.status}`);
        } catch (e) { lastErr = e; }
      }
      throw lastErr || new Error('Ismeretlen hiba');
    };

    const buildBreakdown = () => rows.map(r => {
      const p = findPriceById(r.serviceId);
      return {
        pricingType: 'uni',
        serviceId: r.serviceId,
        serviceName: p ? p.name : null,
        hours: (r.hours === '' ? 0 : (Number(r.hours) || 0)),
        persons: (r.persons === '' ? 0 : (Number(r.persons) || 0)),
        days: (r.days === '' ? 0 : (Number(r.days) || 0)),
        occasions: (r.occasions === '' ? 0 : (Number(r.occasions) || 0)),
        quantity: (r.quantity === '' ? 0 : (Number(r.quantity) || 0)),
        unitPrice: getRowUnitPrice(r),
        lineTotal: getRowTotal(r),
        unit: p ? p.unit : null,
        rateKey: r.rateKey
      };
    });

    const setStatusUniversityOfferPending = async () => {
      if (!props.event?.id) return;
      const res = await fetch(`/api/kerveny/${props.event.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusz: TARGET_STATUS })
      });
      if (!res.ok) throw new Error('Státusz váltás hiba');
    };

    const commit = async () => {
      if (!props.event?.id) return;
      saving.value = true;
      const id = props.event.id;
      const breakdown = buildBreakdown();
      const payload = { breakdown, total: total.value, pricingType: 'uni' };
      try {
        await postWithFallback(
          [
            `/api/kerveny/${id}/costs/commit-uni`,
            `/api/kerveny/${id}/costs/commit?type=uni`,
            `/api/kerveny/${id}/costs/commit`
          ],
          payload
        );
        await setStatusUniversityOfferPending();
        saveState();
        emit('status-updated', { id, statusz: TARGET_STATUS });
        emit('refresh-events');
        emit('calculated', { event: props.event, breakdown, total: total.value, pricingType: 'uni' });
        emit('close');
      } catch (e) {
        error.value = e.message || 'Mentési hiba (Egyetemi)';
      } finally {
        saving.value = false;
      }
    };

    const onDeleteClicked = async () => {
      const id = props.event?.id;
      if (!id) { alert('Hiányzó kérelem azonosító.'); return; }
      const ok = confirm('Biztosan törlöd az Egyetemi tételeket? Az adatbázisból is törlődik.');
      if (!ok) return;
      try {
        rows.splice(0, rows.length);
        localStorage.removeItem(storageKey(id));
      } catch {}
      try {
        await postWithFallback(
          [
            `/api/kerveny/${id}/costs/commit-uni`,
            `/api/kerveny/${id}/costs/commit?type=uni`,
            `/api/kerveny/${id}/costs/commit`
          ],
          { pricingType: 'uni', breakdown: [], total: 0 }
        );
        emit('refresh-events');
      } catch (e) {
        console.error('Szerver törlés hiba:', e);
        alert('A törlés a szerveren nem sikerült.');
      }
    };

    onMounted(async () => {
      await fetchPrices();
      const had = loadState();
      if (!had && rows.length === 0) addRow();
    });

    return {
      loading, error, prices,
      rows, saving,
      addRow, removeRow, onServiceChange,
      filteredPricesFor, getRowUnitPrice, getRowUnitText, getRowTotal,
      showQuantity, showOccasions, showDays, showHours, showPersons,
      total, formatMoney,
      commit, onDeleteClicked
    };
  }
};
</script>

<style scoped>
/* Overlay + modal keret (magas z-index a Wizard fölé) */
.scc-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,25,40,.55);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 6500;
  padding: 20px;
}
.scc-modal {
  background: #fff;
  width: 96%;
  max-width: 1200px;
  max-height: 92vh;
  border-radius: 26px;
  overflow: hidden;
  box-shadow: 0 18px 40px -18px rgba(0,0,0,.35), 0 8px 18px -10px rgba(0,0,0,.2);
  display: flex;
  flex-direction: column;
  position: relative;
}
.scc-modal::before {
  content:'';
  position:absolute;
  inset:0;
  border-radius:26px;
  pointer-events:none;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.7), inset 0 0 0 2px rgba(0,0,0,.03);
}

/* Header – kék gradient, pill gomb */
.scc-header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:14px 16px;
  background: linear-gradient(135deg,#5a9cff 0%,#0d6efd 60%,#0b5ed7 100%);
  color:#fff;
  position: sticky;
  top: 0;
  z-index: 2;
}
.scc-header .title { font-weight:700; letter-spacing:.2px; }

/* Body */
.scc-body {
  padding: 16px;
  overflow: auto;
  flex: 1;
  background:#f7f9ff;
}

/* Top toolbar */
.total-chip {
  display:inline-flex;
  align-items:center;
  gap:.5rem;
  background:#fff;
  border:1px solid #d7e3f5;
  border-radius:999px;
  padding:.35rem .75rem;
  box-shadow:0 2px 6px -3px rgba(0,0,0,.12);
}
.total-chip .label { font-size:.7rem; color:#24415f; font-weight:700; }
.total-chip .value { font-weight:800; font-size:.8rem; color:#0d6efd; }

/* Sorok – a mezők száma eltérhet az UF-től, de a stílus egyezik */
.calc-row {
  display:grid;
  grid-template-columns: minmax(220px, 1.2fr) repeat(5, 120px) 160px 150px 110px;
  gap:.55rem;
  align-items:center;
  background:#fff;
  border:1px solid #e8eef9;
  border-radius:16px;
  padding:.6rem;
  margin-bottom:.55rem;
  box-shadow:0 6px 14px -10px rgba(0,0,0,.15);
}

/* Mezők – “pill” input/select */
.fld {
  width:100%;
  border:1px solid #c3d6f1;
  border-radius:999px;
  padding:.45rem .75rem;
  font-size:.78rem;
  font-weight:600;
  color:#24415f;
  background:#f5f8ff;
  outline:none;
  transition:.18s;
}
.fld:focus {
  border-color:#0d6efd;
  background:#eef4ff;
  box-shadow:0 0 0 3px rgba(13,110,253,.15);
}
.fld.number { text-align:center; }
.fld.select { appearance:auto; background:#fff; }
.service-select { min-width: 260px; }

/* Összeg cellák */
.unit-price, .line-total { text-align:right; }
.unit-price .val, .line-total .val { font-weight:800; color:#1c2e46; }
.unit-price .txt { font-size:.7rem; color:#6b7d92; margin-top:2px; }

/* Pill gombok – egyeznek az UF kalkulátoréval */
.pill-btn {
  display:inline-flex;
  align-items:center;
  gap:.45rem;
  padding:.5rem 1rem;
  font-size:.75rem;
  font-weight:700;
  letter-spacing:.3px;
  border-radius:999px;
  border:1px solid transparent;
  background:#fff;
  color:#24415f;
  transition:.18s;
  line-height:1;
  white-space:nowrap;
}
.pill-btn:hover { transform: translateY(-1px); }
.pill-sm { padding:.35rem .7rem; font-size:.68rem; }

.pill-primary {
  background: linear-gradient(135deg,#3a8bff 0%,#0d6efd 45%,#0b58d0 100%);
  color:#fff;
  border-color:#0d6efd;
  box-shadow:0 3px 6px -2px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.12);
}
.pill-primary:hover { background: linear-gradient(135deg,#5a9cff 0%,#0b5ed7 55%,#0a4fb6 100%); }

.pill-light {
  background:#fff;
  color:#0d6efd;
  border-color:#d7e3f5;
  box-shadow:0 2px 6px -3px rgba(0,0,0,.12);
}
.pill-light:hover { background:#eef4ff; border-color:#b6cff5; }

.pill-danger {
  background:#d9534f;
  color:#fff;
  border-color:#d9534f;
  box-shadow:0 3px 6px -2px rgba(0,0,0,.25);
}
.pill-danger:hover { filter:brightness(1.05); }

/* Reszponzív */
@media (max-width: 1200px) {
  .calc-row {
    grid-template-columns: minmax(220px, 1.2fr) repeat(3, 120px) 160px 150px 110px;
  }
}
@media (max-width: 992px) {
  .calc-row {
    grid-template-columns: 1fr 1fr 120px 120px 1fr 1fr 100px;
  }
}
@media (max-width: 576px) {
  .scc-modal { border-radius:22px; max-height:94vh; }
  .calc-row { grid-template-columns: 1fr; gap:.4rem; }
  .unit-price, .line-total { text-align:left; }
}
</style>