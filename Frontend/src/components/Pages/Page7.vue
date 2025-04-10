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

            <!-- Tűzveszélyes tevékenység leírása -->
            <div v-if="field.id === 'fireHazard' && inputValues[field.dbColumn] === 'igen'" class="form-group">
              <label for="fireHazardDetails">Tűzveszélyes tevékenység leírása *</label>
              <textarea
                id="fireHazardDetails"
                v-model="inputValues['tuzveszelyes_tevekenyseg_leiras']"
                placeholder="Írja le a tűzveszélyes tevékenységet"
                class="form-control"
                required
              ></textarea>
              <span v-if="errors.tuzveszelyes_tevekenyseg_leiras" class="error">{{ errors.tuzveszelyes_tevekenyseg_leiras }}</span>
            </div>

            <!-- Vegyi anyag felhasználása várható-e -->
            <div v-if="field.id === 'chemicals' && inputValues[field.dbColumn] === 'igen'" class="form-group">
              <label for="chemicalsDetails">Vegyi anyag felhasználásának részletei *</label>
              <textarea
                id="chemicalsDetails"
                v-model="inputValues['vegyi_anyag_leiras']"
                placeholder="Írja le a vegyi anyag felhasználásával kapcsolatos tevékenységet"
                class="form-control"
                required
              ></textarea>
              <span v-if="errors.vegyi_anyag_leiras" class="error">{{ errors.vegyi_anyag_leiras }}</span>
            </div>

            <!-- Dekoráció részletei -->
            <div v-if="field.id === 'decoration' && inputValues[field.dbColumn] === 'igen'" class="form-group">
              <label for="decorationDetails">Dekoráció részletei *</label>
              <textarea
                id="decorationDetails"
                v-model="inputValues['dekoracio_leiras']"
                placeholder="Írja le a dekoráció részleteit"
                class="form-control"
                required
              ></textarea>
              <span v-if="errors.dekoracio_leiras" class="error">{{ errors.dekoracio_leiras }}</span>
            </div>

            <!-- Portaszolgálat igénylése részletek -->
            <div v-if="field.id === 'securityService' && inputValues[field.dbColumn] === 'igen'" class="form-group">
              <label for="securityServiceDetails">Portaszolgálat részletei *</label>
              <textarea
                id="securityServiceDetails"
                v-model="inputValues['portaszolgalat_leiras']"
                placeholder="Írja le a portaszolgálat igénylésével kapcsolatos részleteket"
                class="form-control"
                required
              ></textarea>
              <span v-if="errors.portaszolgalat_leiras" class="error">{{ errors.portaszolgalat_leiras }}</span>
            </div>

            <span v-if="errors[field.dbColumn]" class="error">{{ errors[field.dbColumn] }}</span>
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
        tuzveszelyes_tevekenyseg: '',
        tuzveszelyes_tevekenyseg_leiras: '',
        vegyi_anyag: '',
        vegyi_anyag_leiras: '',
        dekoracio: '',
        dekoracio_leiras: '',
        portaszolgalat: '',
        portaszolgalat_leiras: '',
      },
      yesNoFields: [
        { id: "fireHazard", label: "Tűzveszélyes tevékenység várható-e?", dbColumn: "tuzveszelyes_tevekenyseg" },
        { id: "chemicals", label: "Vegyi anyag felhasználása várható-e?", dbColumn: "vegyi_anyag" },
        { id: "decoration", label: "Várható-e dekoráció a helyiség légterében?", dbColumn: "dekoracio" },
        { id: "securityService", label: "Portaszolgálat igénylése a rendezvény idejére?", dbColumn: "portaszolgalat" },
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

      // Egyedi mezők validációja
      if (this.inputValues['tuzveszelyes_tevekenyseg'] === 'igen' && !this.inputValues['tuzveszelyes_tevekenyseg_leiras']) {
        this.errors['tuzveszelyes_tevekenyseg_leiras'] = 'Adja meg a tűzveszélyes tevékenység részleteit!';
        isValid = false;
      }
      if (this.inputValues['vegyi_anyag'] === 'igen' && !this.inputValues['vegyi_anyag_leiras']) {
        this.errors['vegyi_anyag_leiras'] = 'Adja meg a vegyi anyag felhasználásának részleteit!';
        isValid = false;
      }
      if (this.inputValues['dekoracio'] === 'igen' && !this.inputValues['dekoracio_leiras']) {
        this.errors['dekoracio_leiras'] = 'Adja meg a dekoráció részleteit!';
        isValid = false;
      }
      if (this.inputValues['portaszolgalat'] === 'igen' && !this.inputValues['portaszolgalat_leiras']) {
        this.errors['portaszolgalat_leiras'] = 'Adja meg a portaszolgálat részleteit!';
        isValid = false;
      }

      return isValid;
    },
    loadDataFromLocalStorage() {
      const savedData = localStorage.getItem('inputValues');
      if (savedData) {
        this.inputValues = JSON.parse(savedData);
        console.log('Adatok betöltve a localStorage-ból (Page7):', this.inputValues);
      }
    },
  },
  mounted() {
    this.loadDataFromLocalStorage();
  },
};
</script>

<style src="/src/assets/css/style_pages.css"></style>
