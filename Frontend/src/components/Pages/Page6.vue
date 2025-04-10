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
          </div>
        </div>
      </div>

      <!-- Építési és bontási munkálatok -->
      <div v-if="inputValues['epites'] === 'igen'" class="form-group">
        <label for="constructionStartDate">Rendezvényterület igénybevételének dátuma *</label>
        <input
          type="date"
          id="constructionStartDate"
          v-model="inputValues['epites_kezdet']"
          class="form-control"
          required
        />
        <label for="constructionEndDate">Rendezvényterület visszaadásának dátuma *</label>
        <input
          type="date"
          id="constructionEndDate"
          v-model="inputValues['epites_veg']"
          class="form-control"
          required
        />
        <label for="subcontractors">Rendezvényen megjelenő alvállalkozók *</label>
        <input
          type="text"
          id="subcontractors"
          v-model="inputValues['epites_vallalkozok']"
          placeholder="Adja meg az alvállalkozókat"
          class="form-control"
          required
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      inputValues: JSON.parse(localStorage.getItem('inputValues')) || {
        epites: '',
        epites_kezdet: '',
        epites_veg: '',
        epites_vallalkozok: '',
        aramigeny: '', // Átalakítva boolean-re
        takaritas: '',
        takaritas_alatt: '',
      },
      yesNoFields: [
        { id: "construction", label: "Várhatóak a rendezvényen építési és bontási munkálatok?", dbColumn: "epites" },
        { id: "powerSupply", label: "Szükséges rendezvényszekrényből áram vételezése?", dbColumn: "aramigeny" }, // Átalakítva boolean-re
        { id: "cleaningBefore", label: "Igényel takarítást a rendezvény előtt?", dbColumn: "takaritas" },
        { id: "cleaningDuring", label: "Igényel takarítási ügyeletet a rendezvény alatt?", dbColumn: "takaritas_alatt" },
      ],
      errors: {},
    };
  },
  watch: {
    inputValues: {
      handler(newValues) {
        localStorage.setItem('inputValues', JSON.stringify(newValues)); // Mentés localStorage-be
      },
      deep: true,
    },
  },
  methods: {
    validatePage() {
      this.errors = {};
      let isValid = true;

      // Kötelező mezők ellenőrzése
      this.yesNoFields.forEach((field) => {
        if (!this.inputValues[field.dbColumn]) {
          this.errors[field.dbColumn] = 'A mező kitöltése kötelező!';
          isValid = false;
        }
      });

      // Építési munkálatok ellenőrzése
      if (this.inputValues['epites'] === 'igen') {
        if (!this.inputValues['epites_kezdet']) {
          this.errors['epites_kezdet'] = 'Adja meg az építési kezdés dátumát!';
          isValid = false;
        }
        if (!this.inputValues['epites_veg']) {
          this.errors['epites_veg'] = 'Adja meg az építési befejezés dátumát!';
          isValid = false;
        }
        if (!this.inputValues['epites_vallalkozok']) {
          this.errors['epites_vallalkozok'] = 'Adja meg az alvállalkozókat!';
          isValid = false;
        }
      }

      return isValid;
    },
  },
  mounted() {
    const savedData = localStorage.getItem('inputValues');
    if (savedData) {
      this.inputValues = JSON.parse(savedData);
      console.log('Adatok betöltve a localStorage-ból (Page6):', this.inputValues);
    }
  },
};
</script>

<style src="/src/assets/css/style_pages.css"></style>
