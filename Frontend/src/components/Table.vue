<template>
  <div :class="['container-fluid pt-4 px-4 table-container']">
    <div class="bg-light text-center rounded p-4">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h6 class="mb-0">Rendezvények</h6>
      </div>

      <!-- ÚJ: kategória státusz szűrő gombok -->
      <FilterButtons
        :events="events"
        @filter-status="handleStatusCodes"
        class="mb-3"
      />

      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Betöltés...</span>
        </div>
        <p class="mt-2">Adatok betöltése...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div v-else class="table-wrapper">
        <div class="table-filters mb-3 d-flex flex-wrap gap-2">
          <!-- Keresőmező -->
          <input
            type="text"
            id="filter-name"
            class="form-control form-control-sm flex-grow-1"
            placeholder="Keresés minden adatban"
            v-model="filters.name"
          />

          <!-- Kezdő dátum szűrő -->
          <input
            type="date"
            id="filter-start-date"
            class="form-control form-control-sm"
            v-model="filters.startDate"
          />

          <!-- Helyszín szűrő -->
          <select
            id="filter-location"
            class="form-select form-select-sm"
            v-model="filters.location"
          >
            <option value="">Összes helyszín</option>
            <option v-for="location in uniqueLocations" :key="location" :value="location">
              {{ location }}
            </option>
          </select>

          <!-- Típus szűrő -->
          <select
            id="filter-type"
            class="form-select form-select-sm"
            v-model="filters.type"
          >
            <option value="">Összes típus</option>
            <option v-for="type in uniqueTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>

        <div class="table-scrollable">
          <table class="table text-start align-middle table-bordered table-hover mb-0">
            <thead>
              <tr class="text-dark">
                <th scope="col" @click="sortBy('statusz')" class="sortable-header">
                  Státusz
                  <i v-if="sortColumn === 'statusz'" :class="getSortIconClass()"></i>
                </th>
                <th scope="col" @click="sortBy('nev')" class="sortable-header">
                  Neve
                  <i v-if="sortColumn === 'nev'" :class="getSortIconClass()"></i>
                </th>
                <th scope="col" @click="sortBy('helyszin')" class="sortable-header">
                  Helyszín
                  <i v-if="sortColumn === 'helyszin'" :class="getSortIconClass()"></i>
                </th>
                <th scope="col" @click="sortBy('kezdo_datum')" class="sortable-header">
                  Kezdő Időpont
                  <i v-if="sortColumn === 'kezdo_datum'" :class="getSortIconClass()"></i>
                </th>
                <th scope="col" @click="sortBy('veg_datum')" class="sortable-header">
                  Záró Időpont
                  <i v-if="sortColumn === 'veg_datum'" :class="getSortIconClass()"></i>
                </th>
                <th>Műveletek</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="sortedAndFilteredEvents.length === 0">
                <td colspan="6" class="text-center">Nincs megjeleníthető rendezvény</td>
              </tr>
              <tr
                v-for="event in sortedAndFilteredEvents"
                :key="event.id"
                :class="'phase-' + (getStatusPhase(event.statusz).toLowerCase())"
                @click="showEventDetails(event)"
                style="cursor:pointer;"
              >
                <td>
                  <span
                    class="status-badge"
                    :class="getStatusClassFromCode(event.statusz)"
                    :title="getStatusLabel(event.statusz)"
                  >
                    <i :class="getStatusIcon(event.statusz)"></i>
                    {{ getStatusLabel(event.statusz) }}
                  </span>
                </td>
                <td>{{ event.nev }}</td>
                <td>{{ event.helyszin }}</td>
                <td>{{ formatDateTime(event.kezdo_datum, event.kezdo_idopont) }}</td>
                <td>{{ formatDateTime(event.veg_datum, event.veg_idopont) }}</td>
                <td class="text-center">
                  <div class="btn-group">
                    <button 
                      class="btn btn-sm btn-outline-primary" 
                      @click.stop="exportDocument(event)" 
                      title="Dokumentum exportálása">
                      <i class="fas fa-file-word"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-secondary"
                      @click.stop="openCostCalculator(event)"
                      title="Szolgáltatási költség kalkulálása"
                    >
                      <i class="fas fa-calculator"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- A ModificationPopup komponens használata az esemény részletes megjelenítéséhez -->
  <ModificationPopup
    v-if="selectedEvent"
    :event="selectedEvent"
    :is-dark-mode="isDarkMode"
    :userRole="effectiveUserRole"
    @close="selectedEvent = null"
    @status-updated="onStatusUpdated"
    @event-updated="onEventUpdated"
    @refresh-events="fetchEvents"
  ></ModificationPopup>

  <!-- Opcionális - Exportálási állapot jelző -->
  <div v-if="exportStatus.isLoading" class="position-fixed bottom-0 end-0 p-3">
    <div class="toast show" role="alert">
      <div class="toast-header">
        <strong class="me-auto">Dokumentum exportálása</strong>
      </div>
      <div class="toast-body">
        <div class="d-flex align-items-center">
          <div class="spinner-border spinner-border-sm me-2" role="status"></div>
          Dokumentum generálása folyamatban...
        </div>
      </div>
    </div>
  </div>

  <!-- Szolgáltatási költség kalkulátor komponens -->
  <ServiceCostCalculator
    ref="serviceCost"
    :event="costEvent"
    @calculated="handleCostCalculated"
  />
