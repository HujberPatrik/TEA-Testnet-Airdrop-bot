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

            <!-- Szállásigény létszám mezője -->
            <div v-if="field.id === 'accommodation' && inputValues[field.dbColumn] === 'igen'" class="form-group mt-3">
              <label for="accommodationCount">Szállásigény várható létszáma *</label>
              <input
                type="number"
                id="accommodationCount"
                v-model="inputValues['szallasigeny_letszam']"
                placeholder="Adja meg a létszámot"
                class="form-control uniform-input"
                required
              />
              <span v-if="errors.szallasigeny_letszam" class="error">{{ errors.szallasigeny_letszam }}</span>
            </div>

            <!-- Parkolóhely igény részletei -->
            <div v-if="field.id === 'parking' && inputValues[field.dbColumn] === 'igen'" class="form-group mt-3">
              <label for="parkingDetails">Várható gépkocsiforgalom és parkolóhely igény *</label>
              <textarea
                id="parkingDetails"
                v-model="inputValues['parkolo_reszletek']"
                placeholder="Adja meg a várható gépkocsiforgalom és parkolóhely igény részleteit"
                class="form-control uniform-input"
                required
              ></textarea>
              <span v-if="errors.parkolo_reszletek" class="error">{{ errors.parkolo_reszletek }}</span>
            </div>

            <!-- Hulladék elszállításának módja -->
            <div v-if="field.id === 'waste' && inputValues[field.dbColumn] === 'igen'" class="form-group mt-3">
              <label for="wasteDisposalMethod">Hulladék elszállításának módja *</label>
              <select
                id="wasteDisposalMethod"
                v-model="inputValues['hulladek_elszallitas_modja']"
                class="form-control uniform-input"
                required
              >
                <option value="" disabled>Válasszon egy opciót</option>
                <option value="sajat">Saját úton</option>
                <option value="egyetem">Egyetem által biztosítva</option>
              </select>
              <span v-if="errors.hulladek_elszallitas_modja" class="error">{{ errors.hulladek_elszallitas_modja }}</span>

              <!-- Ha a "Saját úton" opció van kiválasztva -->
              <div v-if="inputValues['hulladek_elszallitas_modja'] === 'sajat'" class="form-group mt-3">
                <label for="wasteDisposalResponsible">Ki végzi a hulladék elszállítását? *</label>
                <input
                  type="text"
                  id="wasteDisposalResponsible"
                  v-model="inputValues['hulladek_elszallitas_felelos']"
                  placeholder="Adja meg a felelős személyt vagy céget"
                  class="form-control uniform-input"
                  required
                />
                <span v-if="errors.hulladek_elszallitas_felelos" class="error">{{ errors.hulladek_elszallitas_felelos }}</span>
              </div>
            </div>
            <span v-if="errors[field.dbColumn]" class="error">{{ errors[field.dbColumn] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      inputValues: JSON.parse(localStorage.getItem('inputValues')) || {}, // Betöltés localStorage-ből
      yesNoFields: [
        { id: "accommodation", label: "Van a rendezvény idejére szállásigénye?", dbColumn: "szallasigeny" },
        { id: "parking", label: "Van parkolóhely igénye?", dbColumn: "parkolo" },
        { id: "waste", label: "Keletkezik hulladék?", dbColumn: "hulladek" },
        { id: "internet", label: "Szükséges internetkapcsolat (WiFi) a rendezvény idejére?", dbColumn: "internet" },
      ],
      errors: {},
    };
  },
  watch: {
    inputValues: {
      handler(newValues) {
        localStorage.setItem('inputValues', JSON.stringify(newValues)); // Mentés localStorage-be
      },
      deep: true, // Mélyfigyelés az objektum változásaira
    },
  },
  methods: {
    async sendAllDataToBackend() {
      try {
        const data = JSON.parse(localStorage.getItem('inputValues')) || {};
        console.log('Küldött adatok:', data); // Ellenőrizd az adatokat a konzolon
        const response = await axios.post('http://localhost:3000/api/kerveny', data);

        console.log('Sikeres mentés:', response.data);
        alert('Az összes oldal adatai sikeresen mentve az adatbázisba!');
        localStorage.removeItem('inputValues'); // Törlés a localStorage-ből sikeres mentés után
      } catch (error) {
        console.error('Hiba történt az API-kérés során:', error);
        alert('Nem sikerült menteni az adatokat. Próbálja újra később!');
      }
    },
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

      // Egyéb validációk
      if (this.inputValues['szallasigeny'] === 'igen' && !this.inputValues['szallasigeny_letszam']) {
        this.errors['szallasigeny_letszam'] = 'Adja meg a szállásigény létszámát!';
        isValid = false;
      }
      if (this.inputValues['parkolo'] === 'igen' && !this.inputValues['parkolo_reszletek']) {
        this.errors['parkolo_reszletek'] = 'Adja meg a parkolóhely igény részleteit!';
        isValid = false;
      }
      if (this.inputValues['hulladek'] === 'igen' && !this.inputValues['hulladek_elszallitas_modja']) {
        this.errors['hulladek_elszallitas_modja'] = 'Adja meg a hulladék elszállításának módját!';
        isValid = false;
      }
      if (
        this.inputValues['hulladek_elszallitas_modja'] === 'sajat' &&
        !this.inputValues['hulladek_elszallitas_felelos']
      ) {
        this.errors['hulladek_elszallitas_felelos'] = 'Adja meg, ki végzi a hulladék elszállítását!';
        isValid = false;
      }

      return isValid;
    },
    navigate(page) {
      if (this.validatePage()) {
        localStorage.setItem('inputValues', JSON.stringify(this.inputValues));
        if (page >= 1 && page <= this.pages.length) {
          this.activePage = page;
        }
      }
    },
  },
  mounted() {
    const savedData = localStorage.getItem('inputValues');
    if (savedData) {
      this.inputValues = JSON.parse(savedData);
      console.log('Adatok betöltve a localStorage-ból (Page4):', this.inputValues);
    }
  },
};
</script>

<style src="/src/assets/css/style_pages.css"></style>
