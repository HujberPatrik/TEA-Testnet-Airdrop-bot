<template>
  <div class="scc-overlay" @click.self="$emit('close')" role="dialog" aria-modal="true">
    <div class="scc-modal">
      <div class="scc-header">
        <h5 class="title mb-0 d-flex align-items-center gap-2">
          <i class="fas fa-calculator"></i>
          <span>Uni‑Famulus kalkulátor — {{ event?.nev || 'Rendezvény' }}</span>
        </h5>
        <div class="d-flex align-items-center gap-2">
          <button class="pill-btn pill-light pill-sm" @click="$emit('close')" title="Bezárás">
            <i class="fas fa-times"></i><span class="d-none d-sm-inline">Bezárás</span>
          </button>
        </div>
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
              <i class="fas fa-plus"></i> <span>Hozzáadás (UF)</span>
            </button>
            <div class="total-chip">
              <span class="label">UF összesen</span>
              <span class="value">{{ formatMoney(total) }}</span>
            </div>
          </div>

          <div
            v-for="(row, idx) in rows"
            :key="row.id"
            class="calc-row"
          >
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

            <select class="fld select rate-select" v-model="row.rateKey">
              <option value="priceUniversity">Egyetemi — Normál</option>
              <option value="priceUniversityWeekend">Egyetemi — Hétvége/Éjszaka</option>
              <option value="priceExternal">Külső — Normál</option>
              <option value="priceExternalWeekend">Külső — Hétvége/Éjszaka</option>
            </select>

            <input type="number" min="0" step="0.25" class="fld number" v-model="row.hours" placeholder="Óra" title="Órák" />
            <input type="number" min="0" step="1" class="fld number" v-model="row.persons" placeholder="Fő" title="Fő (létszám)" />

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
              <span>{{ saving ? 'Mentés...' : 'Mentés (UF)' }}</span>
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
import auth, { ensureAuthUser } from '@/services/auth'; // ensureAuthUser használata

