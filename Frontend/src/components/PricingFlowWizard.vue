<template>
  <div class="wizard-modal" @click.self="$emit('close')">
    <div class="wizard-content">
      <div class="wizard-header">
        <h4 class="mb-0">Jóváhagyási folyamat</h4>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-secondary">{{ statusLabel }}</span>
          <button class="btn btn-sm btn-outline-secondary" @click="$emit('close')">Bezárás</button>
        </div>
      </div>

      <div class="wizard-body">
        <!-- 1) Beérkezett: csak elfogadás/elutasítás -->
        <section v-if="isStatus('BEERKEZETT')" class="mb-4">
          <h6>Első lépés</h6>
          <p>Ebben a státuszban csak az Elfogadás és Elutasítás érhető el.</p>
          <div class="d-flex gap-2">
            <button class="btn btn-success" :disabled="busy" @click="acceptUfQuote">Elfogadás</button>
            <button class="btn btn-danger" :disabled="busy" @click="rejectEvent">Elutasítás</button>
          </div>
        </section>

        <!-- 2) UF_ARAJANLATRA_VAR: UF kalkulátor -->
        <section v-if="isStatus('UF_ARAJANLATRA_VAR')" class="mb-4">
          <h6>Uni‑Famulus árajánlat készítése</h6>
          <button class="btn btn-outline-primary" :disabled="busy" @click="openCalculator('famulus')">
            Kalkulátor megnyitása (Uni‑Famulus)
          </button>
        </section>

        <!-- 2/b) UF Árajánlat elfogadásra vár: az UF előnézeti tábla IDE került -->
        <section v-if="isStatus('UF_ARAJANLAT_ELFOGADASARA_VAR')" class="mb-4">
          <h6>Uni‑Famulus árajánlat ellenőrzése</h6>
          <div class="d-flex align-items-center gap-2">
            <span>Mentett UF ajánlat</span>
            <button class="btn btn-sm btn-outline-secondary" @click="fetchUfBreakdown" :disabled="loading.uf">Frissítés</button>
          </div>
          <div v-if="loading.uf" class="text-muted mt-2">Betöltés…</div>
          <div v-else-if="ufItems.length === 0" class="text-muted mt-2">Még nincs mentett UF ajánlat.</div>
          <div v-else class="table-responsive mt-2">
            <table class="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>Megnevezés</th>
                  <th>M.e.</th>
                  <th v-if="visibleUfCols.hours">Óra</th>
                  <th v-if="visibleUfCols.persons">Fő</th>
                  <th v-if="visibleUfCols.days">Nap</th>
                  <th v-if="visibleUfCols.occasions">Alkalom</th>
                  <th v-if="visibleUfCols.quantity">Darab</th>
                  <th>Egység ár</th>
                  <th>Összesen</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in ufItems" :key="r.id">
                  <td>{{ r.service_name }}</td>
                  <td>{{ r.unit }}</td>
                  <td v-if="visibleUfCols.hours">{{ z(derivedUf(r).hours) }}</td>
                  <td v-if="visibleUfCols.persons">{{ z(derivedUf(r).persons) }}</td>
                  <td v-if="visibleUfCols.days">{{ z(derivedUf(r).days) }}</td>
                  <td v-if="visibleUfCols.occasions">{{ z(derivedUf(r).occasions) }}</td>
                  <td v-if="visibleUfCols.quantity">{{ z(derivedUf(r).quantity) }}</td>
                  <td>{{ money(r.unit_price) }}</td>
                  <td>{{ money(r.line_total) }}</td>
                </tr>
              </tbody>
            </table>
            <div class="text-end fw-bold">UF összesen: {{ money(sum(ufItems)) }}</div>
          </div>

          <div class="d-flex gap-2 mt-3">
            <button class="btn btn-warning" :disabled="busy" @click="requestUfOfferChange">Módosítás kérése</button>
            <button class="btn btn-success" :disabled="busy" @click="acceptOfferFromFamulus">UF árajánlat elfogadása</button>
          </div>
        </section>

        <!-- 3) Árajánlat készítésére vár: Egyetemi kalkulátor -->
        <section v-if="isStatus('ARAJANLAT_KESZITESERE_VAR')" class="mb-4">
          <h6>Egyetemi árajánlat készítése</h6>
          <button class="btn btn-outline-primary" :disabled="busy" @click="openCalculator('uni')">
            Kalkulátor megnyitása (Egyetem)
          </button>
        </section>

        <!-- 4) Árajánlat elfogadásra vár: egyetemi ajánlat áttekintése -->
        <section v-if="isStatus('ARAJANLAT_ELFOGADASRA_VAR')" class="mb-4">
          <h6>Egyetemi árajánlat ellenőrzése</h6>
          <div class="d-flex align-items-center gap-2">
            <span>Mentett Egyetemi ajánlat</span>
            <button class="btn btn-sm btn-outline-secondary" @click="fetchUniBreakdown" :disabled="loading.uni">Frissítés</button>
          </div>
          <div v-if="loading.uni" class="text-muted mt-2">Betöltés…</div>
          <div v-else-if="uniItems.length === 0" class="text-muted mt-2">Még nincs mentett Egyetemi ajánlat.</div>
          <div v-else class="table-responsive mt-2">
            <table class="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>Megnevezés</th>
                  <th>M.e.</th>
                  <th v-if="visibleUniCols.hours">Óra</th>
                  <th v-if="visibleUniCols.persons">Fő</th>
                  <th v-if="visibleUniCols.days">Nap</th>
                  <th v-if="visibleUniCols.occasions">Alkalom</th>
                  <th v-if="visibleUniCols.quantity">Darab</th>
                  <th>Egység ár</th>
                  <th>Összesen</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in uniItems" :key="r.id">
                  <td>{{ r.service_name }}</td>
                  <td>{{ r.unit }}</td>
                  <td v-if="visibleUniCols.hours">{{ z(derivedUni(r).hours) }}</td>
                  <td v-if="visibleUniCols.persons">{{ z(derivedUni(r).persons) }}</td>
                  <td v-if="visibleUniCols.days">{{ z(derivedUni(r).days) }}</td>
                  <td v-if="visibleUniCols.occasions">{{ z(derivedUni(r).occasions) }}</td>
                  <td v-if="visibleUniCols.quantity">{{ z(derivedUni(r).quantity) }}</td>
                  <td>{{ money(r.unit_price) }}</td>
                  <td>{{ money(r.line_total) }}</td>
                </tr>
              </tbody>
            </table>
            <div class="text-end fw-bold">Egyetemi összesen: {{ money(sum(uniItems)) }}</div>
          </div>

          <div class="d-flex gap-2 mt-3">
            <button class="btn btn-warning" :disabled="busy" @click="requestUniversityOfferChange">Módosítás kérése</button>
            <button class="btn btn-success" :disabled="busy" @click="downloadUniversityDocx">Egyetemi árajánlat (DOCX)</button>
          </div>
        </section>
      </div>

      <div class="wizard-footer">
        <button class="btn btn-danger" @click="cancelEvent" :disabled="cancelling" title="Rendezvény lemondása (státusz: Lemondva)">
          <i v-if="!cancelling" class="fas fa-ban me-1"></i>
          <i v-else class="fas fa-spinner fa-spin me-1"></i>
          Lemondás
        </button>
      </div>

      <!-- ServiceCostCalculator eltávolítva -->
    </div>
  </div>

  <!-- ÚJ: külön-külön kalkulátor modálok -->
  <teleport to="body">
    <UniFamulusCostCalculator
      v-if="showUfCalc"
      :event="event"
      @close="showUfCalc = false"
      @status-updated="$emit('status-updated', $event)"
      @refresh-events="$emit('refresh-events')"
    />
  </teleport>
  <teleport to="body">
    <UniversityCostCalculator
      v-if="showUniCalc"
      :event="event"
      @close="showUniCalc = false"
      @refresh-events="$emit('refresh-events')"
      @status-updated="onChildStatusUpdated"
    />
  </teleport>
