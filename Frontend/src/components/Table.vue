<template>
  <div :class="['container-fluid pt-4 px-4 table-container']">
    <div class="bg-light text-center rounded p-4">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h6 class="mb-0">Rendezvények</h6>
      </div>

      <FilterButtons
        v-if="!isUfRole"
        :events="events"
        @filter-status="handleStatusCodes"
        class="mb-3"
      />

      <!-- Módosítás kártyák külön komponensben -->
      <ModificationCards
        :events="sortedAndFilteredEvents"
        :is-event-organizer="isEventOrganizer"
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
        <div class="filter-bar shadow-sm mb-3">
          <div class="filter-row">
            <!-- Keresőmező -->
            <div class="filter-item w-100">
              <i class="fas fa-search"></i>
              <input
                type="text"
                id="filter-name"
                class="filter-input"
                placeholder="Keresés (név, leírás, helyszín, típus)"
                v-model="filters.name"
              />
            </div>

            <!-- Kezdő dátum szűrő -->
            <div class="filter-item">
              <i class="fas fa-calendar-alt"></i>
              <input
                type="date"
                id="filter-start-date"
                class="filter-input"
                v-model="filters.startDate"
              />
            </div>

            <!-- Helyszín szűrő -->
            <div class="filter-item">
              <i class="fas fa-map-marker-alt"></i>
              <select
                id="filter-location"
                class="filter-input select"
                v-model="filters.location"
              >
                <option value="">Összes helyszín</option>
                <option v-for="location in uniqueLocations" :key="location" :value="location">
                  {{ location }}
                </option>
              </select>
            </div>

            <!-- Típus szűrő -->
            <div class="filter-item">
              <i class="fas fa-tags"></i>
              <select
                id="filter-type"
                class="filter-input select"
                v-model="filters.type"
              >
                <option value="">Összes típus</option>
                <option v-for="type in uniqueTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="table-scrollable">
          <table class="table fancy-table text-start align-middle mb-0">
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
                  <span
                    v-if="modificationType(event)"
                    class="badge ms-2"
                    :class="modificationType(event) === 'UF' ? 'bg-warning text-dark' : 'bg-info text-dark'"
                    :title="event.modositasi_indok"
                  >
                    {{ modificationType(event) }} módosítás kérve
                  </span>
                </td>
                <td>{{ event.nev }}</td>
                <td>{{ event.helyszin }}</td>
                <td>{{ formatDateTime(event.kezdo_datum, event.kezdo_idopont) }}</td>
                <td>{{ formatDateTime(event.veg_datum, event.veg_idopont) }}</td>
                <td class="text-center">
                  <div class="btn-group">
                    <button
                      class="doc-btn position-relative"
                      @click.stop="exportDocument(event)"
                      title="Dokumentum exportálása"
                    >
                      <i class="fas fa-file-word me-1"></i>
                      <span class="label d-none d-md-inline">DOCX</span>
                    </button>
                    <button
                      :class="['chat-btn','position-relative', { 'has-unread': unreadByEvent[event.id] > 0 }]"
                       @click.stop="openChat(event)"
                       title="Chat megnyitása a rendezvényhez"
                    >
                      <i class="fas fa-comments me-1"></i>
                      <span class="label d-none d-md-inline">Chat</span>
                      <span
                        v-if="unreadByEvent[event.id] > 0"
                        class="chat-unread-badge"
                        :title="`${unreadByEvent[event.id]} új üzenet`"
                      >
                        {{ Math.min(unreadByEvent[event.id], 99) }}
                        <span class="pulse"></span>
                      </span>
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
    @open-pricing-wizard="onOpenPricingWizard"
  ></ModificationPopup>

  <!-- Wizard külön modálként a body-ra teleportalva -->
  <teleport to="body">
    <PricingFlowWizard
      v-if="showPricingWizard"
      :event="wizardEvent"
      @close="closeWizard"
      @status-updated="onStatusUpdated"
      @refresh-events="fetchEvents"
    />
  </teleport>

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
  <!-- Chat komponens megjelenítése -->
  <Chat
    v-if="showChat"
    :is-dark-mode="isDarkMode"
    :kerveny-id="chatKervenyId"
    @close="closeChat"
    @toggle="closeChat"
    @has-unread="onChatUnread"
  />
