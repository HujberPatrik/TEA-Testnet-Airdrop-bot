<template>
  <div class="filter-buttons-container">
    <div class="btn-group" role="group" aria-label="Státusz szűrés">
      <!-- RÉGI 4 GOMB HELYETT -->
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="btn status-filter-btn"
        :class="[cat.class, { active: activeCategory === cat.key }]"
        @click="toggleCategory(cat)"
        :title="cat.label"
      >
        <i :class="cat.icon + ' me-2'"></i>
        <span class="btn-text">{{ cat.label }}</span>
        <span class="count-badge">{{ categoryCounts[cat.key] || 0 }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'FilterButtons',
  emits: ['filter-status','filterStatus'],   // <<< HOZZÁADVA
  props: {
    events: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeCategory: null,
      categories: [                          // <<< ÁTRENDEZETT + ÚJ SZÍN KIOSZTÁS
        {
          key: 'beerkezett',
          label: 'Beérkezett',
          class: 'status-processing-btn',
          icon: 'fas fa-inbox',
          codes: [
            'ARAJANLAT_KESZITES_FOLYAMATBAN',
            'UF_ARAJANLATRA_VAR',
            'UF_ARAJANLAT_ELFOGADASARA_VAR',
            'ARAJANLAT_KESZITESERE_VAR',
            'ARAJANLAT_ELFOGADASRA_VAR'
          ]
        },
        {
          key: 'megvalositas',
          label: 'Megvalósítás',
          class: 'status-contract-btn',          // kék
          icon: 'fas fa-play-circle',
          codes: [
            'MEGVALOSITASRA_VAR',
            'MEGVALOSULT_UF_IGAZOLASRA_VAR'
          ]
        },
        {
          key: 'elszamolas',
          label: 'Elszámolás',
          class: 'status-approved-btn',          // zöld
          icon: 'fas fa-file-invoice-dollar',
          codes: [
            'UF_TIG_JOVAHAGYASRA_VAR',
            'ADATKOZLO_GENERALASRA_VAR',
            'ADATKOZLO_FELKULDVE'
          ]
        },
        {
          key: 'szerzodes',
          label: 'Szerződés',
          class: 'status-rejected-btn',          // piros
          icon: 'fas fa-file-signature',
          codes: [
            'SZERZODES_ADATOKRA_VAR',
            'SZERZODES_ATNEZESRE_VAR',
            'SZERZODES_KIKULDESRE_VAR',
            'SZERZODES_PARTNERI_ALAIRASRA_VAR',
            'SZERZODES_EGYETEMI_ALAIRASRA_VAR',
            'SZERZODES_ALAIRVA'
          ]
        },
        {
          key: 'lezart',
          label: 'Lezárt',
          class: 'status-pending-btn',           // szürke
          icon: 'fas fa-archive',
          codes: [
            'LEZARVA',
            'ELUTASITVA',
            'LEMONDVA'
          ]
        }
      ],
      categoryCounts: {                         // <<< SZINKRONIZÁLT KULCSOK
        beerkezett:0,
        megvalositas:0,
        elszamolas:0,
        szerzodes:0,
        lezart:0
      },
      legacyIntMap: {              // ha még érkezik régi integer
        0: 'ARAJANLAT_KESZITES_FOLYAMATBAN',
        1: 'UF_ARAJANLAT_ELFOGADASARA_VAR',
        2: 'SZERZODES_ALAIRVA',
        3: 'ELUTASITVA',
        4: 'LEZARVA'
      }
    };
  },
  watch: {
    // Figyeljük az events prop változásait
    events: {
      immediate: true,
      deep: true,
      handler(newVal) {
        this.updateCategoryCounts(newVal);
      }
    }
  },
  mounted() {
    // Ha nincsenek események a props-ban, akkor kérjük le az API-ról
    if (!this.events || this.events.length === 0) {
      this.fetchStatusCounts();
    }
  },
  methods: {
    toggleCategory(cat) {                       // <<< MÓDOSÍTVA (mindig tömb emit)
      if (this.activeCategory === cat.key) {
        this.activeCategory = null;
        this.emitFilter([]);
      } else {
        this.activeCategory = cat.key;
        this.emitFilter(cat.codes);
      }
    },
    emitFilter(codes) {                         // <<< ÚJ
      const arr = Array.isArray(codes) ? [...codes] : [];
      this.$emit('filter-status', arr);
      this.$emit('filterStatus', arr);
    },
    normalizeCode(raw) {                        // <<< BŐVÍTVE
      if (raw === null || raw === undefined) return null;
      if (typeof raw === 'number') return this.legacyIntMap[raw] || null;
      return String(raw).trim().toUpperCase();
    },
    updateCategoryCounts(events) {              // <<< KULCSRÉSZ RENDEZVE
      const counts = {
        beerkezett:0,
        megvalositas:0,
        elszamolas:0,
        szerzodes:0,
        lezart:0
      };
      if (Array.isArray(events)) {
        events.forEach(ev => {
          const code = this.normalizeCode(
            ev.statusz ??
            ev.status ??
            ev.status_code ??
            ev.statusz_code ??
            ev.statusCode ??
            (ev.statusz_meta && ev.statusz_meta.code)
          );
          if (!code) return;
            const cat = this.categories.find(c => c.codes.includes(code));
            if (cat) counts[cat.key] += 1;
        });
      }
      this.categoryCounts = counts;
    },
    async fetchStatusCounts() {
      try {
        const response = await axios.get('http://localhost:3000/api/kerveny');
        const events = response.data;
        this.updateCategoryCounts(events);   // <<< NÉV JAVÍTVA
      } catch (error) {
        console.error('Error fetching status counts:', error);
      }
    }
  }
};
</script>

