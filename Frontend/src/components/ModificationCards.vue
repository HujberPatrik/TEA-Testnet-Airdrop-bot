<template>
  <div class="row g-3 mb-3" v-if="ufList.length || uniList.length">
    <!-- Rendezvényszervező NE lássa az UF módosítás szekciót -->
    <div class="col-md-6" v-if="ufList.length && !isEventOrganizer">
      <div class="card mod-card mod-card-uf h-100">
        <div class="card-header text-dark fw-bold">UF módosítás kérve</div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item" v-for="ev in ufList" :key="'uf-'+ev.id">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="fw-semibold">{{ ev.nev }}</div>
                <small class="text-muted d-block">Indok: {{ ev.modositasi_indok }}</small>
              </div>
              <span class="badge bg-warning text-dark">UF</span>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="col-md-6" v-if="uniList.length">
      <div class="card mod-card mod-card-uni h-100">
        <div class="card-header text-dark fw-bold">Egyetemi módosítás kérve</div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item" v-for="ev in uniList" :key="'uni-'+ev.id">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="fw-semibold">{{ ev.nev }}</div>
                <small class="text-muted d-block">Indok: {{ ev.modositasi_indok }}</small>
              </div>
              <span class="badge bg-info text-dark">Egyetem</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModificationCards',
  props: {
    // A Table-ből kapja a már szűrt/sorrendezett eseményeket
    events: { type: Array, default: () => [] },
    // A Table számolja ki (computed isEventOrganizer), itt csak felhasználjuk
    isEventOrganizer: { type: Boolean, default: false }
  },
  computed: {
    ufList() {
      return this.events.filter(e =>
        !!e?.modositasi_indok &&
        String(e?.statusz || '').toUpperCase() === 'UF_ARAJANLATRA_VAR'
      );
    },
    uniList() {
      return this.events.filter(e =>
        !!e?.modositasi_indok &&
        String(e?.statusz || '').toUpperCase() === 'ARAJANLAT_KESZITESERE_VAR'
      );
    }
  }
};
</script>

<style scoped>
/* Lekerekített módosítás kártyák */
.mod-card {
  border: none;
  border-radius: 28px;
  overflow: hidden;
  position: relative;
  padding-top: .35rem;
  box-shadow: 0 8px 18px -6px rgba(0,0,0,.25), 0 2px 6px -2px rgba(0,0,0,.12);
  background: #fff;
  transition: transform .18s ease, box-shadow .18s ease;
}
.mod-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px -8px rgba(0,0,0,.3), 0 4px 10px -3px rgba(0,0,0,.15);
}
.mod-card .card-header {
  margin: 0 10px;
  border-radius: 20px;
  font-size: .85rem;
  padding: .55rem .9rem;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.4);
  letter-spacing:.5px;
  text-transform: uppercase;
}
.mod-card-uf {
  background: #fff2cc; /* egyszínű halvány sárga */
}
.mod-card-uni {
  background: #e6f2ff; /* egyszínű halvány kék */
}
.mod-card-uf .card-header {
  background: #ffb23a; /* egyszínű sárga/orange */
}
.mod-card-uni .card-header {
  background: #4aa7ff; /* egyszínű kék */
  color:#fff !important;
  text-shadow:0 1px 2px rgba(0,0,0,.25);
}
.mod-card .list-group-item {
  background: transparent;
  border: none;
  padding: .6rem .9rem;
  font-size: .78rem;
}
.mod-card .list-group-item + .list-group-item {
  border-top: 1px solid rgba(0,0,0,.06);
}
.mod-card .fw-semibold {
  font-size:.8rem;
}
.mod-card small {
  font-size:.7rem;
}
.mod-card .badge {
  border-radius: 14px;
  font-size:.6rem;
  font-weight:700;
  padding:.4rem .55rem;
  letter-spacing:.5px;
  box-shadow:0 2px 6px -2px rgba(0,0,0,.25);
}

/* Mobil finomítás */
@media (max-width: 576px) {
  .mod-card { border-radius:22px; }
  .mod-card .list-group-item { padding:.55rem .75rem; }
}
</style>