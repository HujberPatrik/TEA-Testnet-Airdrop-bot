<template>
  <div>
    <div class="modal fade" id="serviceCostModal" tabindex="-1" ref="modal" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content modal-content--overflow">
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

              <!-- Két fül: külön listával és külön mentéssel -->
              <div class="mb-3">
                <ul class="nav nav-tabs">
                  <li class="nav-item">
                    <button type="button" class="nav-link" :class="{ active: activeTab==='famulus' }" @click="activeTab='famulus'">
                      Uni‑Famulus
                    </button>
                  </li>
                  <li class="nav-item">
                    <button type="button" class="nav-link" :class="{ active: activeTab==='uni' }" @click="activeTab='uni'">
                      Egyetemi
                    </button>
                  </li>
                </ul>

                <div class="tab-content border border-top-0 rounded-bottom p-3">
                  <!-- UF fül -->
                  <div class="tab-pane fade" :class="{ 'show active': activeTab==='famulus' }">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <button type="button" class="btn btn-sm btn-outline-primary" @click="addRowWithType('famulus')">
                        <i class="fas fa-plus me-1"></i> Hozzáadás (Uni‑Famulus)
                      </button>
                      <div class="text-end">
                        <div class="h6 mb-0">UF összesen: {{ formatMoney(totalUf) }}</div>
                      </div>
                    </div>

                    <div v-for="(row, idx) in rowsUf" :key="row.id" class="d-flex gap-2 align-items-center mb-2 row-with-trash">
                      <select class="form-select form-select-sm service-select" style="min-width:260px;"
                              v-model="row.serviceId" @change="onServiceChange(row)">
                        <option :value="null">-- válassz szolgáltatást --</option>
                        <option v-for="p in filteredPricesFor(row)" :key="p.id" :value="p.id">{{ p.name }} — {{ p.category }}</option>
                      </select>

                      <select class="form-select form-select-sm rate-select" v-model="row.rateKey">
                        <option value="priceUniversity">Egyetemi — Normál</option>
                        <option value="priceUniversityWeekend">Egyetemi — Hétvége/Éjszaka</option>
                        <option value="priceExternal">Külső — Normál</option>
                        <option value="priceExternalWeekend">Külső — Hétvége/Éjszaka</option>
                      </select>

                      <input type="number" min="0" step="0.25" class="form-control form-control-sm hours-input"
                             style="width:110px;" v-model="row.hours" placeholder="óra" title="Órák" />

                      <input type="number" min="0" step="1" class="form-control form-control-sm persons-input"
                             style="width:90px;" v-model="row.persons" placeholder="fő" title="Fő (létszám)" />

                      <div style="min-width:140px; text-align:right;">
                        <div class="fw-bold">{{ formatMoney(getRowUnitPrice(row)) }}</div>
                        <div class="text-muted small" v-if="getRowUnitText(row)">{{ getRowUnitText(row) }}</div>
                      </div>

                      <div style="min-width:130px; text-align:right;">
                        <div class="fw-bold">{{ formatMoney(getRowTotal(row)) }}</div>
                      </div>

                      <button class="btn btn-sm btn-outline-danger trash-out" @click="removeRow('famulus', idx)" title="Töröl">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>

                    <div class="d-flex justify-content-end mt-3">
                      <button class="btn btn-primary" :disabled="rowsUf.length===0 || saving" @click="commitUf">
                        Mentés (UF)
                      </button>
                    </div>
                  </div>

                  <!-- Egyetemi fül -->
                  <div class="tab-pane fade" :class="{ 'show active': activeTab==='uni' }">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <button type="button" class="btn btn-sm btn-outline-primary" @click="addRowWithType('uni')">
                        <i class="fas fa-plus me-1"></i> Hozzáadás (Egyetemi)
                      </button>
                      <div class="text-end">
                        <div class="h6 mb-0">Egyetemi összesen: {{ formatMoney(totalUni) }}</div>
                      </div>
                    </div>

                    <div v-for="(row, idx) in rowsUni" :key="row.id" class="d-flex gap-2 align-items-center mb-2 row-with-trash">
                      <select class="form-select form-select-sm service-select" style="min-width:260px;"
                              v-model="row.serviceId" @change="onServiceChange(row)">
                        <option :value="null">-- válassz szolgáltatást --</option>
                        <option v-for="p in filteredPricesFor(row)" :key="p.id" :value="p.id">{{ p.name }} — {{ p.category }}</option>
                      </select>

                      <!-- Egyetemi fülön nincs külső tarifa -->
                      <input type="hidden" v-model="row.rateKey" />

                      <!-- D I N A M I K U S   M E Z Ő K   A   M É R T É K E G Y S É G   A L A P J Á N -->
                      <input v-if="showQuantity(row)" type="number" min="0" step="1" class="form-control form-control-sm"
                             style="width:110px;" v-model="row.quantity" placeholder="db" title="Darabszám" />

                      <input v-if="showOccasions(row)" type="number" min="0" step="1" class="form-control form-control-sm"
                             style="width:110px;" v-model="row.occasions" placeholder="alkalom" title="Alkalom" />

                      <input v-if="showDays(row)" type="number" min="0" step="0.25" class="form-control form-control-sm"
                             style="width:110px;" v-model="row.days" placeholder="nap" title="Napok" />

                      <input v-if="showHours(row)" type="number" min="0" step="0.25" class="form-control form-control-sm"
                             style="width:110px;" v-model="row.hours" placeholder="óra" title="Órák" />

                      <input v-if="showPersons(row)" type="number" min="0" step="1" class="form-control form-control-sm"
                             style="width:90px;" v-model="row.persons" placeholder="fő" title="Fő (létszám)" />

                      <div style="min-width:140px; text-align:right;">
                        <div class="fw-bold">{{ formatMoney(getRowUnitPrice(row)) }}</div>
                        <div class="text-muted small" v-if="getRowUnitText(row)">{{ getRowUnitText(row) }}</div>
                      </div>

                      <div style="min-width:130px; text-align:right;">
                        <div class="fw-bold">{{ formatMoney(getRowTotal(row)) }}</div>
                      </div>

                      <button class="btn btn-sm btn-outline-danger trash-out" @click="removeRow('uni', idx)" title="Töröl">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>

                    <div class="d-flex justify-content-end mt-3">
                      <button class="btn btn-primary" :disabled="rowsUni.length===0 || saving" @click="commitUni">
                        Mentés (Egyetemi)
                      </button>
                    </div>
                  </div>
                </div>

                <button class="btn btn-sm btn-outline-secondary ms-2 mt-2" @click="clearAllState" title="Súgó: törli a mentett kalkulációkat">
                  <i class="fas fa-trash-alt"></i> LocalStorage törlése
                </button>
              </div>

              <div v-if="error" class="alert alert-danger mt-2">{{ error }}</div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="hide">Bezárás</button>
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
  props: { event: { type: Object, default: null } },
  emits: ['calculated','status-updated','refresh-events'],
  setup(props, { emit }) {
    const TARGET_STATUS = 'UF_ARAJANLAT_ELFOGADASARA_VAR';
    const modal = ref(null);
    let modalInstance = null;
    const loading = ref(false);
    const error = ref('');
    const prices = ref([]);

    // KÜLÖN listák
    const rowsUf  = reactive([]);
    const rowsUni = reactive([]);

    const saving = ref(false);
    const activeTab = ref('famulus');

    const storageKey = (eventId, type) => `serviceCalc:${eventId ?? 'global'}:${type}`;

    const fetchPrices = async () => {
      loading.value = true;
      error.value = '';
      try {
        // 1) próbáljuk az összes árat
        let res = await fetch('/api/prices');
        // ha nincs ilyen endpoint, essünk vissza a famulus listára
        if (!res.ok) {
          res = await fetch('/api/prices/famulus');
          if (!res.ok) throw new Error('Árak betöltése sikertelen');
        }
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

    const fetchUniversityPrices = async () => {
      loading.value = true;
      error.value = '';
      try {
        const res = await fetch('/api/prices/university');
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

    const fetchFamulusPrices = async () => {
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

    // biztosítja, hogy a kért típushoz megfelelő árlista legyen betöltve
    const ensurePricesLoadedFor = async (type) => {
      const hasUni = () => prices.value.some(p => isUniCategory(p.category));
      if (type === 'uni') {
        if (hasUni()) return;
        try { await fetchUniversityPrices(); } catch {}
        if (hasUni()) return;
        try { await fetchPrices(); } catch {}
      } else {
        if (prices.value.length === 0) {
          try { await fetchPrices(); } catch {}
        }
      }
    };

    const listFor = (type) => (type === 'uni' ? rowsUni : rowsUf);

    const addRowWithType = async (type) => {
      await ensurePricesLoadedFor(type);
      const arr = listFor(type);
      const row = {
        id: Date.now() + Math.random(),
        pricingType: type,
        serviceId: null,
        rateKey: type === 'uni' ? 'priceUniversity' : 'priceUniversity',
        hours: '', persons: '',
        // új mennyiségi mezők (egyetemi egységekhez)
        days: '', occasions: '', quantity: ''
      };
      arr.push(row);
    };

    const removeRow = (type, idx) => listFor(type).splice(idx, 1);

    const findPriceById = (id) => prices.value.find(p => p.id === id) || null;

    const isUniCategory = (cat) => (cat ?? '').trim().toLowerCase() === 'egyetemi';
    const isUfCategory  = (cat) => {
      const c = (cat ?? '').trim().toLowerCase();
      return c === 'uf' || c === 'uni-famulus' || c === 'uni famulus' || c.includes('famulus');
    };

    const filteredPricesFor = (row) => {
      if (!row?.pricingType) return prices.value;
      if (row.pricingType === 'uni') return prices.value.filter(p => isUniCategory(p.category));
      return prices.value.filter(p => isUfCategory(p.category));
    };

    const isExternalRate = (row) => row.pricingType !== 'uni' && (row.rateKey === 'priceExternal' || row.rateKey === 'priceExternalWeekend');

    const getRowUnitPrice = (row) => {
      const p = findPriceById(row.serviceId);
      if (!p) return 0;
      const base = Number(p[row.rateKey] ?? 0) || 0;
      return isExternalRate(row) ? Math.round(base * 1.27 * 100) / 100 : base;
    };

    const getRowUnitText = (row) => {
      const p = findPriceById(row.serviceId);
      if (!p) return '';
      if (p.unit) return `${isExternalRate(row) ? '+Áfa / ' : '/ '}${p.unit}`;
      return isExternalRate(row) ? '+Áfa' : '';
    };

    const normalizeUnit = (s) =>
      (s ?? '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

    const unitFields = (unit) => {
      const u = normalizeUnit(unit);
      // preferált specifikus találatok
      if (u.includes('db/alkalom')) return { qty:true, occ:true };
      if (u.includes('fo/ora'))     return { per:true, hrs:true };
      if (u.includes('nap'))        return { days:true };
      if (u.includes('ora'))        return { hrs:true };
      if (u === 'fo' || u.includes(' fo')) return { per:true };
      if (u.includes('alkalom'))    return { occ:true };
      if (u === 'db' || u.includes(' db')) return { qty:true };
      // alapértelmezett: órák × fő (visszafelé kompatibilitás)
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

      // fallback: fő × óra
      return pe * h;
    };

    const getRowTotal = (row) => {
      const unit = getRowUnitPrice(row);
      return unit * getMultiplier(row);
    };

    const totalUf  = computed(() => rowsUf.reduce((s, r) => s + getRowTotal(r), 0));
    const totalUni = computed(() => rowsUni.reduce((s, r) => s + getRowTotal(r), 0));

    const totalFor = (type) => (type === 'uni' ? totalUni.value : totalUf.value);

    const formatMoney = (v) => (Number(v) || 0).toLocaleString('hu-HU') + ' Ft';

    // ----- per-tab localStorage -----
    const saveState = (eventId, type) => {
      try {
        const key = storageKey(eventId, type);
        const arr = listFor(type);
        const payload = {
          rows: arr.map(r => ({
            id: r.id,
            pricingType: r.pricingType,
            serviceId: r.serviceId,
            rateKey: r.rateKey,
            hours: r.hours === '' ? null : r.hours,
            persons: r.persons === '' ? null : r.persons,
            days: r.days === '' ? null : r.days,
            occasions: r.occasions === '' ? null : r.occasions,
            quantity: r.quantity === '' ? null : r.quantity
          })),
          savedAt: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(payload));
      } catch (e) {
        console.error('saveState error', e);
      }
    };

    const loadState = (eventId, type) => {
      try {
        const key = storageKey(eventId, type);
        const raw = localStorage.getItem(key);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.rows)) return false;
        const arr = listFor(type);
        arr.splice(0, arr.length);
        parsed.rows.forEach(r => {
          arr.push({
            id: r.id ?? (Date.now() + Math.random()),
            pricingType: r.pricingType || type,
            serviceId: r.serviceId ?? null,
            rateKey: r.rateKey ?? 'priceUniversity',
            hours: (r.hours == null) ? '' : r.hours,
            persons: (r.persons == null) ? '' : r.persons,
            days: (r.days == null) ? '' : r.days,
            occasions: (r.occasions == null) ? '' : r.occasions,
            quantity: (r.quantity == null) ? '' : r.quantity
          });
        });
        return true;
      } catch (e) {
        console.error('loadState error', e);
        return false;
      }
    };

    const clearAllState = () => {
      try {
        const id = props.event?.id;
        localStorage.removeItem(storageKey(id, 'famulus'));
        localStorage.removeItem(storageKey(id, 'uni'));
        rowsUf.splice(0, rowsUf.length);
        rowsUni.splice(0, rowsUni.length);
      } catch (e) {
        console.error('clearAllState error', e);
      }
    };

    // autosave mindkét listára
    watch(rowsUf,  () => { if (props.event?.id != null) saveState(props.event.id, 'famulus'); }, { deep: true });
    watch(rowsUni, () => { if (props.event?.id != null) saveState(props.event.id, 'uni'); }, { deep: true });

    // event váltáskor betöltjük mindkét listát
    watch(() => props.event, (ev) => {
      rowsUf.splice(0, rowsUf.length);
      rowsUni.splice(0, rowsUni.length);
      if (ev?.id != null) {
        const gotUf  = loadState(ev.id, 'famulus');
        const gotUni = loadState(ev.id, 'uni');
        if (!gotUf && rowsUf.length === 0)  addRowWithType('famulus');
        if (!gotUni && rowsUni.length === 0) addRowWithType('uni');
      } else {
        addRowWithType('famulus');
        addRowWithType('uni');
      }
    }, { immediate: false });

    const show = async () => {
      if (!modalInstance) modalInstance = new Modal(modal.value, { backdrop: 'static' });
      await fetchPrices();
      const id = props.event?.id;
      if (id != null) {
        const okUf  = loadState(id, 'famulus');
        const okUni = loadState(id, 'uni');
        if (!okUf && rowsUf.length === 0) addRowWithType('famulus');
        if (!okUni && rowsUni.length === 0) addRowWithType('uni');
      } else {
        if (rowsUf.length === 0) addRowWithType('famulus');
        if (rowsUni.length === 0) addRowWithType('uni');
      }
      modalInstance.show();
    };

    const hide = () => {
      const id = props.event?.id;
      if (id != null) {
        saveState(id, 'famulus');
        saveState(id, 'uni');
      }
      if (modalInstance) modalInstance.hide();
    };

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

    // segéd: POST több lehetséges útvonalra, az első sikeresig
    const postWithFallback = async (paths, payload) => {
      let lastErr;
      for (const p of paths) {
        try {
          const res = await fetch(p, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) return await res.json();
          lastErr = new Error(`HTTP ${res.status}`);
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr || new Error('Ismeretlen hiba');
    };

    // UF mentés külön “SQL insert”-ként
    const commitUf = async () => {
      if (!props.event?.id) return;
      saving.value = true;
      const id = props.event.id;
      const breakdown = buildBreakdown('famulus');
      const payload = { breakdown, total: totalUf.value, pricingType: 'famulus' };
      try {
        await postWithFallback(
          [
            `/api/kerveny/${id}/costs/commit-uf`,
            `/api/kerveny/${id}/costs/commit?type=famulus`,
            `/api/kerveny/${id}/costs/commit`
          ],
          payload
        );
        await setStatusUFOfferPending();
        saveState(id, 'famulus');
        emit('status-updated', { id, statusz: TARGET_STATUS });
        emit('refresh-events');
        emit('calculated', { event: props.event, breakdown, total: totalUf.value, pricingType: 'famulus' });
      } catch (e) {
        error.value = e.message || 'Mentési hiba (UF)';
      } finally {
        saving.value = false;
      }
    };

    // Egyetemi mentés külön “SQL insert”-ként
    const commitUni = async () => {
      if (!props.event?.id) return;
      saving.value = true;
      const id = props.event.id;
      const breakdown = buildBreakdown('uni');
      const payload = { breakdown, total: totalUni.value, pricingType: 'uni' };
      try {
        await postWithFallback(
          [
            `/api/kerveny/${id}/costs/commit-uni`,
            `/api/kerveny/${id}/costs/commit?type=uni`,
            `/api/kerveny/${id}/costs/commit`
          ],
          payload
        );
        saveState(id, 'uni');
        emit('refresh-events');
        emit('calculated', { event: props.event, breakdown, total: totalUni.value, pricingType: 'uni' });
      } catch (e) {
        error.value = e.message || 'Mentési hiba (Egyetemi)';
      } finally {
        saving.value = false;
      }
    };

    const buildBreakdown = (type) => {
      const arr = listFor(type);
      return arr.map(r => {
        const p = findPriceById(r.serviceId);
        return {
          pricingType: type,
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
    };

    const applyTab = async (type /* 'famulus' | 'uni' */) => {
      const breakdown = buildBreakdown(type);
      const payload = { breakdown, total: totalFor(type), pricingType: type };
      try {
        await saveAndAdvanceStatus(payload);      // csak az adott típus sorai kerülnek mentésre
        if (type === 'famulus') {
          await setStatusUFOfferPending();       // UF mentés után státusz mint eddig
        }
      } catch (e) {
        error.value = e.message || 'Mentési hiba';
        return;
      }

      const id = props.event?.id;
      if (id != null) saveState(id, type);

      if (type === 'famulus') {
        emit('status-updated', { id, statusz: TARGET_STATUS });
      }
      emit('refresh-events');
      emit('calculated', { event: props.event, breakdown, total: totalFor(type), pricingType: type });
    };

    const onServiceChange = (row) => {
      if (row?.serviceId == null) return;
      const p = findPriceById(row.serviceId);
      if (row?.pricingType === 'uni') {
        if (!p || !isUniCategory(p.category)) row.serviceId = null;
        return;
      }
      if (row?.pricingType === 'famulus') {
        if (!p || !isUfCategory(p.category)) row.serviceId = null;
      }
    };

    return {
      modal, loading, prices,
      rowsUf, rowsUni,
      addRowWithType, removeRow,
      getRowUnitPrice, getRowUnitText, getRowTotal,
      totalUf, totalUni, formatMoney,
      show, hide, error, onServiceChange,
      clearAllState, saving, filteredPricesFor,
      activeTab, applyTab, commitUf, commitUni,
      // <<< ezek hiányoztak
      showQuantity, showOccasions, showDays, showHours, showPersons
    };
  }
};
</script>

<style scoped>
/* opcionális: semmi extra nem szükséges, Bootstrap nav-tabs elég */

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