<template>
  <div class="wizard-modal" @click.self="$emit('close')">
    <div class="wizard-content" :key="viewKey">
      <div class="wizard-header">
        <h4 class="mb-0 d-flex align-items-center gap-2">
          <i class="fas fa-route"></i>
          <span>Jóváhagyási folyamat</span>
        </h4>
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <span class="status-badge" :class="statusClass" :title="statusCode">{{ statusLabel }}</span>
          <button class="pill-btn pill-secondary pill-sm" @click="$emit('close')" title="Bezárás">
            <i class="fas fa-times"></i><span class="label d-none d-sm-inline">Bezárás</span>
          </button>
        </div>
      </div>

      <div class="wizard-body">
        <!-- BEERKEZETT -->
        <section v-if="isStatus('BEERKEZETT')" class="flow-card">
          <h6 class="flow-title"><i class="fas fa-flag-checkered me-1"></i>Első lépés</h6>
          <p class="flow-note">Ebben a státuszban csak az Elfogadás és Elutasítás érhető el.</p>
          <div class="d-flex flex-wrap gap-2">
            <button class="pill-btn pill-success" :disabled="busy" @click="acceptUfQuote">
              <i class="fas fa-check-circle"></i><span>Elfogadás</span>
            </button>
            <button class="pill-btn pill-danger" :disabled="busy" @click="rejectEvent">
              <i class="fas fa-times-circle"></i><span>Elutasítás</span>
            </button>
          </div>
        </section>

        <!-- UF_ARAJANLATRA_VAR -->
        <section v-if="isStatus('UF_ARAJANLATRA_VAR')" class="flow-card">
          <h6 class="flow-title"><i class="fas fa-calculator me-1"></i>Uni‑Famulus árajánlat készítése</h6>
          <button
            class="pill-btn pill-primary"
            :disabled="busy || !canModifyUfInThisStatus"
            @click="openCalculator('famulus')">
            <i class="fas fa-play"></i><span>Kalkulátor (UF)</span>
          </button>
          <p v-if="!canModifyUfInThisStatus" class="text-danger mt-2 small">
            Ebben a státuszban Rendezvényszervező szerepkörrel nem módosítható.
          </p>
        </section>

        <!-- UF_ARAJANLAT_ELFOGADASARA_VAR -->
        <section v-if="isStatus('UF_ARAJANLAT_ELFOGADASARA_VAR')" class="flow-card">
          <h6 class="flow-title"><i class="fas fa-search-dollar me-1"></i>UF árajánlat ellenőrzése</h6>
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="small text-muted">Mentett UF ajánlat</span>
            <button class="pill-btn pill-light pill-sm" @click="fetchUfBreakdown" :disabled="loading.uf">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading.uf }"></i><span>Frissítés</span>
            </button>
          </div>
          <div v-if="loading.uf" class="text-muted small">Betöltés…</div>
          <div v-else-if="ufItems.length === 0" class="text-muted small">Még nincs mentett UF ajánlat.</div>
          <div v-else class="table-responsive mt-2">
            <table class="fancy-inner-table table-sm">
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
            <div class="text-end fw-bold total-line">UF összesen: {{ money(sum(ufItems)) }}</div>
          </div>

          <div class="d-flex flex-wrap gap-2 mt-3">
            <button class="pill-btn pill-warning" :disabled="busy" @click="onModifyChoice('uf')">
              <i class="fas fa-edit"></i><span>Módosítás kérése</span>
            </button>
            <button class="pill-btn pill-success" :disabled="busy" @click="acceptOfferFromFamulus">
              <i class="fas fa-check-double"></i><span>UF ajánlat elfogadása</span>
            </button>
          </div>
        </section>

        <!-- ARAJANLAT_KESZITESERE_VAR -->
        <section v-if="isStatus('ARAJANLAT_KESZITESERE_VAR')" class="flow-card">
          <h6 class="flow-title"><i class="fas fa-calculator me-1"></i>Egyetemi árajánlat készítése</h6>
          <button class="pill-btn pill-primary" :disabled="busy" @click="openCalculator('uni')">
            <i class="fas fa-play"></i><span>Kalkulátor (Egyetem)</span>
          </button>
        </section>

        <!-- ARAJANLAT_ELFOGADASRA_VAR -->
        <section v-if="isStatus('ARAJANLAT_ELFOGADASRA_VAR')" class="flow-card">
          <h6 class="flow-title"><i class="fas fa-search-dollar me-1"></i>Egyetemi ajánlat ellenőrzése</h6>
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="small text-muted">Mentett Egyetemi ajánlat</span>
            <button class="pill-btn pill-light pill-sm" @click="fetchUniBreakdown" :disabled="loading.uni">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading.uni }"></i><span>Frissítés</span>
            </button>
          </div>
          <div v-if="loading.uni" class="text-muted small">Betöltés…</div>
          <div v-else-if="uniItems.length === 0" class="text-muted small">Még nincs mentett Egyetemi ajánlat.</div>
          <div v-else class="table-responsive mt-2">
            <table class="fancy-inner-table table-sm">
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
            <div class="text-end fw-bold total-line">Egyetemi összesen: {{ money(sum(uniItems)) }}</div>
          </div>

          <hr class="my-4" />

          <h6 class="flow-title"><i class="fas fa-search-dollar me-1"></i>UF ajánlat ellenőrzése</h6>
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="small text-muted">Mentett UF ajánlat</span>
            <button class="pill-btn pill-light pill-sm" @click="fetchUfBreakdown" :disabled="loading.uf">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading.uf }"></i><span>Frissítés</span>
            </button>
          </div>
          <div v-if="loading.uf" class="text-muted small">Betöltés…</div>
          <div v-else-if="ufItems.length === 0" class="text-muted small">Még nincs mentett UF ajánlat.</div>
          <div v-else class="table-responsive mt-2">
            <table class="fancy-inner-table table-sm">
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
            <div class="text-end fw-bold total-line">UF összesen: {{ money(sum(ufItems)) }}</div>
          </div>

          <div class="d-flex flex-wrap gap-2 mt-3 align-items-center">
            <div class="d-inline-block">
              <button
                ref="modifyTrigger"
                class="pill-btn pill-warning"
                :disabled="busy"
                @click.stop="toggleModifyChoice">
                <i class="fas fa-edit"></i><span>Módosítás kérése</span>
              </button>
            </div>
            <button class="pill-btn pill-primary" :disabled="busy" @click="downloadUniversityDocx">
              <i class="fas fa-file-word"></i><span>DOCX generálása</span>
            </button>
            <button class="pill-btn pill-success" :disabled="busy" @click="acceptUniversityQuote">
              <i class="fas fa-check-double"></i><span>Árajánlat elfogadása</span>
            </button>
          </div>
        </section>
      </div>

      <div class="wizard-footer">
        <button
          class="pill-btn pill-danger"
          @click="cancelEvent"
          :disabled="cancelling"
          title="Rendezvény lemondása">
          <i v-if="!cancelling" class="fas fa-ban"></i>
          <i v-else class="fas fa-spinner fa-spin"></i>
          <span>Lemondás</span>
        </button>
      </div>
      <!-- Kalkulátor teleportok + indok modal változatlan -->
      <!-- ServiceCostCalculator eltávolítva -->
    </div>
  </div>

  <!-- Módosítás kérése – dropdown popover (teleportálva a body-ba) -->
  <teleport to="body">
    <div
      v-if="showModifyChoice"
      class="modify-popover"
      :style="modifyPopoverStyle"
      @click.stop
    >
      <div class="modify-popover-inner">
        <button class="pill-btn pill-light w-100 mb-1" :disabled="busy" @click="onModifyChoice('uni')">
          <i class="fas fa-university"></i><span>Egyetemi módosítása</span>
        </button>
        <button class="pill-btn pill-light w-100" :disabled="busy" @click="onModifyChoice('uf')">
          <i class="fas fa-users-cog"></i><span>UF módosítása</span>
        </button>
      </div>
    </div>
  </teleport>

  <!-- ÚJ: külön-külön kalkulátor modálok -->
  <teleport to="body">
    <UniFamulusCostCalculator
      v-if="showUfCalc"
      :event="event"
      @close="showUfCalc = false"
      @status-updated="onChildStatusUpdated"
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

  <!-- Módosítás indok modal -->
  <teleport to="body">
    <div v-if="showReasonModal" class="reason-modal-overlay" @click.self="closeReasonModal">
      <div class="reason-modal" role="dialog" aria-modal="true">
        <div class="reason-header">
          <h5 class="mb-0 d-flex align-items-center gap-2">
            <i class="fas fa-edit"></i><span>Módosítás indoklása</span>
          </h5>
          <button class="pill-btn pill-light pill-sm" @click="closeReasonModal" title="Bezárás">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="reason-body">
          <p class="small text-muted mb-2">
            Írd le röviden, miért kérsz módosítást. Az indok naplózásra kerül.
          </p>
          <textarea
            v-model="modositasiIndok"
            rows="5"
            class="reason-textarea"
            placeholder="Indok részletezése..."
            autofocus
          ></textarea>
        </div>
        <div class="reason-footer">
          <button class="pill-btn pill-light" @click="closeReasonModal">
            <i class="fas fa-arrow-left"></i><span>Mégse</span>
          </button>
          <button
            class="pill-btn pill-primary"
            :disabled="!modositasiIndok.trim() || busy"
            @click="saveReasonAndModify"
          >
            <i v-if="!busy" class="fas fa-save"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span>{{ busy ? 'Mentés...' : 'Mentés' }}</span>
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import axios from 'axios';
import UniFamulusCostCalculator from '@/components/UniFamulusCostCalculator.vue';
import UniversityCostCalculator from '@/components/UniversityCostCalculator.vue';
import auth from '@/services/auth';

