<template>
  <div class="filter-buttons-container">
    <div class="btn-group" role="group" aria-label="Státusz szűrés">
      <button 
        class="btn status-filter-btn" 
        :class="[
          'status-processing-btn', 
          { active: activeStatus === 0 }
        ]"
        @click="toggleStatusFilter(0)"
        title="Feldolgozás alatt"
      >
        <i class="fas fa-spinner fa-spin me-2"></i>
        <span class="btn-text">Feldolgozás alatt</span>
        <span class="count-badge">{{ statusCounts[0] }}</span>
      </button>
      
      <button 
        class="btn status-filter-btn" 
        :class="[
          'status-pending-btn', 
          { active: activeStatus === 1 }
        ]"
        @click="toggleStatusFilter(1)"
        title="Elfogadásra vár"
      >
        <i class="fas fa-clock me-2"></i>
        <span class="btn-text">Elfogadásra vár</span>
        <span class="count-badge">{{ statusCounts[1] }}</span>
      </button>
      
      <button 
        class="btn status-filter-btn" 
        :class="[
          'status-approved-btn', 
          { active: activeStatus === 2 }
        ]"
        @click="toggleStatusFilter(2)"
        title="Elfogadva"
      >
        <i class="fas fa-check-circle me-2"></i>
        <span class="btn-text">Elfogadva</span>
        <span class="count-badge">{{ statusCounts[2] }}</span>
      </button>
      
      <button 
        class="btn status-filter-btn" 
        :class="[
          'status-rejected-btn', 
          { active: activeStatus === 3 }
        ]"
        @click="toggleStatusFilter(3)"
        title="Elutasítva"
      >
        <i class="fas fa-times-circle me-2"></i>
        <span class="btn-text">Elutasítva</span>
        <span class="count-badge">{{ statusCounts[3] }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'FilterButtons',
  props: {
    events: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeStatus: null,
      statusCounts: {
        0: 0, // Feldolgozás alatt
        1: 0, // Elfogadásra vár
        2: 0, // Elfogadva
        3: 0  // Elutasítva
      }
    };
  },
  watch: {
    // Figyeljük az events prop változásait
    events: {
      immediate: true,
      handler(newEvents) {
        this.updateStatusCounts(newEvents);
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
    toggleStatusFilter(status) {
      // Ha ugyanazt a gombot nyomjuk meg, akkor töröljük a szűrést
      if (this.activeStatus === status) {
        this.activeStatus = null;
        this.$emit('filter-status', null);
      } else {
        // Egyébként beállítjuk az új szűrési feltételt
        this.activeStatus = status;
        this.$emit('filter-status', status);
      }
    },
    updateStatusCounts(events) {
      // Reseteljük a számlálót
      this.statusCounts = {
        0: 0,
        1: 0,
        2: 0,
        3: 0
      };
      
      // Számoljuk meg az egyes státuszokat
      if (events && Array.isArray(events)) {
        events.forEach(event => {
          if (event && typeof event.statusz === 'number' && event.statusz >= 0 && event.statusz <= 3) {
            this.statusCounts[event.statusz]++;
          }
        });
      }
    },
    async fetchStatusCounts() {
      try {
        // Lekérjük az összes eseményt egy API hívással
        const response = await axios.get('http://localhost:3000/api/kerveny');
        const events = response.data;
        
        // Frissítjük a számlálókat
        this.updateStatusCounts(events);
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