</template>

<script>
import axios from 'axios';
import FilterButtons from './FilterButtons.vue';
import { STATUSES, TERMINAL_STATUS_CODES } from '@/constants/statuses.js';
import ModificationPopup from '@/components/ModificationPopup.vue';
import PricingFlowWizard from '@/components/PricingFlowWizard.vue';
import auth from '../services/auth';
import Chat from '@/components/Chat.vue';
import ModificationCards from '@/components/ModificationCards.vue';

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
  components: { FilterButtons, ModificationPopup, PricingFlowWizard, Chat, ModificationCards },
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
      currentUser: null,                    // <<< HOZZÁADVA
      showPricingWizard: false,  // ÚJ
      wizardEvent: null,         // ÚJ
      userRole: null,             // ensureAuthUser()-ból töltjük
      showChat: false,
      chatKervenyId: null,
     unreadByEvent: Object.create(null) // { [eventId]: number }
    };
  },
  computed: {
    uniqueLocations() {
      return [...new Set(this.events.map(e => e.helyszin).filter(Boolean))];
    },
    uniqueTypes() {
      return [...new Set(this.events.map(e => e.tipus).filter(Boolean))];
    },
    // Ugyanaz a role validálás, mint a Sidebar.vue-ban (ensureAuthUser által beállított userRole)
    isUfRole() {
      const r = String(this.userRole || '')
        .toUpperCase()
        .replace(/[_-]/g, ' ')
        .trim();
      return r === 'UF' || r === 'UNI FAMULUS' || r === 'UNIFAMULUS';
    },
    // Rendezvényszervező szerep felismerése (ensureAuthUser() által beállított userRole alapján)
    isEventOrganizer() {
      const r = String(this.userRole || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toUpperCase().replace(/[_-]/g, ' ').trim();
      return r === 'RENDEZVENYSZERVEZO' || r === 'RENDEZVENY SZERVEZO';
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

      // Uni-Famulus csak az UF_ARAJANLATRA_VAR státuszú rendezvényeket lássa
      if (this.isUfRole) {
        filteredEvents = filteredEvents.filter(
          e => String(e.statusz || '').toUpperCase() === 'UF_ARAJANLATRA_VAR'
        );
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
    getAuthHeaders() {
      const token =
        localStorage.getItem('authToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('access_token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    async checkUnread(eventId) {
      if (!eventId) return;
      try {
        const params = new URLSearchParams({ kervenyId: String(eventId) });
        const { data } = await axios.get(
          `http://localhost:3005/api/chat/messages?${params.toString()}`,
          { headers: this.getAuthHeaders() }
        );
        // Új backend formátum
        const count = typeof data?.unreadCount === 'number'
          ? data.unreadCount
          : 0;
        this.unreadByEvent[eventId] = count;
      } catch (e) {
        // 401 vagy más hiba esetén nem írjuk felül
        if (e?.response?.status !== 401) {
          console.warn('[chat] unread lekérdezés hiba', e?.message || e);
        }
      }
    },
    async refreshUnreadForAll() {
      const ids = this.sortedAndFilteredEvents.map(e => e.id).filter(Boolean);
      for (const id of ids) {
        await this.checkUnread(id);
      }
    },
    async fetchEvents() {
      try {
        this.loading = true;
        this.error = null;
        const response = await axios.get('http://localhost:3000/api/kerveny');
        this.events = response.data;
        // Rendezvények betöltése után frissítjük az unread jelzőket
        setTimeout(() => this.refreshUnreadForAll(), 150);
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
    onStatusUpdated(updated) {
      // lista és lokális state frissítés
      this.fetchEvents?.();
      // wizardEvent is frissüljön, ha nyitva van és azonos az id
      if (this.showPricingWizard && this.wizardEvent && updated && this.wizardEvent.id === updated.id) {
        this.wizardEvent = { ...this.wizardEvent, ...updated };
      }
      // selectedEvent is frissüljön, ha nyitva van és azonos az id
      if (this.selectedEvent && updated && this.selectedEvent.id === updated.id) {
        this.selectedEvent = { ...this.selectedEvent, ...updated };
      }
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
    },
    onOpenPricingWizard(ev) {
      this.selectedEvent = null;  // ModificationPopup bezárása
      this.wizardEvent = ev;      // átadjuk az eseményt a wizardnak
      this.showPricingWizard = true;
      document.body.style.overflow = 'hidden';
    },
    closeWizard() {               // ÚJ
      this.showPricingWizard = false;
      document.body.style.overflow = '';
    },
    // módosítás jelző a sorban továbbra is használható,
    // ha szükséges, hagyd meg vagy igazítsd a backend-hez
    modificationType(e) {
      if (!e || !e.modositasi_indok) return null;
      const s = String(e.statusz || '').toUpperCase();
      if (s === 'UF_ARAJANLATRA_VAR') return 'UF';
      if (s === 'ARAJANLAT_KESZITESERE_VAR') return 'Egyetem';
      return null;
    },
    openChat(event) {
      if (!event || !event.id) return;
      this.chatKervenyId = Number(event.id);
      this.showChat = true; // újramount -> Chat újra létrejön
      this.unreadByEvent[event.id] = 0;
    },
    closeChat() {
      this.showChat = false;
      this.chatKervenyId = null;
    },
    onChatUnread(payload) {
      const count = typeof payload === 'number' ? payload : (payload ? 1 : 0);
      if (this.chatKervenyId) {
        this.unreadByEvent[this.chatKervenyId] = count;
      }
    },
  },
  async mounted() {
    this.fetchEvents();
    try {
      const user = await auth.ensureAuthUser();
      this.userRole = user?.role || null;
    } catch {
      this.userRole = null;
    }
    // Első körben csak akkor próbáljuk meg, ha már vannak events (fetchEvents hívja is)
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
  border-radius: 26px;
  background: #ffffff;
  box-shadow: 0 10px 22px -8px rgba(0,0,0,.25), 0 4px 12px -6px rgba(0,0,0,.12);
  position: relative;
  padding: 6px;
}

.table-scrollable::before {
  content:'';
  position:absolute;
  inset:0;
  border-radius: 26px;
  pointer-events:none;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.6), inset 0 0 0 2px rgba(0,0,0,.04);
}

/* Kerek, modern tábla */
.fancy-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: none;
  background: transparent;
}
.fancy-table thead tr:first-child th:first-child { border-top-left-radius: 18px; }
.fancy-table thead tr:first-child th:last-child  { border-top-right-radius: 18px; }

/* Fejléc – kék (gombokhoz illeszkedő) */
.fancy-table thead th {
  background: linear-gradient(135deg,#5a9cff 0%,#0d6efd 60%,#0b5ed7 100%);
  color:#fff;
  font-size:.72rem;
  font-weight:700;
  letter-spacing:.5px;
  text-transform: uppercase;
  padding:.75rem .9rem;
  border: none;
  position: relative;
  user-select:none;
}
.fancy-table thead th.sortable-header:hover {
  filter: brightness(1.08);
  cursor: pointer;
}
.fancy-table thead th i {
  opacity:.85;
  font-size:.75rem;
}

/* Sorok/cellák */
.fancy-table tbody tr {
  transition: background .18s ease, transform .18s ease;
}
.fancy-table tbody td {
  border: none;
  padding:.7rem .85rem;
  font-size:.74rem;
  border-bottom:1px solid rgba(0,0,0,.06);
  background-color:#fff;
}
.fancy-table tbody tr:last-child td {
  border-bottom: none;
}
.fancy-table tbody tr:hover {
  background: #f4f8ff;
}
.fancy-table tbody tr:active {
  transform: scale(.995);
}

/* Üres állapot cella */
.fancy-table tbody tr td[colspan] {
  text-align:center;
  padding:2.2rem 1rem;
  font-size:.8rem;
  color:#555;
  background:#fafafa;
  border-radius: 18px;
}

/* Dark mód finomítás */
:deep(.dark) .table-scrollable {
  background:#1f2330;
  box-shadow: 0 10px 26px -10px rgba(0,0,0,.55), 0 4px 12px -6px rgba(0,0,0,.4);
}
:deep(.dark) .table-scrollable::before {
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.08), inset 0 0 0 2px rgba(255,255,255,.03);
}
:deep(.dark) .fancy-table thead th {
  background: linear-gradient(135deg,#3a4d9d 0%,#273b84 60%,#1d2e6c 100%);
  color:#f1f4ff;
}
:deep(.dark) .fancy-table tbody tr:hover {
  background:#252b3a;
}
:deep(.dark) .fancy-table tbody td {
  border-bottom:1px solid rgba(255,255,255,.06);
  background-color:transparent;
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

/* Chat gomb badge */
.chat-unread-badge {
  min-width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  line-height: 1;
  box-shadow: 0 0 0 2px #fff;
}
.btn-unread {
  border-color: #dc3545 !important;
}

/*chat gomb */
.chat-btn {
  --clr-base: #5865f2;
  --clr-hover: #4854c7;
  --clr-unread: #dc3545;
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .45rem .85rem;
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .4px;
  border-radius: 999px;
  border: 1px solid var(--clr-base);
  background: linear-gradient(135deg,#6d7bff 0%,#5865f2 45%,#4e5be3 100%);
  color: #fff;
  position: relative;
  transition: all .18s ease;
  box-shadow: 0 3px 6px -2px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.12);
}
.chat-btn i { font-size: .9rem; }
.chat-btn:hover {
  background: linear-gradient(135deg,#7f8bff 0%,#4854c7 50%,#3d49b0 100%);
  box-shadow: 0 4px 10px -3px rgba(0,0,0,.35);
  transform: translateY(-1px);
}
.chat-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px -1px rgba(0,0,0,.35), inset 0 0 4px rgba(0,0,0,.3);
}
.chat-btn.has-unread {
  border-color: var(--clr-unread);
  box-shadow: 0 0 0 2px rgba(220,53,69,.25), 0 4px 10px -3px rgba(220,53,69,.45);
}
.chat-btn .label { text-transform: uppercase; }

/* Unread badge */
.chat-unread-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--clr-unread);
  color:#fff;
  min-width:22px;
  height:22px;
  padding:0 5px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:.65rem;
  font-weight:700;
  border-radius: 14px;
  box-shadow: 0 0 0 2px #fff, 0 2px 6px -1px rgba(0,0,0,.4);
  letter-spacing:.5px;
  position: absolute;
}
.chat-unread-badge .pulse {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  animation: pulse 1.8s infinite;
  background: radial-gradient(circle at center, rgba(255,255,255,.7) 0%, rgba(255,255,255,0) 60%);
  mix-blend-mode: overlay;
  pointer-events: none;
}
@keyframes pulse {
  0% { transform: scale(.9); opacity:.9; }
  60% { transform: scale(1.55); opacity:0; }
  100% { transform: scale(1.55); opacity:0; }
}

@media (prefers-reduced-motion: reduce) {
  .chat-unread-badge .pulse { animation: none; }
  .chat-btn { transition: none; }
}
/* Dark mode finomítás (ha van) */
:deep(.dark) .chat-btn {
  box-shadow: 0 3px 8px -2px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.08);
}
:deep(.dark) .chat-btn:hover {
  box-shadow: 0 5px 14px -4px rgba(0,0,0,.7);
}
/* Mobilon badge kisebb */
@media (max-width: 576px) {
  .chat-unread-badge { min-width:18px; height:18px; font-size:.55rem; top:-5px; right:-5px; }
  .chat-btn { padding:.42rem .7rem; }
  .chat-btn .label { display:none; }
}

/* Szép kék DOCX gomb (a chat gomb stílusára) */
.doc-btn {
  --clr-base: #0d6efd;
  --clr-hover: #0b5ed7;
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .45rem .85rem;
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .4px;
  border-radius: 999px;
  border: 1px solid var(--clr-base);
  background: linear-gradient(135deg,#3a8bff 0%,#0d6efd 45%,#0b58d0 100%);
  color: #fff;
  position: relative;
  transition: all .18s ease;
  box-shadow: 0 3px 6px -2px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.12);
}
.doc-btn i { font-size: .9rem; }
.doc-btn:hover {
  background: linear-gradient(135deg,#5a9cff 0%,#0b5ed7 50%,#0a4fb6 100%);
  box-shadow: 0 4px 10px -3px rgba(0,0,0,.35);
  transform: translateY(-1px);
}
.doc-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px -1px rgba(0,0,0,.35), inset 0 0 4px rgba(0,0,0,.3);
}
.doc-btn .label { text-transform: uppercase; }

/* Dark mód finomítás */
:deep(.dark) .doc-btn {
  box-shadow: 0 3px 8px -2px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.08);
}
:deep(.dark) .doc-btn:hover {
  box-shadow: 0 5px 14px -4px rgba(0,0,0,.7);
}

/* Új filter bar dizájn */
.filter-bar {
  background:#ffffff;
  border-radius: 28px;
  padding: .85rem 1.1rem;
  box-shadow: 0 6px 14px -6px rgba(0,0,0,.18), 0 2px 6px -3px rgba(0,0,0,.08);
  display:flex;
  flex-direction:column;
  gap:.75rem;
  position:relative;
}
.filter-row {
  display:flex;
  flex-wrap:wrap;
  gap:.65rem;
}
.filter-item {
  position:relative;
  display:flex;
  align-items:center;
  gap:.55rem;
  background:#f5f8ff;
  border:1px solid #d7e3f5;
  border-radius:999px;
  padding:.45rem .95rem;
  flex:1 1 180px;
  min-width:200px;
  transition:.18s;
}
.filter-item:hover {
  background:#eef4ff;
  border-color:#c3d6f1;
}
.filter-item i {
  color:#0d6efd;
  font-size:.85rem;
  opacity:.9;
}
.filter-input {
  flex:1;
  border:none;
  background:transparent;
  font-size:.72rem;
  font-weight:600;
  letter-spacing:.3px;
  padding:0;
  outline:none;
  color:#24415f;
}
.filter-input::placeholder {
  color:#6c7f95;
  font-weight:500;
}
.filter-input.select {
  appearance:none;
  cursor:pointer;
}
.filter-input.select option {
  font-weight:500;
}
@media (max-width: 768px) {
  .filter-item { min-width:100%; }
}
:deep(.dark) .filter-bar {
  background:#1f2330;
  box-shadow:0 6px 16px -6px rgba(0,0,0,.55), 0 2px 8px -4px rgba(0,0,0,.45);
}
:deep(.dark) .filter-item {
  background:#262d3d;
  border-color:#394454;
}
:deep(.dark) .filter-item:hover {
  background:#2d3647;
  border-color:#4a5669;
}
:deep(.dark) .filter-item i { color:#5a9cff; }
:deep(.dark) .filter-input { color:#dbe6f4; }
:deep(.dark) .filter-input::placeholder { color:#7e8da1; }
</style>