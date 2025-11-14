<template>
  <div
    class="row g-3 mb-3"
    v-if="ufModList.length || uniModList.length || ufOfferList.length || uniOfferList.length"
  >
    <!-- UF Módosítás kérve (nem láthatja a Rendezvényszervező) -->
    <div class="col-md-6" v-if="ufModList.length && !isEventOrganizer">
      <div class="card mod-card mod-card-uf h-100">
        <div class="card-header text-dark fw-bold">
          <i class="fas fa-exclamation-circle me-1"></i>UF módosítás kérve
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item" v-for="ev in ufModList" :key="'ufmod-'+ev.id">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="fw-semibold">{{ ev.nev }}</div>
                <small class="text-muted d-block">Indok: {{ ev.modositasi_indok }}</small>
              </div>
              <span class="badge badge-mod badge-uf">
                <i class="fas fa-user-cog me-1"></i>UF módosítás
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Egyetemi módosítás kérve -->
    <div class="col-md-6" v-if="uniModList.length">
      <div class="card mod-card mod-card-uni h-100">
        <div class="card-header text-dark fw-bold">
          <i class="fas fa-exclamation-circle me-1"></i>Egyetemi módosítás kérve
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item" v-for="ev in uniModList" :key="'unimod-'+ev.id">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="fw-semibold">{{ ev.nev }}</div>
                <small class="text-muted d-block">Indok: {{ ev.modositasi_indok }}</small>
              </div>
              <span class="badge badge-mod badge-uni">
                <i class="fas fa-university me-1"></i>Egyetemi módosítás
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- UF árajánlat beadva -->
    <div class="col-md-6" v-if="ufOfferList.length">
      <div class="card mod-card offer-card offer-uf h-100">
        <div class="card-header fw-bold">
          <i class="fas fa-file-invoice-dollar me-1"></i>UF árajánlat beadva
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item" v-for="ev in ufOfferList" :key="'ufoffer-'+ev.id">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="fw-semibold">{{ ev.nev }}</div>
                <small class="text-muted d-block">
                  Ajánlatot adta: {{ offerProvider(ev) }} – {{ offerPrice(ev) }}
                </small>
              </div>
              <span class="badge badge-offer badge-uf">
                <i class="fas fa-check me-1"></i>UF ajánlat
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Egyetemi árajánlat beadva -->
    <div class="col-md-6" v-if="uniOfferList.length">
      <div class="card mod-card offer-card offer-uni h-100">
        <div class="card-header fw-bold">
          <i class="fas fa-file-invoice-dollar me-1"></i>Egyetemi árajánlat beadva
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item" v-for="ev in uniOfferList" :key="'unioffer-'+ev.id">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="fw-semibold">{{ ev.nev }}</div>
                <small class="text-muted d-block">
                  Ajánlatot adta: {{ offerProvider(ev) }} – {{ offerPrice(ev) }}
                </small>
              </div>
              <span class="badge badge-offer badge-uni">
                <i class="fas fa-check me-1"></i>Egyetemi ajánlat
              </span>
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
    events: { type: Array, default: () => [] },
    isEventOrganizer: { type: Boolean, default: false }
  },
  data() {
    return {
      // { [kerveny_id]: { uf, uni, uf_total, uni_total, type? } }
      offerNames: {}
    };
  },
  computed: {
    // Módosítás kérések
    ufModList() {
      return this.events.filter(e =>
        !!e?.modositasi_indok &&
        this.normStatus(e?.statusz) === 'UF_ARAJANLATRA_VAR'
      );
    },
    uniModList() {
      return this.events.filter(e =>
        !!e?.modositasi_indok &&
        this.normStatus(e?.statusz) === 'ARAJANLAT_KESZITESERE_VAR'
      );
    },
    // Beadott ajánlatok – pricing_type alapján osztjuk szét
    ufOfferList() {
      return this.events.filter(e => this.isOfferPhase(e) && this.offerType(e) === 'famulus');
    },
    uniOfferList() {
      return this.events.filter(e => this.isOfferPhase(e) && this.offerType(e) === 'uni');
    }
  },
  watch: {
    events: {
      immediate: true,
      handler(list) {
        // Az összes “ajánlat beadva” fázisban lévő kérelem ID-ja
        const ids = Array.from(new Set(
          (list || [])
            .filter(e => this.isOfferPhase(e))
            .map(e => e.id)
            .filter(id => Number.isInteger(id))
        ));
         if (ids.length) this.fetchOfferNames(ids);
      }
    }
  },
  methods: {
    normStatus(s) { return String(s || '').toUpperCase(); },
    // Elfogadásra váró ajánlat státuszai (mindkét variánst elfogadjuk)
    isOfferPhase(ev) {
      const s = this.normStatus(ev?.statusz);
      return s === 'ARAJANLAT_ELFOGADASRA_VAR' ||
             s === 'UF_ARAJANLAT_ELFOGADASRA_VAR' || // ha így érkezik
             s === 'UF_ARAJANLAT_ELFOGADASARA_VAR';  // typo variáns támogatása
    },
    // pricing_type meghatározása
    offerType(ev) {
      const pt = String(ev?.pricing_type || ev?.pricingType || '').toLowerCase();
      if (pt === 'uni' || pt === 'university') return 'uni';
      if (pt === 'uf' || pt === 'famulus') return 'famulus';
      // fallback: ha az API-ból jött összeg egyértelmű
      const o = this.offerNames?.[ev?.id] || {};
      if ((o.uni_total || 0) > 0 && (o.uf_total || 0) <= 0) return 'uni';
      if ((o.uf_total || 0) > 0 && (o.uni_total || 0) <= 0) return 'famulus';
      // utolsó fallback: státusz prefix alapján
      const s = this.normStatus(ev?.statusz);
      if (s.startsWith('UF_')) return 'famulus';
      return 'uni';
    },
    async fetchOfferNames(ids) {
      try {
        const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:3000').replace(/\/$/, '');
        const res = await fetch(`${API_BASE}/api/kerveny/offer-providers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids })
        });
        if (!res.ok) return;
        const rows = await res.json();
        const map = {};
        for (const r of rows) {
          const uf_total = Number(r.uf_total ?? 0);
          const uni_total = Number(r.uni_total ?? 0);
          let type = null;
          if (uni_total > 0 && uf_total <= 0) type = 'uni';
          else if (uf_total > 0 && uni_total <= 0) type = 'famulus';
          map[r.kerveny_id] = {
            uf: r.uf_offer_by_name || 'Ismeretlen',
            uni: r.uni_offer_by_name || 'Ismeretlen',
            uf_total,
            uni_total,
            type
          };
        }
        this.offerNames = map;
      } catch (e) {
        console.warn('offer-providers fetch failed', e);
      }
    },
    formatHUF(v) {
      const n = Number(v || 0);
      return new Intl.NumberFormat('hu-HU', {
        style: 'currency',
        currency: 'HUF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(n);
    },
    offerProvider(ev) {
      const t = this.offerType(ev);
      if (t === 'uni') return this.offerNames?.[ev.id]?.uni || 'Ismeretlen';
      return this.offerNames?.[ev.id]?.uf || 'Ismeretlen';
    },
    offerPrice(ev) {
      const t = this.offerType(ev);
      const o = this.offerNames?.[ev.id] || {};
      const val = t === 'uni' ? (o.uni_total || 0) : (o.uf_total || 0);
      return this.formatHUF(val);
    }
  }
};
</script>

<style scoped>
.mod-card {
  border: none;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  padding-top: .3rem;
  box-shadow: 0 6px 16px -8px rgba(0,0,0,.25), 0 2px 6px -2px rgba(0,0,0,.12);
  background: #fff;
  transition: .18s;
}
.mod-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px -10px rgba(0,0,0,.28), 0 4px 10px -3px rgba(0,0,0,.15);
}
.mod-card .card-header {
  margin: 0 10px;
  border-radius: 18px;
  font-size: .78rem;
  padding: .5rem .85rem;
  letter-spacing: .4px;
  text-transform: uppercase;
  display:flex;
  align-items:center;
  gap:.4rem;
}
.mod-card-uf { background: #fff7e0; }
.mod-card-uni { background: #f0f7ff; }

.mod-card-uf .card-header { background:#ffb23a; }
.mod-card-uni .card-header {
  background:#4aa7ff;
  color:#fff;
  text-shadow:0 1px 2px rgba(0,0,0,.25);
}

.offer-card.offer-uf { background:#fff4e6; }
.offer-card.offer-uni { background:#e9f3ff; }
.offer-card.offer-uf .card-header { background:#ff9e24; }
.offer-card.offer-uni .card-header { background:#2e8df5; color:#fff; }

.list-group-item {
  background: transparent;
  border: none;
  padding: .55rem .85rem;
  font-size: .72rem;
}
.list-group-item + .list-group-item {
  border-top: 1px solid rgba(0,0,0,.06);
}
.fw-semibold { font-size:.75rem; }

.badge {
  border-radius: 14px;
  font-size:.55rem;
  font-weight:700;
  padding:.35rem .55rem;
  letter-spacing:.4px;
  box-shadow:0 2px 6px -2px rgba(0,0,0,.25);
  display:inline-flex;
  align-items:center;
}
.badge i { font-size:.6rem; }

.badge-mod.badge-uf { background:#ffcf66; color:#5d4100; }
.badge-mod.badge-uni { background:#9dd2ff; color:#053b63; }

.badge-offer.badge-uf { background:#ffb14a; color:#4a3200; }
.badge-offer.badge-uni { background:#6fb9ff; color:#043354; }

@media (max-width: 576px) {
  .mod-card { border-radius:20px; }
  .list-group-item { padding:.5rem .7rem; }
  .badge { font-size:.5rem; padding:.3rem .5rem; }
}
</style>