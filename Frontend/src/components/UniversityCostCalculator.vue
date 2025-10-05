<template>
  <div class="scc-overlay" @click.self="$emit('close')">
    <div class="scc-modal">
      <div class="scc-header">
        <h5 class="mb-0">Egyetemi kalkulátor — {{ event?.nev || 'Rendezvény' }}</h5>
        <button class="btn btn-sm btn-outline-secondary" @click="$emit('close')">Bezárás</button>
      </div>

      <div class="scc-body">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border" role="status"></div>
        </div>

        <div v-else>
          <div v-if="prices.length === 0" class="alert alert-warning">Nincsenek elérhető szolgáltatások.</div>

          <div class="d-flex justify-content-between align-items-center mb-2">
            <button type="button" class="btn btn-sm btn-outline-primary" @click="addRow()">
              <i class="fas fa-plus me-1"></i> Hozzáadás (Egyetemi)
            </button>
            <div class="text-end">
              <div class="h6 mb-0">Egyetemi összesen: {{ formatMoney(total) }}</div>
            </div>
          </div>

          <div v-for="(row, idx) in rows" :key="row.id" class="d-flex gap-2 align-items-center mb-2 row-with-trash">
            <select class="form-select form-select-sm service-select" style="min-width:260px;"
                    v-model="row.serviceId" @change="onServiceChange(row)">
              <option :value="null">-- válassz szolgáltatást --</option>
              <option v-for="p in filteredPricesFor(row)" :key="p.id" :value="p.id">{{ p.name }} — {{ p.category }}</option>
            </select>

            <!-- Egyetemi fülön nincs külső tarifa -->
            <input type="hidden" v-model="row.rateKey" />

            <!-- Dinamikus mezők a mértékegység alapján -->
            <input v-if="showQuantity(row)" type="number" min="0" step="1" class="form-control form-control-sm" style="width:110px;" v-model="row.quantity" placeholder="db" title="Darabszám" />
            <input v-if="showOccasions(row)" type="number" min="0" step="1" class="form-control form-control-sm" style="width:110px;" v-model="row.occasions" placeholder="alkalom" title="Alkalom" />
            <input v-if="showDays(row)" type="number" min="0" step="0.25" class="form-control form-control-sm" style="width:110px;" v-model="row.days" placeholder="nap" title="Napok" />
            <input v-if="showHours(row)" type="number" min="0" step="0.25" class="form-control form-control-sm" style="width:110px;" v-model="row.hours" placeholder="óra" title="Órák" />
            <input v-if="showPersons(row)" type="number" min="0" step="1" class="form-control form-control-sm" style="width:90px;" v-model="row.persons" placeholder="fő" title="Fő (létszám)" />

            <div style="min-width:140px; text-align:right;">
              <div class="fw-bold">{{ formatMoney(getRowUnitPrice(row)) }}</div>
              <div class="text-muted small" v-if="getRowUnitText(row)">{{ getRowUnitText(row) }}</div>
            </div>
            <div style="min-width:130px; text-align:right;">
              <div class="fw-bold">{{ formatMoney(getRowTotal(row)) }}</div>
            </div>

            <button class="btn btn-sm btn-outline-danger trash-out" @click="removeRow(idx)" title="Töröl">
              <i class="fas fa-trash"></i>
            </button>
          </div>

          <div class="d-flex gap-2 mt-3">
            <button class="btn btn-outline-danger btn-sm" @click="onDeleteClicked" :disabled="saving">Törlés</button>
            <div class="flex-grow-1"></div>
            <button class="btn btn-primary" :disabled="rows.length===0 || saving" @click="commit">Mentés (Egyetemi)</button>
          </div>

          <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
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

    const normalizeUnit = (s) =>
      (s ?? '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
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
        hours: '', persons: '',
        days: '', occasions: '', quantity: ''
      });
    };
    const removeRow = (idx) => rows.splice(idx, 1);

    const onServiceChange = (row) => {
      if (row?.serviceId == null) return;
      const p = findPriceById(row.serviceId);
      if (!p || !isUniCategory(p.category)) row.serviceId = null;
    };

    // localStorage (UNI)
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

    // API hívások
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

    // Mentés (UNI)
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

    // Törlés (UNI)
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
.scc-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; z-index: 2100; }
.scc-modal { background: #fff; width: 95%; max-width: 1100px; max-height: 90vh; border-radius: 10px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,.25); display: flex; flex-direction: column; }
.scc-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; background: #f8f9fa; }
.scc-body { padding: 16px; overflow: auto; flex: 1; }
.row-with-trash { position: relative; }
.trash-out { position: relative; right: -12px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); border-radius: 8px; padding: 0 8px; }
.service-select { max-width: 340px; }
</style>