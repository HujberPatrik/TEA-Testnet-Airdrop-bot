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
            v-model="eventNature"
            placeholder="Például: konferencia, workshop, koncert, stb."
            class="form-control"
            required
          />
          <span v-if="errors.eventNature" class="error">{{ errors.eventNature }}</span>
        </div>
      </div>

      <!-- Részletes programterv és Helyszín berendezési módja -->
      <div class="form-row program-and-layout">
        <!-- Részletes programterv -->
        <div class="form-group detailed-program">
          <label for="eventProgram">Részletes programterv *</label>
          <textarea
            id="eventProgram"
            v-model="eventProgram"
            placeholder="Adja meg a rendezvény részletes programtervét"
            class="form-control"
            required
          ></textarea>
          <span v-if="errors.eventProgram" class="error">{{ errors.eventProgram }}</span>
        </div>

        <!-- Helyszín berendezési módja -->
        <div class="form-group layout-arrangement">
          <label for="venueSetup">Helyszín berendezési módja</label>
          <textarea
            id="venueSetup"
            v-model="venueSetup"
            placeholder="Csatolva is megfelelő, amennyiben nem tudja megadni a berendezés módját, kollégáink felveszik Önnel a kapcsolatot."
            class="form-control"
          ></textarea>
        </div>
      </div>

      <!-- Villanyszerelői ügyelet és Várható tevékenységek egymás mellett -->
      <div class="form-row electrician-and-activities">
        <div class="form-group electrician-duty">
          <label for="electricianDuty">Szükséges villanyszerelői ügyelet? *</label>
          <select id="electricianDuty" v-model="electricianDuty" class="form-control" required>
            <option value="" disabled>Válasszon egy opciót</option>
            <option value="rendezvény előtt">Rendezvény előtt</option>
            <option value="rendezvény közben">Rendezvény közben</option>
            <option value="rendezvény után">Rendezvény után</option>
            <option value="nem szükséges">Nem szükséges</option>
          </select>
          <span v-if="errors.electricianDuty" class="error">{{ errors.electricianDuty }}</span>
        </div>

        <div class="form-group expected-activities">
          <label for="expectedActivities">Várható-e az alábbi tevékenységek közül valamelyik? *</label>
          <select
            id="expectedActivities"
            v-model="expectedActivity"
            class="form-control"
            required
          >
            <option value="" disabled>Válasszon egy opciót</option>
            <option v-for="activity in activities" :key="activity" :value="activity">
              {{ activity }}
            </option>
          </select>
          <span v-if="errors.expectedActivity" class="error">{{ errors.expectedActivity }}</span>
          <input
            v-if="expectedActivity === 'egyéb'"
            type="text"
            v-model="otherActivity"
            placeholder="Kérjük, adja meg"
            class="form-control mt-2"
          />
        </div>
      </div>

      <!-- Beküldés gomb eltávolítva -->
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      eventNature: "",
      eventProgram: "",
      venueSetup: "",
      electricianDuty: "",
      expectedActivity: "",
      otherActivity: "",
      activities: ["por", "füst", "páraképződés", "egyik sem várható", "egyéb"],
      activeAccordion: 0,
      errors: {},
    };
  },
  computed: {
    groupedYesNoFields() {
      const groupSize = 4;
      return this.yesNoFields.reduce((groups, field, index) => {
        const groupIndex = Math.floor(index / groupSize);
        if (!groups[groupIndex]) {
          groups[groupIndex] = [];
        }
        groups[groupIndex].push(field);
        return groups;
      }, []);
    },
  },
  methods: {
    toggleAccordion(index) {
      this.activeAccordion = this.activeAccordion === index ? null : index;
    },
    saveDataToLocalStorage() {
      const formData = {
        eventNature: this.eventNature,
        eventProgram: this.eventProgram,
        venueSetup: this.venueSetup,
        electricianDuty: this.electricianDuty,
        expectedActivity: this.expectedActivity,
        otherActivity: this.otherActivity,
      };
      localStorage.setItem('formData', JSON.stringify(formData));
      console.log('Adatok mentve a localStorage-ba:', formData);
    },
    validateForm() {
      this.errors = {};
      if (!this.eventNature) {
        this.errors.eventNature = 'A rendezvény jellege kötelező!';
      }
      if (!this.eventProgram) {
        this.errors.eventProgram = 'A részletes programterv kötelező!';
      }
      if (!this.electricianDuty) {
        this.errors.electricianDuty = 'A villanyszerelői ügyelet kiválasztása kötelező!';
      }
      if (!this.expectedActivity) {
        this.errors.expectedActivity = 'A várható tevékenység kiválasztása kötelező!';
      }
      return Object.keys(this.errors).length === 0;
    },
    submitForm() {
      if (this.validateForm()) {
        this.saveDataToLocalStorage();
        alert('Adatok sikeresen mentve!');
      }
    },
  },
};
</script>

<style src="/src/assets/css/style_pages.css"></style>