export default {
  name: 'PricingFlowWizard',
  emits: ['close','refresh-events','status-updated'],
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
      // ÚJ: kulcs a komponens belforgatásához (újrarender)
      viewKey: 0,
      // ÚJ: külön kalkulátor modálok láthatósága
      showUfCalc: false,
      showUniCalc: false,
      showModifyChoice: false,
     modifyPos: { top: 0, left: 0, width: 240, below: true },
      showReasonModal: false,
      modositasiIndok: '',
      pendingModifyType: null,
      localEvent: { ...this.event },
      // Role flags
      isEventOrganizer: false,
      isUniFamulus: false
    };
  },
  watch: {
    event: {
      deep: true,
      immediate: true,
      handler(val) {
        this.localEvent = { ...val };
      }
    },
    statusCode: {
      immediate: true,
      handler(s) {
        if (s === 'UF_ARAJANLATRA_VAR') this.fetchUfBreakdown?.();
        if (s === 'UF_ARAJANLAT_ELFOGADASARA_VAR') this.fetchUfBreakdown?.();
        if (s === 'ARAJANLAT_ELFOGADASRA_VAR') {
          this.fetchUniBreakdown?.();
          this.fetchUfBreakdown?.(); // UF táblázat is jelenjen meg ebben a státuszban
        }
        // módosító menü elrejtése státuszváltáskor
        this.showModifyChoice = false;
      }
    }
  },
  computed: {
    statusCode() {
      const raw = this.statusOverride ?? (this.localEvent?.statusz ?? this.localEvent?.status ?? 'BEERKEZETT');
      return this.normalizeStatusCode(raw);
    },
    statusLabel() {
      const map = {
        BEERKEZETT: 'Beérkezett',
        UF_ARAJANLATRA_VAR: 'UF árajánlatra vár',
        UF_ARAJANLAT_ELFOGADASARA_VAR: 'UF árajánlat elfogadására vár',
        ARAJANLAT_KESZITESERE_VAR: 'Árajánlat készítésére vár',
        ARAJANLAT_ELFOGADASRA_VAR: 'Árajánlat elfogadásra vár',
        MEGVALOSITASRA_VAR: 'Megvalósításra vár'
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
    },
    // Rendezvényszervező ne tudja módosítani az UF_ARAJANLATRA_VAR státuszt
    canModifyUfInThisStatus() {
      return !(this.isEventOrganizer && this.statusCode === 'UF_ARAJANLATRA_VAR');
    },
    // Színezés: a korábbi logikához illeszkedő fázis és class
    statusPhase() {
      const s = this.statusCode;
      if (['UF_ARAJANLATRA_VAR', 'UF_ARAJANLAT_ELFOGADASARA_VAR', 'ARAJANLAT_KESZITESERE_VAR', 'ARAJANLAT_ELFOGADASRA_VAR'].includes(s)) {
        return 'szerzodes';
      }
      if (['MEGVALOSITASRA_VAR', 'MEGVALOSULASRA_VAR'].includes(s)) return 'megvalositas';
      if (['ELSZAMOLASRA_VAR'].includes(s)) return 'elszamolas';
      if (['LEZART', 'LEZARVA', 'ELUTASITVA', 'LEMONDVA'].includes(s)) return 'lezart';
      return 'beerkezett';
    },
    statusClass() {
      return `phase-${this.statusPhase}`;
    },
   modifyPopoverStyle() {
     const { top, left, width } = this.modifyPos || {};
     return {
       position: 'fixed',
       top: `${top}px`,
       left: `${left}px`,
       minWidth: `${Math.max(220, width)}px`,
       zIndex: 5000
     };
   }
  },
  async created() {
    try {
      const user = await auth.ensureAuthUser();
      this.isEventOrganizer = this.isRoleEventOrganizer(user?.role);
      this.isUniFamulus = this.isRoleUniFamulus(user?.role);
    } catch {
      this.isEventOrganizer = false;
      this.isUniFamulus = false;
    }
  },
  methods: {
    normalizeStatusCode(code) {
      const c = String(code || '').trim().toUpperCase();
      const aliases = {
        // backend alias -> front-end canonical
        MEGVALOSULASRA_VAR: 'MEGVALOSITASRA_VAR'
      };
      return aliases[c] || c;
    },
    isStatus(code) { return this.statusCode === code; },

    // Dropdown megnyitás/bezárás a "Módosítás kérése" gombhoz
    toggleModifyChoice() {
      if (this.showModifyChoice) {
        this.showModifyChoice = false;
        return;
      }
      this.positionModifyPopover();
      this.showModifyChoice = true;
    },
    hideModifyChoice() {
      this.showModifyChoice = false;
    },
    positionModifyPopover() {
      const el = this.$refs.modifyTrigger;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const margin = 6;
      const desiredWidth = Math.max(220, r.width);
      // Alap pozíció: gomb alá
      let top = r.bottom + margin;
      let left = r.left;
      // Jobb szélre igazítás, ha kilógna
      const maxLeft = window.innerWidth - desiredWidth - 8;
      if (left > maxLeft) left = Math.max(8, maxLeft);
      // Ha alul kilóg, nyissuk a gomb fölé
      const estimatedHeight = 94; // ~2 sor gomb + padding
      if (top + estimatedHeight > window.innerHeight) {
        top = Math.max(8, r.top - estimatedHeight - margin);
      }
      this.modifyPos = { top, left, width: r.width, below: top > r.top };
    },
    async onModifyChoice(type) {
      this.pendingModifyType = type;
      this.modositasiIndok = '';
      this.showReasonModal = true;
    },
    async saveReasonAndModify() {
      if (!this.localEvent?.id || !this.pendingModifyType) return;
      this.showReasonModal = false;
      this.showModifyChoice = false;
      this.busy = true;
      try {
        const res = await axios.patch(`http://localhost:3000/api/kerveny/${this.localEvent.id}`, {
          modositasi_indok: this.modositasiIndok,
          statusz: this.pendingModifyType === 'uf'
            ? 'UF_ARAJANLATRA_VAR'
            : 'ARAJANLAT_KESZITESERE_VAR'
        });
        if (res?.data) {
          this.localEvent = { ...res.data };
          // ugyanúgy frissít, mint a többi státuszváltó gomb
          this.statusOverride = res.data.statusz || res.data.status || null;
          this.$emit('status-updated', res.data);
          this.$emit('refresh-events');
        }
      } finally {
        this.busy = false;
        this.pendingModifyType = null;
        this.modositasiIndok = '';
      }
    },

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
        const desired = 'MEGVALOSITASRA_VAR';
        const r = await axios.patch(`http://localhost:3000/api/kerveny/${this.event.id}/status`, { statusz: desired });
         if (r.status === 200) {
          // ha a backend alias kódot küld vissza, normalizáljuk
          const returned = r.data?.statusz || r.data?.status || desired;
          const normalized = this.normalizeStatusCode(returned);
          this.statusOverride = normalized;
          this.$emit('status-updated', { ...this.event, statusz: normalized });
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
          // e-mail küldés: 3000-es backend API
          try {
            await axios.post('http://localhost:3000/api/email/cancel', {
              email: this.event?.email || this.event?.kapcsolattartoEmail || this.event?.szervezoEmail || '', // ha van
              felelos: this.event?.felelos || this.event?.szervezo || '',
              eventNev: this.event?.nev || this.event?.name || '',
              reason: 'A rendezvény lemondásra került.'
            });
          } catch (e) {
            console.warn('Lemondás e-mail küldése nem sikerült:', e?.response?.data || e.message);
          }
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

    isRoleEventOrganizer(roleStr) {
      const r = String(roleStr || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toUpperCase().replace(/[_-]/g, ' ').trim();
      return r === 'RENDEZVENYSZERVEZO' || r === 'RENDEZVENY SZERVEZO';
    },
    isRoleUniFamulus(roleStr) {
      const r = String(roleStr || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toUpperCase().replace(/[_-]/g, ' ').trim();
      return r === 'UF' || r === 'UNI FAMULUS' || r === 'UNIFAMULUS';
    },

    // ÚJ: a megfelelő kalkulátor modál megnyitása
    openCalculator(type) {
      // Rendezvényszervező nem nyithat UF kalkulátort ebben a státuszban
      if (type === 'famulus' && !this.canModifyUfInThisStatus) return;
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
      // mentsük el a VÁLTÁS ELŐTTI státuszt
      const prev = this.statusCode;
      const next = this.normalizeStatusCode(updated?.statusz || updated?.status || '');

      // azonnali UI frissítés a wizardban
      this.statusOverride = updated?.statusz || updated?.status || null;
      this.$emit('status-updated', updated);   // tovább a szülőnek (Table.vue)

      // UF Árajánlatra vár státuszban, Uni‑Famulus szerepkörnél: ha MÁS státuszra váltott, zárjuk a komponenst
      if (this.isUniFamulus && prev === 'UF_ARAJANLATRA_VAR' && next && next !== prev) {
        this.$emit('close');
      }
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
    closeReasonModal() {
    this.showReasonModal = false;
    this.modositasiIndok = '';
    this.pendingModifyType = null;
    this.showModifyChoice = false;
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
  },
  mounted() {
    document.addEventListener('click', this.hideModifyChoice);
    window.addEventListener('resize', this.positionModifyPopover);
    window.addEventListener('scroll', this.hideModifyChoice, true);
+   window.addEventListener('keydown', this.onGlobalKeydown);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.hideModifyChoice);
    window.removeEventListener('resize', this.positionModifyPopover);
    window.removeEventListener('scroll', this.hideModifyChoice, true);
+   window.removeEventListener('keydown', this.onGlobalKeydown);
  }
};
</script>

<style scoped>
/* --- Modal keret --- */
.wizard-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4000; /* magasabb, hogy minden felett legyen */
}
.wizard-content {
  background: #fff;
  width: 96%;
  max-width: 1400px;
  max-height: 92vh;
  border-radius: 26px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 18px 40px -18px rgba(0,0,0,.35), 0 8px 18px -10px rgba(0,0,0,.2);
  position: relative;
}
.wizard-content::before {
  content:'';
  position:absolute;
  inset:0;
  border-radius:26px;
  pointer-events:none;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.7), inset 0 0 0 2px rgba(0,0,0,.03);
}
.wizard-header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:14px 20px;
  background: linear-gradient(135deg,#5a9cff 0%,#0d6efd 60%,#0b5ed7 100%);
  color:#fff;
  position:sticky;
  top:0;
  z-index:5;
}
.wizard-body {
  padding:18px 20px 24px;
  overflow:auto;
  background:#f7f9ff;
}

/* --- Flow kártyák --- */
.flow-card {
  background:#fff;
  border:1px solid #e3ebf7;
  border-radius:22px;
  padding:16px 18px;
  margin-bottom:18px;
  box-shadow:0 6px 14px -8px rgba(0,0,0,.18);
  transition:.18s;
}
.flow-card:hover {
  transform:translateY(-2px);
  box-shadow:0 10px 22px -10px rgba(0,0,0,.25);
}
.flow-title {
  font-size:.9rem;
  font-weight:700;
  letter-spacing:.3px;
  margin:0 0 .35rem;
  display:flex;
  align-items:center;
}
.flow-note {
  font-size:.7rem;
  margin:0 0 .75rem;
  color:#536274;
}

/* --- Inner tables --- */
.fancy-inner-table {
  width:100%;
  border-collapse:separate;
  border-spacing:0;
  font-size:.7rem;
  background:#fff;
  border-radius:16px;
  overflow:hidden;
}
.fancy-inner-table thead th {
  background:#eef4ff;
  color:#24415f;
  font-weight:700;
  padding:.45rem .55rem;
  border:none;
  border-bottom:1px solid #d7e3f5;
  text-transform:uppercase;
  font-size:.6rem;
  letter-spacing:.4px;
}
.fancy-inner-table tbody td {
  padding:.45rem .55rem;
  border-bottom:1px solid #eef2f7;
  background:#fff;
}
.fancy-inner-table tbody tr:last-child td { border-bottom:none; }
.total-line { font-size:.65rem; margin-top:.35rem; }

/* --- “Módosítás kérése” popover (új dizájn, mindig felül) --- */
.modify-popover {
  position: fixed;
  z-index: 5000;
  padding: 6px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #d7e3f5;
  box-shadow: 0 12px 28px -10px rgba(0,0,0,.25), 0 6px 14px -10px rgba(0,0,0,.12);
}
.modify-popover-inner {
  display: flex;
  flex-direction: column;
}
.modify-popover .pill-btn {
  justify-content: flex-start;
}
.modify-popover .pill-btn i {
  width: 1rem;
  text-align: center;
}
:deep(.dark) .modify-popover {
  background:#1f2431;
  border-color:#303a49;
  box-shadow: 0 14px 30px -12px rgba(0,0,0,.6);
}

/* ===== Módosítás indok modal (új dizájn) ===== */
.reason-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,25,40,.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 6000;
  padding: 24px 18px;
}
.reason-modal {
  background: #fff;
  width: 100%;
  max-width: 520px;
  border-radius: 26px;
  box-shadow: 0 18px 40px -18px rgba(0,0,0,.4), 0 8px 20px -10px rgba(0,0,0,.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
.reason-modal::before {
  content:'';
  position:absolute;
  inset:0;
  border-radius:26px;
  pointer-events:none;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.65), inset 0 0 0 2px rgba(0,0,0,.04);
}
.reason-header {
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:14px 16px;
  background: linear-gradient(135deg,#5a9cff 0%,#0d6efd 60%,#0b5ed7 100%);
  color:#fff;
}
.reason-header h5 {
  font-size:1rem;
  font-weight:700;
  margin:0;
  letter-spacing:.3px;
}
.reason-body {
  padding:16px 16px 6px;
  background:#f7f9ff;
}
.reason-textarea {
  width:100%;
  resize:vertical;
  border:1px solid #c3d6f1;
  border-radius:18px;
  padding:.75rem .9rem;
  font-size:.78rem;
  font-weight:500;
  letter-spacing:.25px;
  background:#fff;
  outline:none;
  transition:.18s;
  min-height:150px;
}
.reason-textarea:focus {
  border-color:#0d6efd;
  box-shadow:0 0 0 3px rgba(13,110,253,.15);
}
.reason-footer {
  display:flex;
  justify-content:flex-end;
  gap:.55rem;
  padding:12px 16px 16px;
  background:#fff;
}
@media (max-width: 576px) {
  .reason-modal { max-width:100%; border-radius:22px; }
  .reason-textarea { font-size:.72rem; }
  .reason-header h5 { font-size:.9rem; }
}
:deep(.dark) .reason-modal {
  background:#1f2330;
}
:deep(.dark) .reason-body { background:#242c3b; }
:deep(.dark) .reason-textarea {
  background:#1f2431;
  border-color:#394454;
  color:#dbe6f4;
}
:deep(.dark) .reason-textarea:focus {
  border-color:#3a8bff;
  box-shadow:0 0 0 3px rgba(58,139,255,.25);
}
:deep(.dark) .reason-header {
  background: linear-gradient(135deg,#3a4d9d 0%,#273b84 60%,#1d2e6c 100%);
}

/* --- Pill gombok --- */
.pill-btn {
  --base:#0d6efd;
  display:inline-flex;
  align-items:center;
  gap:.45rem;
  padding:.5rem 1rem;
  font-size:.7rem;
  font-weight:700;
  letter-spacing:.3px;
  border-radius:999px;
  border:1px solid transparent;
  background:#fff;
  color:#24415f;
  transition:.18s;
  line-height:1;
  text-transform:none;
  white-space:nowrap;
}
.pill-btn i { font-size:.9rem; }
.pill-btn:hover { transform:translateY(-1px); }
.pill-btn:active { transform:translateY(0); }
.pill-btn[disabled] { opacity:.55; cursor:not-allowed; }

.pill-sm { padding:.35rem .7rem; font-size:.62rem; }
.pill-sm i { font-size:.75rem; }

.pill-primary {
  background: linear-gradient(135deg,#3a8bff 0%,#0d6efd 45%,#0b58d0 100%);
  color:#fff;
  border-color:#0d6efd;
  box-shadow:0 3px 6px -2px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.12);
}
.pill-primary:hover {
  background: linear-gradient(135deg,#5a9cff 0%,#0b5ed7 55%,#0a4fb6 100%);
  box-shadow:0 4px 10px -3px rgba(0,0,0,.35);
}

.pill-secondary {
  background:#6c757d;
  color:#fff;
  border-color:#6c757d;
  box-shadow:0 3px 6px -2px rgba(0,0,0,.25);
}
.pill-secondary:hover { filter:brightness(.95); }

.pill-success {
  background:#37b457;
  color:#fff;
  border-color:#37b457;
  box-shadow:0 3px 6px -2px rgba(0,0,0,.25);
}
.pill-success:hover { filter:brightness(1.05); }

.pill-danger {
  background:#d9534f;
  color:#fff;
  border-color:#d9534f;
  box-shadow:0 3px 6px -2px rgba(0,0,0,.25);
}
.pill-danger:hover { filter:brightness(1.05); }

.pill-warning {
  background:#ffb23a;
  color:#5d4100;
  border-color:#ffb23a;
  box-shadow:0 3px 6px -2px rgba(0,0,0,.25);
}
.pill-warning:hover { filter:brightness(1.07); }

.pill-light {
  background:#f5f8ff;
  color:#0d6efd;
  border-color:#d7e3f5;
  box-shadow:0 2px 6px -3px rgba(0,0,0,.12);
}
.pill-light:hover {
  background:#eef4ff;
  border-color:#b6cff5;
}

.pill-btn.pill-danger:disabled,
.pill-btn.pill-success:disabled,
.pill-btn.pill-warning:disabled,
.pill-btn.pill-primary:disabled { filter:grayscale(.3); }

.status-badge {
  display:inline-flex;
  align-items:center;
  gap:.4rem;
  padding:.35rem .65rem;
  border-radius:14px;
  font-size:.6rem;
  font-weight:700;
  letter-spacing:.4px;
  background:rgba(255,255,255,.18);
  color:#fff;
}

.phase-beerkezett   { background:#ffe0e3; color:#9d1d30; }
.phase-szerzodes    { background:#fde8cc; color:#a65f00; }
.phase-megvalositas { background:#d8eefc; color:#05537a; }
.phase-elszamolas   { background:#e1f5e8; color:#1f6d3f; }
.phase-lezart       { background:#e0e0e0; color:#555; }

.wizard-footer {
  display:flex;
  justify-content:flex-end;
  padding:12px 18px;
  border-top:1px solid #e3ebf7;
  background:#fff;
  position:sticky;
  bottom:0;
  z-index:4;
}

/* Módosítás indok modal gombok */
.modal-dialog { border-radius:20px; }
.modal-dialog .btn,
.modal-dialog .pill-btn { font-size:.65rem; }

/* Sötét mód */
.dark-mode .wizard-content { background:#1f2330; }
.dark-mode .wizard-content::before { box-shadow: inset 0 0 0 1px rgba(255,255,255,.08), inset 0 0 0 2px rgba(255,255,255,.03); }
.dark-mode .wizard-header {
  background: linear-gradient(135deg,#3a4d9d 0%,#273b84 60%,#1d2e6c 100%);
}
.dark-mode .wizard-body { background:#242c3b; }
.dark-mode .flow-card { background:#1f2431; border-color:#303a49; box-shadow:0 6px 16px -8px rgba(0,0,0,.55); }
.dark-mode .flow-card:hover { box-shadow:0 10px 24px -10px rgba(0,0,0,.65); }
.dark-mode .fancy-inner-table thead th { background:#2a3242; color:#cdd9e6; border-bottom-color:#3a4455; }
.dark-mode .fancy-inner-table tbody td { background:#1f2431; border-bottom-color:#2d3645; color:#dbe6f4; }
.dark-mode .pill-light { background:#262d3d; border-color:#394454; color:#aecdff; }
.dark-mode .pill-light:hover { background:#2d3647; border-color:#4a5669; }
.dark-mode .wizard-footer { background:#1f2330; border-top-color:#303a49; }
.dark-mode .status-badge { background:rgba(255,255,255,.15); }

/* Reszponzív */
@media (max-width: 768px) {
  .wizard-header { flex-wrap:wrap; gap:.6rem; }
  .flow-card { padding:14px 14px; border-radius:18px; }
  .pill-btn { font-size:.63rem; padding:.42rem .75rem; }
  .pill-sm { padding:.3rem .55rem; font-size:.55rem; }
  .wizard-body { padding:14px 14px 18px; }
}
</style>