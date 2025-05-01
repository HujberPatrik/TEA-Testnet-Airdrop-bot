<template>
  <div :class="['container-fluid pt-4 px-4 table-container']">
    <div class="bg-light text-center rounded p-4">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h6 class="mb-0">Rendezvények</h6>
      </div>

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
                :class="getStatusClass(getStatusText(event.statusz))"
                @click="showEventDetails(event)"
                style="cursor: pointer;"
              >
                <td style="width: 50px; text-align: center;">
                  <span class="status-icon" :title="getStatusText(event.statusz)">
                    <i :class="getStatusIcon(getStatusText(event.statusz))"></i>
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
    :event="selectedEvent" 
    :is-dark-mode="isDarkMode"
    @close="closeEventDetails"
    @status-updated="handleStatusUpdated"
    @event-updated="handleEventUpdated"
  />

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
</template>

<script>
import axios from 'axios';
import ModificationPopup from './ModificationPopup.vue';

export default {
  components: {
    ModificationPopup
  },
  props: {
    isDarkMode: {
      type: Boolean,
      default: false
    },
    statusFilter: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      events: [],
      loading: true,
      error: null,
      filters: {
        name: '',
        startDate: '',
        location: '',
        type: ''
      },
      sortColumn: 'kezdo_datum',
      sortDirection: 'asc',
      selectedEvent: null,
      exportStatus: {
        isLoading: false,
        error: null
      }
    };
  },
  computed: {
    uniqueLocations() {
      return [...new Set(this.events.map(event => event.helyszin).filter(Boolean))];
    },
    uniqueTypes() {
      return [...new Set(this.events.map(event => event.tipus).filter(Boolean))];
    },
    sortedAndFilteredEvents() {
      let filteredEvents = [...this.events];
      
      // Státusz szűrés
      if (this.statusFilter !== null) {
        filteredEvents = filteredEvents.filter(event => {
          return event.statusz === this.statusFilter;
        });
      }
      
      // Név/leírás szűrés
      if (this.filters.name) {
        const searchTerm = this.filters.name.toLowerCase();
        filteredEvents = filteredEvents.filter(event => {
          return (
            (event.nev && event.nev.toLowerCase().includes(searchTerm)) ||
            (event.leiras && event.leiras.toLowerCase().includes(searchTerm)) ||
            (event.helyszin && event.helyszin.toLowerCase().includes(searchTerm)) ||
            (event.tipus && event.tipus.toLowerCase().includes(searchTerm))
          );
        });
      }
      
      // Kezdő dátum szűrés
      if (this.filters.startDate) {
        const filterDate = new Date(this.filters.startDate);
        filteredEvents = filteredEvents.filter(event => {
          if (!event.kezdo_datum) return false;
          const eventStartDate = new Date(event.kezdo_datum);
          return eventStartDate >= filterDate;
        });
      }
      
      // Helyszín szűrés
      if (this.filters.location) {
        filteredEvents = filteredEvents.filter(event => {
          return event.helyszin === this.filters.location;
        });
      }
      
      // Típus szűrő
      if (this.filters.type) {
        filteredEvents = filteredEvents.filter(event => {
          return event.tipus === this.filters.type;
        });
      }
      
      // Rendezés
      return filteredEvents.sort((a, b) => {
        let aValue = a[this.sortColumn];
        let bValue = b[this.sortColumn];
        
        // Dátum mezők kezelése
        if (this.sortColumn === 'kezdo_datum' || this.sortColumn === 'veg_datum') {
          aValue = aValue ? new Date(aValue) : new Date(0);
          bValue = bValue ? new Date(bValue) : new Date(0);
        }
        
        // Szöveges mezők kezelése
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        // Rendezési irány figyelembevétele
        if (this.sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }
  },
  methods: {
    async fetchEvents() {
      try {
        this.loading = true;
        this.error = null;
        const response = await axios.get('http://localhost:3000/api/kerveny');
        this.events = response.data;
      } catch (err) {
        console.error('Hiba az adatok lekérdezése során:', err);
        this.error = 'Nem sikerült betölteni az adatokat. Kérjük, próbálja újra később!';
      } finally {
        this.loading = false;
      }
    },
    
    sortBy(column) {
      if (this.sortColumn === column) {
        // Már eszerint a mező szerint rendez, váltás a rendezési irányban
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        // Új mező szerint rendez, alapértelmezett irány: növekvő
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    },
    
    getSortIconClass() {
      return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    },
    
    showEventDetails(event) {
      this.selectedEvent = { ...event };
      document.body.style.overflow = 'hidden';
    },
    
    closeEventDetails() {
      this.selectedEvent = null;
      document.body.style.overflow = '';
    },
    
    handleStatusUpdated(updatedEvent) {
      // Frissítjük a kiválasztott eseményt
      this.selectedEvent = updatedEvent;
      // Frissítjük az eseménylistát is
      this.fetchEvents();
    },
    
    handleEventUpdated(updatedEvent) {
      // Frissítjük a kiválasztott eseményt
      this.selectedEvent = updatedEvent;
      // Frissítjük az eseménylistát is
      this.fetchEvents();
    },
    
    formatDateTime(date, time) {
      if (!date) return 'Nincs megadva';
      
      // Számszerű dátum formátum ÉÉÉÉ.HH.NN
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      
      const formattedDate = `${year}.${month}.${day}`;
      
      if (time) {
        // Időpont hozzáadása (feltételezzük, hogy a time formátuma 'HH:MM:SS')
        return `${formattedDate}, ${time.substring(0, 5)}`;
      }
      
      return formattedDate;
    },
    
    getStatusText(statusId) {
      const statusMap = {
        0: 'Feldolgozás alatt',
        1: 'Elfogadásra vár',
        2: 'Elfogadva',
        3: 'Elutasítva'
      };
      
      return statusMap[statusId] || 'Ismeretlen';
    },
    
    getStatusClass(statusText) {
      const classMap = {
        'Feldolgozás alatt': 'status-processing',
        'Elfogadásra vár': 'status-pending',
        'Elfogadva': 'status-approved',
        'Elutasítva': 'status-rejected'
      };
      
      return classMap[statusText] || '';
    },
    
    getStatusIcon(statusText) {
      const iconMap = {
        'Feldolgozás alatt': 'fas fa-spinner fa-pulse',
        'Elfogadásra vár': 'fas fa-clock',
        'Elfogadva': 'fas fa-check-circle',
        'Elutasítva': 'fas fa-times-circle'
      };
      return iconMap[statusText] || 'fas fa-question-circle';
    },
    
    formatDateForInput(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().slice(0, 10);
    },

    async exportDocument(event) {
      try {
        this.exportStatus.isLoading = true;
        this.exportStatus.error = null;
        
        const response = await fetch('http://localhost:3000/api/document/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: event, // Az esemény adatai
          }),
        });
    
        if (!response.ok) {
          throw new Error('Dokumentum generálás sikertelen');
        }
    
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${event.nev || 'dokumentum'}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Hiba a dokumentum generálása során:', err);
        this.exportStatus.error = 'Hiba történt a dokumentum generálása során.';
        alert('Hiba történt a dokumentum generálása során.');
      } finally {
        this.exportStatus.isLoading = false;
      }
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
</style>