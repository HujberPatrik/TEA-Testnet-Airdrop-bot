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

/* ÚJ, lekerekített (pill) státusz gomb dizájn */
.status-filter-btn {
  /* Alapszínek kategória szerint (lásd lent, változók beállítása) */
  --btn-c1: #6c757d;        /* start */
  --btn-c2: #5a6268;        /* end */
  --btn-border: #4b5257;    /* border */
  --badge-space: 2.2rem;             /* hely a jobb szélén a badge-nek */

  flex: 1;
  border-radius: 999px;
  transition: all .18s ease;
  color: #fff;
  border: 1px solid var(--btn-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .55rem;
  padding: .7rem 1.1rem;
  padding-right: calc(1.1rem + var(--badge-space));
  font-size: .95rem;
  font-weight: 600;
  letter-spacing: .2px;
  box-shadow: 0 3px 6px -2px rgba(0,0,0,.20), inset 0 0 0 1px rgba(255,255,255,.10);
  position: relative;
  overflow: visible;
  background: linear-gradient(135deg, var(--btn-c1) 0%, var(--btn-c2) 100%);
}

.status-filter-btn i {
  font-size: 1.05rem;
  opacity: .95;
}

.status-filter-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 12px -4px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.14);
  filter: brightness(1.04);
  z-index: 1;
}

.status-filter-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px -2px rgba(0,0,0,.25), inset 0 0 6px rgba(0,0,0,.18);
  filter: brightness(0.98);
}

.status-filter-btn:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 5px rgba(13,110,253,.35),
    0 6px 14px -6px rgba(0,0,0,.35);
}

.status-filter-btn.active {
  box-shadow:
    0 0 0 2px rgba(255,255,255,.55) inset,
    0 6px 12px -5px rgba(0,0,0,.25);
  transform: translateY(-1px) scale(1.015);
}

/* Jelvény (darabszám) a gombon – belülre igazítva */
.count-badge {
  position: absolute;
  top: 6px;                 /* belül marad */
  right: 8px;               /* belül marad */
  background-color: rgba(255,255,255,.18);
  color: #fff;
  border-radius: 999px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: .70rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  box-shadow: 0 2px 6px -2px rgba(0,0,0,.35);
  letter-spacing: .3px;
}

/* Kategória színváltozók (gradiensek + keret) */
.status-processing-btn {   /* sárga/narancs */
  --btn-c1: #f7bf74;
  --btn-c2: #f0ad4e;
  --btn-border: #e19a2c;
}
.status-contract-btn {     /* kék */
  --btn-c1: #3a8bff;
  --btn-c2: #0d6efd;
  --btn-border: #0b5ed7;
}
.status-approved-btn {     /* zöld */
  --btn-c1: #4fcc6b;
  --btn-c2: #37b457;
  --btn-border: #2f9d4b;
}
.status-rejected-btn {     /* piros */
  --btn-c1: #f06a64;
  --btn-c2: #d9534f;
  --btn-border: #c74440;
}
.status-pending-btn {      /* szürke */
  --btn-c1: #8a93a1;
  --btn-c2: #6c757d;
  --btn-border: #5d646c;
}

/* Reszponzív igazítások */
@media (max-width: 992px) {
  .status-filter-btn {
    padding: .65rem 1rem;
    font-size: .9rem;
  }
}

@media (max-width: 768px) {
  .btn-text {
    font-size: .85rem;
  }
  .status-filter-btn {
    padding: .6rem .8rem;
    --badge-space: 1.8rem;   /* mobilon kisebb hely a badge-nek */
    flex-direction: column;
    text-align: center;
    gap: .35rem;
  }
  .status-filter-btn i {
    margin: 0 !important;
    font-size: 1.2rem;
  }
  .count-badge {
    min-width: 18px;
    height: 18px;
    font-size: .65rem;
    top: 6px;          /* belül marad */
    right: 6px;        /* belül marad */
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
    font-size: 1.4rem;
  }
  .count-badge {
    bottom: auto;  /* maradjon felül */
    top: 6px;
    right: 6px;
  }
}
</style>