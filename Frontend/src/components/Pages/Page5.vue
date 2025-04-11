<template> 
  <div class="container">
    <div class="page" :style="{ display: 'block' }">
      <!-- Cím rész -->
      <h2>
        <span>A RENDEZVÉNY RÉSZLETES ADATAI</span>
        <i class="bi bi-info-circle" title="A * részek kötelezőek"></i>
      </h2>

      <!-- Igen/Nem választó mezők -->
      <div class="row">
        <div class="col-md-6" v-for="field in yesNoFields" :key="field.id">
          <div class="form-group mb-4">
            <label>{{ field.label }} *</label>
            <div class="radio-group">
              <input
                type="radio"
                :id="field.id + '_igen'"
                :name="field.id"
                value="igen"
                v-model="inputValues[field.dbColumn]"
              />
              <label :for="field.id + '_igen'">Igen</label>
              <input
                type="radio"
                :id="field.id + '_nem'"
                :name="field.id"
                value="nem"
                v-model="inputValues[field.dbColumn]"
                class="ms-3"
              />
              <label :for="field.id + '_nem'">Nem</label>
            </div>
            <span v-if="errors[field.dbColumn]" class="error">{{ errors[field.dbColumn] }}</span>

            <!-- Fotó és/vagy videófelvétel részletei -->
            <div v-if="field.id === 'photography' && inputValues[field.dbColumn] === 'igen'" class="form-group">
              <label for="photographyDetails">Milyen eszközzel fog történni? *</label>
              <textarea
                id="photographyDetails"
                v-model="inputValues['foto_reszletek']"
                placeholder="Fényképezőgép, videokamera, GoPro, drón, stb."
                class="form-control uniform-input"
                required
              ></textarea>
              <span v-if="errors.foto_reszletek" class="error">{{ errors.foto_reszletek }}</span>
            </div>

            <!-- Catering típusa -->
            <div v-if="field.id === 'catering' && inputValues[field.dbColumn] === 'igen'" class="form-group">
              <label>Catering típusa *</label>
              <div>
                <input type="checkbox" id="coldFood" value="hideg étel" v-model="inputValues['catering_tipus']" />
                <label for="coldFood" class="checkbox-label">hideg étel</label>
              </div>
              <div>
                <input type="checkbox" id="hotFood" value="meleg étel" v-model="inputValues['catering_tipus']" />
                <label for="hotFood" class="checkbox-label">meleg étel</label>
              </div>
              <div>
                <input type="checkbox" id="drinks" value="kávé, tea, üdítő" v-model="inputValues['catering_tipus']" />
                <label for="drinks" class="checkbox-label">kávé, tea, üdítő</label>
              </div>
              <span v-if="Array.isArray(inputValues['catering_tipus']) && !inputValues['catering_tipus'].length && errors.catering_tipus" class="error">
                {{ errors.catering_tipus }}
              </span>
            </div>

            <!-- Oktatástechnikai eszközigény -->
            <div v-if="field.id === 'technicalSupport' && inputValues[field.dbColumn] === 'igen'" class="form-group mt-3">
              <label for="technicalEquipmentNeeds">Oktatástechnikai eszközigény *</label>
              <input
                type="text"
                id="technicalEquipmentNeeds"
                v-model="inputValues['oktatas_eszkozok']"
                placeholder="laptop, projektor, prezenter, stb."
                class="form-control uniform-input"
                required
              />
              <span v-if="errors.oktatas_eszkozok" class="error">{{ errors.oktatas_eszkozok }}</span>
            </div>

            <!-- Korlátozott mozgású személyek részletei -->
            <div v-if="field.id === 'disabledAccess' && inputValues[field.dbColumn] === 'igen'" class="form-group mt-3">
              <label for="disabledAccessDetails">Korlátozott mozgású személyek részvételének részletei *</label>
              <textarea
                id="disabledAccessDetails"
                v-model="inputValues['korlatozott_mozgas_reszletek']"
                placeholder="Adja meg a részleteket"
                class="form-control uniform-input"
                required
              ></textarea>
              <span v-if="errors.korlatozott_mozgas_reszletek" class="error">
                {{ errors.korlatozott_mozgas_reszletek }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      inputValues: JSON.parse(localStorage.getItem('inputValues')) || {
        foto: null,
        foto_reszletek: null,
        cater: null,
        catering_tipus: [],
        oktatastechnika: null,
        oktatas_eszkozok: null,
        korlatozott_mozgas: null,
        korlatozott_mozgas_reszletek: null,
      },
      yesNoFields: [
        { id: "photography", label: "Fotó és/vagy videófelvétel készül-e a rendezvényen?", dbColumn: "foto" },
        { id: "catering", label: "Lesz a rendezvény területén catering?", dbColumn: "cater" },
        { id: "technicalSupport", label: "Szükséges-e oktatástechnikai támogatás?", dbColumn: "oktatastechnika" },
        { id: "disabledAccess", label: "Korlátozott mozgású személyek részt vesznek?", dbColumn: "korlatozott_mozgas" },
      ],
      errors: {},
    };
  },
  watch: {
    inputValues: {
      handler(newValues) {
        if (!Array.isArray(newValues.catering_tipus)) {
          newValues.catering_tipus = [];
        }
        localStorage.setItem('inputValues', JSON.stringify(newValues));
      },
      deep: true,
    },
  },
  methods: {
    validatePage() {
      this.errors = {};
      let isValid = true;

      this.yesNoFields.forEach((field) => {
        if (!this.inputValues[field.dbColumn]) {
          this.errors[field.dbColumn] = 'A mező kitöltése kötelező!';
          isValid = false;
        }
      });

      if (this.inputValues['foto'] === 'igen' && !this.inputValues['foto_reszletek']) {
        this.errors['foto_reszletek'] = 'Adja meg a fotó/videó részleteit!';
        isValid = false;
      }
      if (
        this.inputValues['cater'] === 'igen' &&
        (!Array.isArray(this.inputValues['catering_tipus']) || !this.inputValues['catering_tipus'].length)
      ) {
        this.errors['catering_tipus'] = 'Legalább egy opciót ki kell választani!';
        isValid = false;
      }
      if (this.inputValues['oktatastechnika'] === 'igen' && !this.inputValues['oktatas_eszkozok']) {
        this.errors['oktatas_eszkozok'] = 'Adja meg az oktatástechnikai eszközöket!';
        isValid = false;
      }
      if (this.inputValues['korlatozott_mozgas'] === 'igen' && !this.inputValues['korlatozott_mozgas_reszletek']) {
        this.errors['korlatozott_mozgas_reszletek'] = 'Adja meg a korlátozott mozgású személyek részleteit!';
        isValid = false;
      }

      return isValid;
    },
    navigate(page) {
      if (this.validatePage()) {
        this.saveDataToLocalStorage();
        if (page >= 1 && page <= this.pages.length) {
          this.activePage = page;
        }
      }
    },
    saveDataToLocalStorage() {
      localStorage.setItem('inputValues', JSON.stringify(this.inputValues));
      console.log('Adatok mentve a localStorage-ba:', this.inputValues);
    },
    loadDataFromLocalStorage() {
      const savedData = localStorage.getItem('inputValues');
      if (savedData) {
        this.inputValues = JSON.parse(savedData);
        Object.keys(this.inputValues).forEach((key) => {
          if (this.inputValues[key] === undefined || this.inputValues[key] === '') {
            this.inputValues[key] = null;
          }
        });
        console.log('Adatok betöltve a localStorage-ból (Page5):', this.inputValues);
      }
    },
    async sendDataToBackend() {
      if (this.validatePage()) {
        try {
          console.log('Küldött adatok:', this.inputValues);
          const response = await axios.post('http://localhost:3000/api/kerveny', this.inputValues);
          console.log('Sikeres mentés:', response.data);
          alert('A rendezvény adatai sikeresen mentve az adatbázisba!');
          localStorage.removeItem('inputValues');
        } catch (error) {
          console.error('Hiba történt az API-kérés során:', error);
          alert('Nem sikerült menteni a rendezvény adatait. Próbálja újra később!');
        }
      } else {
        alert('Kérjük, töltse ki az összes kötelező mezőt!');
      }
    },
  },
  mounted() {
    this.loadDataFromLocalStorage();
  },
};
</script>

<style src="/src/assets/css/style_pages.css"></style>