export default {
  name: 'UniFamulusCostCalculator',
  props: { event: { type: Object, default: null } },
  emits: ['status-updated', 'refresh-events', 'close', 'calculated'],
  setup(props, { emit }) {
    console.debug('[UniFamulusCostCalculator] mount init for event', props.event?.id);
    onMounted(async () => {
      try {
        const u = await ensureAuthUser();
        state.userId = toInt(u?.id ?? u?.user_id ?? u?.userId) || fallbackExtract();
      } catch { state.userId = fallbackExtract(); }
      await fetchPrices();
      const had = loadState();
      if (!had && rows.length === 0) addRow?.();
     console.debug('[UniFamulusCostCalculator] ready, rows:', rows.length);
    });
    const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:3000').replace(/\/$/, '');
    const state = reactive({
      token: (auth?.getToken?.() || localStorage.getItem('token') || '').trim(),
      userId: null
    });
    const toInt = (v) => {
      const n = parseInt(v, 10);
      return Number.isInteger(n) && n > 0 ? n : null;
    };

    // ensureAuthUser elsődleges, fallback a localStorage / auth objektumok
    const fallbackExtract = () => {
      const candidates = [];
      try {
        const uObj = auth?.getUser?.() ?? auth?.currentUser ?? auth?.user;
        if (uObj) candidates.push(uObj.id, uObj.user_id, uObj.userId);
      } catch {}
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const parsed = JSON.parse(raw);
          candidates.push(parsed.id, parsed.user_id, parsed.userId);
        }
      } catch {}
      candidates.push(localStorage.getItem('user_id'));
      for (const c of candidates) {
        const n = toInt(c);
        if (n) return n;
      }
      return null;
    };

    const defaultHeaders = () => ({
      'Content-Type': 'application/json',
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(toInt(state.userId) ? { 'X-User-Id': String(toInt(state.userId)) } : {})
    });

    const TARGET_STATUS = 'UF_ARAJANLAT_ELFOGADASARA_VAR';
    const loading = ref(false);
    const error = ref('');
    const prices = ref([]);
    const rows = reactive([]);
    const saving = ref(false);
    // Állapot mentése/betöltése – esemény-specifikus kulcs
    const storageKey = (eventId) => `serviceCalc:${eventId ?? 'global'}:famulus`;

    const saveState = () => {
      try {
        if (!props.event?.id) return;
        const payload = {
          rows: JSON.parse(JSON.stringify(rows)),
          ts: Date.now()
        };
        localStorage.setItem(storageKey(props.event.id), JSON.stringify(payload));
      } catch {}
    };

    const loadState = () => {
      try {
        if (!props.event?.id) return false;
        const raw = localStorage.getItem(storageKey(props.event.id));
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (Array.isArray(data?.rows)) {
          rows.splice(0, rows.length, ...data.rows);
          return true;
        }
        return false;
      } catch { return false; }
    };

    // Mély figyelő: bármelyik sor változására ment
    watch(rows, saveState, { deep: true });

    const fetchPrices = async () => {
      loading.value = true; error.value = '';
      try {
        let res = await fetch(`${API_BASE}/api/prices/famulus`, { headers: defaultHeaders() });
        if (!res.ok) {
          res = await fetch(`${API_BASE}/api/prices`, { headers: defaultHeaders() });
          if (!res.ok) throw new Error('Árak betöltése sikertelen');
        }
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
    const isUfCategory = (cat) => {
      const c = (cat ?? '').trim().toLowerCase();
      return c === 'uf' || c === 'uni-famulus' || c === 'uni famulus' || c.includes('famulus');
    };
    const findPriceById = (id) => prices.value.find(p => p.id === id) || null;
    const filteredPricesFor = () => prices.value.filter(p => isUfCategory(p.category));
    const isExternalRate = (row) => (row.rateKey === 'priceExternal' || row.rateKey === 'priceExternalWeekend');
    const getRowUnitPrice = (row) => {
      const p = findPriceById(row.serviceId);
      if (!p) return 0;
      const base = Number(p[row.rateKey] ?? 0) || 0;
      return isExternalRate(row) ? Math.round(base * 1.27 * 100) / 100 : base;
    };
    const getRowUnitText = (row) => {
      const p = findPriceById(row.serviceId);
      if (!p) return '';
      return p.unit ? `${isExternalRate(row) ? '+Áfa / ' : '/ '}${p.unit}` : (isExternalRate(row) ? '+Áfa' : '');
    };
    const normalizeUnit = (s) => (s ?? '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
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
        pricingType: 'famulus',
        serviceId: null,
        rateKey: 'priceUniversity',
        hours: '', persons: '', days: '', occasions: '', quantity: ''
      });
    };
    const removeRow = (idx) => rows.splice(idx, 1);
    const onServiceChange = (row) => {
      if (row?.serviceId == null) return;
      const p = findPriceById(row.serviceId);
      if (!p || !isUfCategory(p.category)) row.serviceId = null;
    };
    const postWithFallback = async (paths, payload) => {
      let lastErr;
      for (const p of paths) {
        try {
          const res = await fetch(p, {
            method: 'POST',
            headers: defaultHeaders(),
            body: JSON.stringify(payload)
          });
          if (res.ok) return await res.json();
          lastErr = new Error(`HTTP ${res.status}`);
        } catch (e) { lastErr = e; }
      }
      throw lastErr || new Error('Ismeretlen hiba');
    };

    const setStatusUFOfferPending = async () => {
      if (!props.event?.id) return;
      const res = await fetch(`${API_BASE}/api/kerveny/${props.event.id}/status`, {
        method: 'PATCH',
        headers: defaultHeaders(),
        body: JSON.stringify({ statusz: TARGET_STATUS })
      });
      if (!res.ok) throw new Error('Státusz váltás hiba');
    };
    const buildBreakdown = () => rows.map(r => {
      const p = findPriceById(r.serviceId);
      return {
        pricingType: 'famulus',
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
    const commit = async () => {
      if (!props.event?.id) return;
      saving.value = true;
      const id = props.event.id;
      const breakdown = buildBreakdown();
      const payload = {
        breakdown,
        total: total.value,
        pricingType: 'famulus',
        user_id: toInt(state.userId) // ensureAuthUser által meghatározott integer
      };
      try {
        await postWithFallback(
          [
            `${API_BASE}/api/kerveny/${id}/costs/commit-uf`,
            `${API_BASE}/api/kerveny/${id}/costs/commit?type=famulus`,
            `${API_BASE}/api/kerveny/${id}/costs/commit`
          ],
          payload
        );
        await setStatusUFOfferPending();
        saveState();
        emit('status-updated', { id, statusz: TARGET_STATUS });
        emit('refresh-events');
        emit('calculated', { event: props.event, breakdown, total: total.value, pricingType: 'famulus' });
        emit('close');
      } catch (e) { error.value = e.message || 'Mentési hiba (UF)'; }
      finally { saving.value = false; }
    };
    const onDeleteClicked = async () => {
      const id = props.event?.id;
      if (!id) { alert('Hiányzó kérelem azonosító.'); return; }
      const ok = confirm('Biztosan törlöd az UF tételeket? Az adatbázisból is törlődik.');
      if (!ok) return;
      try {
        rows.splice(0, rows.length);
        localStorage.removeItem(storageKey(id));
      } catch {}
      try {
        await postWithFallback(
          [
            `${API_BASE}/api/kerveny/${id}/costs/commit-uf`,
            `${API_BASE}/api/kerveny/${id}/costs/commit?type=famulus`,
            `${API_BASE}/api/kerveny/${id}/costs/commit`
          ],
          { pricingType: 'famulus', breakdown: [], total: 0 }
        );
        emit('refresh-events');
      } catch (e) {
        console.error('Szerver törlés hiba:', e);
        alert('A törlés a szerveren nem sikerült.');
      }
    };
    return {
      loading, error, prices,
      rows, saving,
      addRow, removeRow, onServiceChange,
      filteredPricesFor, getRowUnitPrice, getRowUnitText, getRowTotal,
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

/* Sorok */
.calc-row {
  display:grid;
  grid-template-columns: minmax(220px, 1.2fr) minmax(200px, 1fr) repeat(2, 120px) 160px 150px 110px;
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

/* Összeg cellák */
.unit-price, .line-total {
  text-align:right;
}
.unit-price .val, .line-total .val { font-weight:800; color:#1c2e46; }
.unit-price .txt {
  font-size:.7rem;
  color:#6b7d92;
  margin-top:2px;
}

/* Pill gombok */
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
@media (max-width: 992px) {
  .calc-row {
    grid-template-columns: 1fr 1fr 100px 100px 1fr 1fr 90px;
  }
}
@media (max-width: 576px) {
  .scc-modal { border-radius:22px; max-height:94vh; }
  .calc-row {
    grid-template-columns: 1fr;
    gap:.4rem;
  }
  .unit-price, .line-total { text-align:left; }
}
</style>