<style scoped>
.filter-buttons-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  width: 100%;
}

.btn-group {
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  gap: 10px;
}

.status-filter-btn {
  flex: 1;
  border-radius: 0; /* Nincs lekerekítés */
  transition: all 0.3s;
  color: #fff;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.2rem 1.5rem;
  font-size: 1.1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.status-filter-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.status-filter-btn.active {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5) inset, 0 6px 12px rgba(0, 0, 0, 0.15);
  font-weight: 600;
  transform: scale(1.05);
  z-index: 2;
}

.count-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(255, 255, 255, 0.25);
  color: white;
  border-radius: 50%;
  min-width: 24px;
  height: 24px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  padding: 0 4px;
}

.status-processing-btn {
  background-color: #f0ad4e;
  border-color: #f0ad4e;
}

.status-processing-btn:hover {
  background-color: #ec971f;
  border-color: #ec971f;
}

.status-pending-btn {
  background-color: #6c757d;
  border-color: #6c757d;
}

.status-pending-btn:hover {
  background-color: #5a6268;
  border-color: #5a6268;
}

.status-approved-btn {
  background-color: #5cb85c;
  border-color: #5cb85c;
}

.status-approved-btn:hover {
  background-color: #449d44;
  border-color: #449d44;
}

.status-rejected-btn {
  background-color: #d9534f;
  border-color: #d9534f;
}

.status-rejected-btn:hover {
  background-color: #c9302c;
  border-color: #c9302c;
}

.status-contract-btn {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
.status-contract-btn:hover {
  background-color: #0b5ed7;
  border-color: #0b5ed7;
}

/* Reszponzív igazítások */
@media (max-width: 992px) {
  .status-filter-btn {
    padding: 1rem 1rem;
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .btn-text {
    font-size: 0.9rem;
  }
  
  .status-filter-btn {
    padding: 0.75rem 0.5rem;
    flex-direction: column;
    text-align: center;
  }
  
  .status-filter-btn i {
    margin-right: 0 !important;
    margin-bottom: 5px;
    font-size: 1.2rem;
  }
  
  .count-badge {
    position: absolute;
    top: 5px;
    right: 5px;
    min-width: 20px;
    height: 20px;
    font-size: 0.75rem;
  }
}

@media (max-width: 576px) {
  .btn-group {
    flex-wrap: wrap;
  }
  
  .status-filter-btn {
    min-width: 45%;
    margin-bottom: 10px;
  }
  
  .btn-text {
    display: none;
  }
  
  .status-filter-btn i {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .count-badge {
    bottom: 5px;
    top: auto;
    right: 5px;
  }
}
</style>