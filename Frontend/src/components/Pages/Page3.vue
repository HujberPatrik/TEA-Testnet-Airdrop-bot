<template>
  <div class="container">
    <div class="page" :style="{ display: 'block' }">
      <!-- Cím rész -->
      <h2>
        <span>A RENDEZVÉNY RÉSZLETES ADATAI</span>
        <i class="bi bi-info-circle" title="A * részek kötelezőek"></i>
      </h2>

      <!-- Rendezvény jellege -->
      <div class="form-row">
        <div class="form-group">
          <label for="eventNature">Rendezvény jellege *</label>
          <input
            type="text"
            id="eventNature"
            v-model="inputValues['jelleg']"
            placeholder="Például: konferencia, workshop, koncert, stb."
            class="form-control"
            required
          />
          <span v-if="errors['jelleg']" class="error">{{ errors['jelleg'] }}</span>
        </div>
      </div>

      <!-- Részletes programterv és Helyszín berendezési módja -->
      <div class="form-row program-and-layout">
        <!-- Részletes programterv -->
        <div class="form-group detailed-program">
          <label for="eventProgram">Részletes programterv *</label>
          <textarea
            id="eventProgram"
            v-model="inputValues['programterv']"
            placeholder="Adja meg a rendezvény részletes programtervét"
            class="form-control"
            required
          ></textarea>
          <span v-if="errors['programterv']" class="error">{{ errors['programterv'] }}</span>
        </div>

        <!-- Helyszín berendezési módja -->
        <div class="form-group layout-arrangement">
          <label for="venueSetup">Helyszín berendezési módja</label>
          <textarea
            id="venueSetup"
            v-model="inputValues['berendezesi_mod']"
            placeholder="Csatolva is megfelelő, amennyiben nem tudja megadni a berendezés módját, kollégáink felveszik Önnel a kapcsolatot."
            class="form-control"
          ></textarea>
        </div>
      </div>

      <!-- Villanyszerelői ügyelet és Várható tevékenységek egymás mellett -->
      <div class="form-row electrician-and-activities">
        <div class="form-group electrician-duty">
          <label for="electricianDuty">Szükséges villanyszerelői ügyelet? *</label>
          <select id="electricianDuty" v-model="inputValues['villanyszerelo']" class="form-control" required>
            <option value="" disabled>Válasszon egy opciót</option>
            <option value="rendezvény előtt">Rendezvény előtt</option>
            <option value="rendezvény közben">Rendezvény közben</option>
            <option value="rendezvény után">Rendezvény után</option>
            <option value="nem szükséges">Nem szükséges</option>
          </select>
          <span v-if="errors['villanyszerelo']" class="error">{{ errors['villanyszerelo'] }}</span>
        </div>

        <div class="form-group expected-activities">
          <label for="expectedActivities">Várható-e az alábbi tevékenységek közül valamelyik? *</label>
          <select
            id="expectedActivities"
            v-model="inputValues['leg_szennyezes']"
            class="form-control"
            required
          >
            <option value="" disabled>Válasszon egy opciót</option>
            <option v-for="activity in activities" :key="activity" :value="activity">
              {{ activity }}
            </option>
          </select>
          <span v-if="errors['leg_szennyezes']" class="error">{{ errors['leg_szennyezes'] }}</span>
          <input
            v-if="inputValues['leg_szennyezes'] === 'egyéb'"
            type="text"
            v-model="inputValues['egyeb_tevekenyseg']"
            placeholder="Kérjük, adja meg"
            class="form-control mt-2"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      inputValues: JSON.parse(localStorage.getItem('inputValues')) || {}, // Betöltés localStorage-ből
      errors: {},
      activities: ["por", "füst", "páraképződés", "egyik sem várható", "egyéb"],
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
      const requiredFields = ['jelleg', 'programterv', 'villanyszerelo', 'leg_szennyezes'];
      requiredFields.forEach((field) => {
        if (!this.inputValues[field]) {
          this.errors[field] = 'A mező kitöltése kötelező!';
          isValid = false;
        }
      });

      // Egyéb tevékenység ellenőrzése, ha szükséges
      if (this.inputValues['leg_szennyezes'] === 'egyéb' && !this.inputValues['egyeb_tevekenyseg']) {
        this.errors['egyeb_tevekenyseg'] = 'Kérjük, adja meg az egyéb tevékenységet!';
        isValid = false;
      }

      return isValid;
    },
    saveDataToLocalStorage() {
      localStorage.setItem('inputValues', JSON.stringify(this.inputValues));
      console.log('Adatok mentve a localStorage-ba:', this.inputValues);
    },
  },
  mounted() {
    const savedData = localStorage.getItem('inputValues');
    if (savedData) {
      this.inputValues = JSON.parse(savedData);
      console.log('Adatok betöltve a localStorage-ból (Page3):', this.inputValues);
    }
  },
};
</script>

<style src="/src/assets/css/style_pages.css"></style>