</template>

<script>
import axios from 'axios';
import ServiceCostCalculator from './ServiceCostCalculator.vue';
import FilterButtons from './FilterButtons.vue'; // <<< ÚJ
import { STATUSES, TERMINAL_STATUS_CODES } from '@/constants/statuses.js';
import ModificationPopup from '@/components/ModificationPopup.vue';
import auth from '../services/auth';

const STATUS_MAP = STATUSES.reduce((a,s)=>{a[s.code]=s;return a;}, {});
// Régi numerikus -> új kód (ha backend még nem frissült)
const LEGACY_NUMERIC_MAP = {
  0: 'ARAJANLAT_KESZITES_FOLYAMATBAN',
  1: 'UF_ARAJANLAT_ELFOGADASARA_VAR',
  2: 'SZERZODES_ALAIRVA',
  3: 'ELUTASITVA',
  4: 'LEZARVA'
};

export default {
  components: { ServiceCostCalculator, FilterButtons, ModificationPopup }, // <<< BŐVÍTVE
  props: {
    isDarkMode: { type: Boolean, default: false },
    hideTerminal: { type: Boolean, default: true } // statusFilter prop törölhető
  },
  data() {
    return {
      events: [],
      loading: true,
      error: null,
      filters: { name: '', startDate: '', location: '', type: '' },
      sortColumn: 'kezdo_datum',
      sortDirection: 'asc',
      selectedEvent: null,
      exportStatus: { isLoading: false, error: null },
      showCostModal: false,
      costEvent: null,
      statusFilterCodes: [], // <<< ÚJ (kategória szűrés)
      currentUser: null                    // <<< HOZZÁADVA
    };
  },
  computed: {
    uniqueLocations() {
      return [...new Set(this.events.map(e => e.helyszin).filter(Boolean))];
    },
    uniqueTypes() {
      return [...new Set(this.events.map(e => e.tipus).filter(Boolean))];
    },
    sortedAndFilteredEvents() {
      let filteredEvents = this.events.map(e => ({
        ...e,
        statusz: this.normalizeStatusCode(e.statusz)
      }));

      // Terminális elrejtése csak ha nincs aktív státusz szűrés
      if (this.hideTerminal && this.statusFilterCodes.length === 0) {
        filteredEvents = filteredEvents.filter(e => !this.isTerminal(e.statusz));
      }

      // Több státuszkódra szűrés (kategória gombok)
      if (this.statusFilterCodes.length > 0) {
        const set = new Set(this.statusFilterCodes.map(c => c.toUpperCase()));
        filteredEvents = filteredEvents.filter(e => e.statusz && set.has(e.statusz.toUpperCase()));
      }

      // Szöveges keresés
      if (this.filters.name) {
        const q = this.filters.name.toLowerCase();
        filteredEvents = filteredEvents.filter(e =>
          [e.nev, e.leiras, e.helyszin, e.tipus]
            .filter(Boolean)
            .some(v => v.toLowerCase().includes(q))
        );
      }

      // Kezdő dátum
      if (this.filters.startDate) {
        const fd = new Date(this.filters.startDate);
        filteredEvents = filteredEvents.filter(e => e.kezdo_datum && new Date(e.kezdo_datum) >= fd);
      }

      if (this.filters.location) {
        filteredEvents = filteredEvents.filter(e => e.helyszin === this.filters.location);
      }

      if (this.filters.type) {
        filteredEvents = filteredEvents.filter(e => e.tipus === this.filters.type);
      }

      return filteredEvents.sort((a,b) => {
        let av = a[this.sortColumn];
        let bv = b[this.sortColumn];
        if (this.sortColumn === 'statusz') {
          av = (STATUS_MAP[a.statusz]?.sort_order) ?? 99999;
          bv = (STATUS_MAP[b.statusz]?.sort_order) ?? 99999;
        } else if (['kezdo_datum','veg_datum'].includes(this.sortColumn)) {
          av = av ? new Date(av) : new Date(0);
          bv = bv ? new Date(bv) : new Date(0);
        } else {
          if (typeof av === 'string') av = av.toLowerCase();
          if (typeof bv === 'string') bv = bv.toLowerCase();
        }
        const res = av > bv ? 1 : (av < bv ? -1 : 0);
        return this.sortDirection === 'asc' ? res : -res;
      });
    },
    effectiveUserRole() {                  // <<< HOZZÁADVA
      return JSON.parse(localStorage.getItem('auth_user'));
    }
  },
  created() {
    this.fetchEvents();
    this.fetchCurrentUser();               // <<< HOZZÁADVA
  },
  methods: {
    normalizeStatusCode(raw) {
      if (!raw && raw !== 0) return null;
      if (typeof raw === 'number') return LEGACY_NUMERIC_MAP[raw] || null;
      return raw;
    },
    isTerminal(code) {
      return TERMINAL_STATUS_CODES.includes(code);
    },
    getStatusObj(code) {
      return STATUS_MAP[code] || null;
    },
    getStatusLabel(code) {
      return this.getStatusObj(code)?.label || code || 'Ismeretlen';
    },
    getStatusPhase(code) {
      return this.getStatusObj(code)?.phase || '';
    },
    getStatusIcon(code) {
      const phase = this.getStatusPhase(code);
      const terminal = this.isTerminal(code);
      if (terminal) return 'fas fa-flag-checkered';
      const iconMap = {
        BEERKEZETT: 'fas fa-inbox',
        SZERZODES: 'fas fa-file-signature',
        MEGVALOSITAS: 'fas fa-tasks',
        ELSZAMOLAS: 'fas fa-calculator',
        LEZART: 'fas fa-lock'
      };
      return iconMap[phase] || 'fas fa-tag';
    },
    getStatusClassFromCode(code) {
      const s = this.getStatusObj(code);
      if (!s) return 'status-badge status-unknown';
      return [
        'status-badge',
        'phase-' + s.phase.toLowerCase(),
        s.terminal ? 'terminal' : ''
      ].join(' ');
    },
    async fetchEvents() {
      try {
        this.loading = true;
        this.error = null;
        const response = await axios.get('http://localhost:3000/api/kerveny');
        this.events = response.data;
      } catch (err) {
        console.error(err);
        this.error = 'Nem sikerült betölteni az adatokat.';
      } finally {
        this.loading = false;
      }
    },
    async fetchCurrentUser() {             // <<< HOZZÁADVA
      try {
        const r = await axios.get('http://localhost:3000/api/auth/me', { withCredentials: true });
        this.currentUser = r.data;
        localStorage.setItem('user', JSON.stringify(r.data));
      } catch {
        this.currentUser = null;
      }
    },
    sortBy(col) {
      if (this.sortColumn === col) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = col;
        this.sortDirection = 'asc';
      }
    },
    getSortIconClass() {
      return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    },
    showEventDetails(e) {
      this.selectedEvent = { ...e, statusz: this.normalizeStatusCode(e.statusz) };
      document.body.style.overflow = 'hidden';
      this.$nextTick(()=> {
        const mp = this.$refs.modPopup;
        if (mp?.show) mp.show();
      });
    },
    closeEventDetails() {
      const mp = this.$refs.modPopup;
      if (mp?.hide) mp.hide();
      this.selectedEvent = null;
      document.body.style.overflow = '';
    },
    onStatusUpdated(updated) {             // (ha még nincs, csak példa – lehet hogy már létezik)
      this.selectedEvent = updated;
      this.fetchEvents();
    },
    onEventUpdated(updated) {
      this.selectedEvent = updated;
      this.fetchEvents();
    },
    handleArchived() {
      this.fetchEvents();
    },
    formatDateTime(date, time) {
      if (!date) return 'Nincs megadva';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth()+1).padStart(2,'0');
      const day = String(d.getDate()).padStart(2,'0');
      const base = `${year}.${month}.${day}`;
      return time ? `${base}, ${time.substring(0,5)}` : base;
    },
    formatDateForInput(ds) {
      if (!ds) return '';
      return new Date(ds).toISOString().slice(0,10);
    },
    async exportDocument(event) {
      try {
        this.exportStatus.isLoading = true;
        this.exportStatus.error = null;
        const response = await fetch('http://localhost:3000/api/document/generate', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ data: event })
        });
        if (!response.ok) throw new Error('Dokumentum generálás sikertelen');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${event.nev || 'dokumentum'}.docx`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
      } catch(e) {
        console.error(e);
        alert('Hiba a dokumentum generálásakor.');
      } finally {
        this.exportStatus.isLoading = false;
      }
    },
    openCostCalculator(event) {
      this.costEvent = event;
      this.$nextTick(()=> {
        const comp = this.$refs.serviceCost;
        if (comp?.show) comp.show();
      });
    },
    handleCostCalculated(payload) {
      alert(`Kalkulált összeg: ${Number(payload.total).toLocaleString('hu-HU')} Ft`);
      const idx = this.events.findIndex(e=>e.id===payload.event.id);
      if (idx!==-1) this.events[idx].calculation = payload;
    },
    handleStatusCodes(codes) {          // <<< ÚJ (kategória gomb esemény)
      this.statusFilterCodes = Array.isArray(codes) ? codes : [];
    }
  },
  mounted() {
    this.fetchEvents();
  }
};
</script>

<style scoped>
/* Táblázat stílusok */
.table-container {
  transition: all 0.3s ease;
}

.table-scrollable {
  overflow-x: auto;
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  position: relative;
}

.sortable-header i {
  margin-left: 5px;
}

.status-icon {
  font-size: 16px;
}

/* Státusz szövegek és ikonok színezése */
.status-processing .status-icon,
.status-processing {
  color: #f0ad4e; /* Narancssárga szín */
}

.status-pending .status-icon,
.status-pending {
  color: #6c757d; /* Szürke szín */
}

.status-approved .status-icon,
.status-approved {
  color: #5cb85c; /* Zöld szín */
}

.status-rejected .status-icon,
.status-rejected {
  color: #d9534f; /* Piros szín */
}

/* Archivált státusz színezése */
.status-archived .status-icon,
.status-archived {
  color: #6c757d; /* Szürke szín */
}

/* Táblázat cellák háttérszíne fehér marad */
.table-scrollable table tbody tr td {
  background-color: #ffffff; /* Fehér háttér */
}

/* Általános ikon stílusok */
.status-icon {
  font-size: 20px; /* Ikon mérete */
  color: inherit; /* Örökölje a színt a szülő osztályból */
  display: inline-block;
  vertical-align: middle;
}

/* Specifikus státusz ikon színek */
.status-processing .status-icon {
  color: #f0ad4e; /* Narancssárga */
}

.status-pending .status-icon {
  color: #6c757d; /* Szürke */
}

.status-approved .status-icon {
  color: #5cb85c; /* Zöld */
}

.status-rejected .status-icon {
  color: #d9534f; /* Piros */
}

.status-archived .status-icon {
  color: #6c757d; /* Szürke */
}

/* Új státusz badge stílusok */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .25rem .55rem;
  border-radius: 12px;
  font-size: .75rem;
  font-weight: 600;
  letter-spacing: .3px;
  line-height: 1.1;
  white-space: nowrap;
}

.status-badge i { font-size: .8rem; }

/* Fázis színek */
.phase-beerkezett { background:#fde8cc; color:#a65f00; }
.phase-szerzodes { background:#ffe0e3; color:#9d1d30; }
.phase-megvalositas { background:#d8eefc; color:#05537a; }
.phase-elszamolas { background:#e1f5e8; color:#1f6d3f; }
.phase-lezart { background:#e0e0e0; color:#555; }

.status-badge.terminal {
  border:1px solid rgba(0,0,0,.1);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.2);
}

.status-unknown { background:#ddd; color:#444; }

/* Sor kiemelés (opcionális fázis szerint) */
tr.phase-beerkezett:hover td { background:#fff8f2; }
tr.phase-szerzodes:hover td { background:#fff5f6; }
tr.phase-megvalositas:hover td { background:#f4fbff; }
tr.phase-elszamolas:hover td { background:#f4fff8; }
tr.phase-lezart:hover td { background:#f7f7f7; }
</style>