</template>

<script>
import axios from 'axios';
import UniFamulusCostCalculator from '@/components/UniFamulusCostCalculator.vue';
import UniversityCostCalculator from '@/components/UniversityCostCalculator.vue';

export default {
  name: 'PricingFlowWizard',
  components: { UniFamulusCostCalculator, UniversityCostCalculator },
  props: { event: { type: Object, required: true } },
  data() {
    return {
      busy: false,
      ufItems: [],
      uniItems: [],
      loading: { uf: false, uni: false },
      cancelling: false,
      statusOverride: null,
      // ÚJ: külön kalkulátor modálok láthatósága
      showUfCalc: false,
      showUniCalc: false
    };
  },
  computed: {
    statusCode() {
      const raw = this.statusOverride ?? (this.event?.statusz ?? this.event?.status ?? 'BEERKEZETT');
      return String(raw).trim().toUpperCase();
    },
    statusLabel() {
      const map = {
        BEERKEZETT: 'Beérkezett',
        UF_ARAJANLATRA_VAR: 'UF árajánlatra vár',
        UF_ARAJANLAT_ELFOGADASARA_VAR: 'UF árajánlat elfogadására vár',
        ARAJANLAT_KESZITESERE_VAR: 'Árajánlat készítésére vár',
        ARAJANLAT_ELFOGADASRA_VAR: 'Árajánlat elfogadásra vár'
      };
      return map[this.statusCode] || this.statusCode;
    },
    // Oszlopláthatóság a mértékegység alapján (nem az érték alapján)
    visibleUfCols() {
      const it = this.ufItems || [];
      const acc = { hours:false, persons:false, days:false, occasions:false, quantity:false };
      for (const r of it) {
        const c = this.columnsForUnit(this.normalizeUnit(r?.unit));
        acc.hours ||= c.hours;
        acc.persons ||= c.persons;
        acc.days ||= c.days;
        acc.occasions ||= c.occasions;
        acc.quantity ||= c.quantity;
      }
      return acc;
    },
    visibleUniCols() {
      const it = this.uniItems || [];
      const acc = { hours:false, persons:false, days:false, occasions:false, quantity:false };
      for (const r of it) {
        const c = this.columnsForUnit(this.normalizeUnit(r?.unit));
        acc.hours ||= c.hours;
        acc.persons ||= c.persons;
        acc.days ||= c.days;
        acc.occasions ||= c.occasions;
        acc.quantity ||= c.quantity;
      }
      return acc;
    }
  },
  watch: {
    statusCode: {
      immediate: true,
      handler(s) {
        if (s === 'UF_ARAJANLATRA_VAR') this.fetchUfBreakdown?.();
        if (s === 'UF_ARAJANLAT_ELFOGADASARA_VAR') this.fetchUfBreakdown?.();
        if (s === 'ARAJANLAT_ELFOGADASRA_VAR') this.fetchUniBreakdown?.();
      }
    }
  },
  methods: {
    isStatus(code) { return this.statusCode === code; },

    // UF lépés státuszok – meglévő logikával
    async acceptUfQuote() {
      if (!this.event?.id || this.busy) return;
      this.busy = true;
      try {
        const newStatus = 'UF_ARAJANLATRA_VAR';
        const r = await axios.patch(`http://localhost:3000/api/kerveny/${this.event.id}/status`, { statusz: newStatus });
        if (r.status === 200) {
          this.statusOverride = newStatus;            // azonnali UI frissítés
          this.$emit('status-updated', { ...this.event, statusz: newStatus });
          this.$emit('refresh-events');
        }
      } finally { this.busy = false; }
    },
    async rejectEvent() {
      if (!this.event?.id || this.busy) return;
      this.busy = true;
      try {
        const newStatus = 'ELUTASITVA';
        const r = await axios.patch(`http://localhost:3000/api/kerveny/${this.event.id}/status`, { statusz: newStatus });
        if (r.status === 200) {
          this.statusOverride = newStatus;
          this.$emit('status-updated', { ...this.event, statusz: newStatus });
          this.$emit('refresh-events');
        }
      } finally { this.busy = false; }
    },

    // UF: visszadobás szerkesztésre
    async requestUfOfferChange() {
      if (!this.event?.id || this.busy) return;
      this.busy = true;
      try {
        const newStatus = 'UF_ARAJANLATRA_VAR';
        const r = await axios.patch(`http://localhost:3000/api/kerveny/${this.event.id}/status`, { statusz: newStatus });
        if (r.status === 200) {
          this.statusOverride = newStatus;
          this.$emit('status-updated', { ...this.event, statusz: newStatus });
          this.$emit('refresh-events');
        }
      } finally { this.busy = false; }
    },

    // már létező: UF elfogadás → Árajánlat készítésére vár
    async acceptOfferFromFamulus() {
      if (!this.event?.id || this.busy) return;
      this.busy = true;
      try {
        const newStatus = 'ARAJANLAT_KESZITESERE_VAR';
        const r = await axios.patch(`http://localhost:3000/api/kerveny/${this.event.id}/status`, { statusz: newStatus });
        if (r.status === 200) {
          this.statusOverride = newStatus;
          this.$emit('status-updated', { ...this.event, statusz: newStatus });
          this.$emit('refresh-events');
        }
      } finally { this.busy = false; }
    },

    // Egyetem lépés státuszok – generálás gomb NEM kell, csak kalkulátor és a többi lépés marad

    async requestUniversityOfferChange() {
      if (!this.event?.id || this.busy) return;
      this.busy = true;
      try {
        const newStatus = 'ARAJANLAT_KESZITESERE_VAR';
        const r = await axios.patch(`http://localhost:3000/api/kerveny/${this.event.id}/status`, { statusz: newStatus });
        if (r.status === 200) {
          this.statusOverride = newStatus;
          this.$emit('status-updated', { ...this.event, statusz: newStatus });
          this.$emit('refresh-events');
        }
      } finally { this.busy = false; }
    },
    async acceptUniversityQuote() {
      if (!this.event?.id || this.busy) return;
      this.busy = true;
      try {
        const newStatus = 'SZERZODES_ALAIRVA'; // ha más a végső státusz, cseréld
        const r = await axios.patch(`http://localhost:3000/api/kerveny/${this.event.id}/status`, { statusz: newStatus });
        if (r.status === 200) {
          this.statusOverride = newStatus;
          this.$emit('status-updated', { ...this.event, statusz: newStatus });
          this.$emit('refresh-events');
        }
      } finally { this.busy = false; }
    },

    // Lemondás: minden státuszban elérhető, csak státuszváltás (nincs e-mail)
    async cancelEvent() {
      if (!this.event?.id || this.cancelling) return;
      this.cancelling = true;
      try {
        const newStatus = 'LEMONDVA';
        const r = await axios.patch(`http://localhost:3000/api/kerveny/${this.event.id}/status`, { statusz: newStatus });
        if (r.status === 200) {
          this.statusOverride = newStatus;
          this.$emit('status-updated', { ...this.event, statusz: newStatus });
          this.$emit('refresh-events');
        }
      } finally { this.cancelling = false; }
    },

    // Breakdown betöltések
    async fetchUfBreakdown() {
      if (!this.event?.id) return;
      this.loading.uf = true;
      try {
        const r = await axios.get(`http://localhost:3000/api/kerveny/famulus/${this.event.id}`);
        const rows = Array.isArray(r.data) ? r.data : [];
        this.ufItems = rows.map(this.normalizeRow);
      } finally { this.loading.uf = false; }
    },
    async fetchUniBreakdown() {
      if (!this.event?.id) return;
      this.loading.uni = true;
      try {
        const r = await axios.get(`http://localhost:3000/api/kerveny/egyetem/${this.event.id}`);
        const rows = Array.isArray(r.data) ? r.data : [];
        this.uniItems = rows.map(this.normalizeRow);
      } finally { this.loading.uni = false; }
    },

    // ÚJ: a megfelelő kalkulátor modál megnyitása
    openCalculator(type) {
      if (type === 'famulus') {
        this.showUfCalc = true;
      } else {
        this.showUniCalc = true;
      }
    },

    // Formázók
    z(v) { const n = Number(v); return Number.isFinite(n) ? (Number.isInteger(n) ? n : n.toFixed(2)) : ''; },
    money(v) { const n = Number(v) || 0; return n.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
    sum(arr) { return (arr || []).reduce((s, r) => s + (Number(r.line_total) || 0), 0); },

    onChildStatusUpdated(updated) {
      // azonnali UI frissítés a wizardban
      this.statusOverride = updated?.statusz || updated?.status || null;
      this.$emit('status-updated', updated);   // tovább a szülőnek (Table.vue)
    },
    // Mértékegység → oszlopok (ugyanúgy, mint fő/óra)
    columnsForUnit(u) {
      const s = String(u || '').toLowerCase();
      const has = (t) => s.includes(t);
      const isPerHour = has('fo/ora') || (has('fo') && has('ora')); // fő/óra
      const hasDbAlkalom = has('db/alkalom');
      return {
        hours: isPerHour || has('ora'),
        persons: isPerHour || (has('fo') && !has('fo/ora')),
        days: has('nap'),
        occasions: has('alkalom'),
        quantity: hasDbAlkalom || (has('db') && !hasDbAlkalom)
      };
    },

    // Biztonságos szám konverzió
    num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; },

    // Sor normalizálása: kulcsok egységesítése és szám konverzió
    normalizeRow(row = {}) {
      const pick = (obj, keys) => {
        // 1) direkt kulcs
        for (const k of keys) if (obj[k] !== undefined) return obj[k];
        // 2) case-insensitive egyezés
        const lc = Object.keys(obj).reduce((m, k) => (m[k.toLowerCase()] = k, m), {});
        for (const k of keys) {
          const real = lc[k.toLowerCase()];
          if (real) return obj[real];
        }
        return undefined;
      };
      return {
        ...row,
        unit: pick(row, ['unit']) ?? '',
        hours: this.num(pick(row, ['hours','hour','ora'])),
        persons: this.num(pick(row, ['persons','person','fo','people'])),
        days: this.num(pick(row, ['days','nap'])),
        occasions: this.num(pick(row, ['occasions','occasion','alkalom'])),
        quantity: this.num(pick(row, ['quantity','db','darab']))
      };
    },

    // Első létező mező kiolvasása több lehetséges kulcs közül (case-insensitive)
    getNumField(row = {}, keys) {
      // 1) direkt egyezés
      for (const k of keys) {
        if (row[k] !== undefined) return this.num(row[k]);
      }
      // 2) case-insensitive egyezés
      const entries = Object.entries(row);
      for (const wanted of keys) {
        const hit = entries.find(([k]) => k.toLowerCase() === wanted.toLowerCase());
        if (hit) return this.num(hit[1]);
      }
      return 0;
    },

    // Egyetemi sor derivált értékei – közvetlen, több kulcsot kezelő leképezés
    derivedUni(r) {
      const u = this.normalizeUnit(r?.unit);
      const c = this.columnsForUnit(u);
      return {
        hours:     c.hours     ? this.getNumField(r, ['hours', 'ora']) : 0,
        persons:   c.persons   ? this.getNumField(r, ['persons', 'fo', 'people']) : 0,
        days:      c.days      ? this.getNumField(r, ['days', 'nap']) : 0,
        occasions: c.occasions ? this.getNumField(r, ['occasions', 'occasion', 'alkalom']) : 0,
        quantity:  c.quantity  ? this.getNumField(r, ['quantity', 'darab', 'db']) : 0
      };
    },

    // UF sor derivált értékei – ugyanaz az elv
    derivedUf(r) {
      const u = this.normalizeUnit(r?.unit);
      const c = this.columnsForUnit(u);
      return {
        hours:     c.hours     ? this.getNumField(r, ['hours', 'ora']) : 0,
        persons:   c.persons   ? this.getNumField(r, ['persons', 'fo', 'people']) : 0,
        days:      c.days      ? this.getNumField(r, ['days', 'nap']) : 0,
        occasions: c.occasions ? this.getNumField(r, ['occasions', 'occasion', 'alkalom']) : 0,
        quantity:  c.quantity  ? this.getNumField(r, ['quantity', 'darab', 'db']) : 0
      };
    },

    // Mértékegység normalizálása (kisbetű, ékezetek nélkül)
    normalizeUnit(u) {
      return String(u || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    },
    async downloadUniversityDocx() {
      if (!this.event?.id || this.busy) return;
      this.busy = true;
      try {
        const url = `http://localhost:3000/api/kerveny/egyetem/${this.event.id}/docx`;
        const res = await axios.get(url, { responseType: 'blob' });
        const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `egyetemi-ajanlat-${this.event.id}.docx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } finally { this.busy = false; }
    }
  }
};
</script>

<style scoped>
.wizard-modal {
  position: fixed; inset: 0; background: rgba(0,0,0,.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
}
.wizard-content {
  background: #fff; width: 96%; max-width: 1400px; max-height: 92vh;
  border-radius: 10px; display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,.25);
}
.wizard-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; border-bottom: 1px solid #e5e7eb; background: #f8f9fa;
}
.wizard-body { padding: 12px 16px; overflow: auto; }
/* ÚJ: lábléc a jobb alsó sarokhoz igazítva */
.wizard-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}
</style>