<template>
  <div class="container">
    <div class="page" :style="{ display: 'block' }">
      <!-- Cím rész -->
      <h2>
        <span>A RENDEZVÉNY RÉSZLETES ADATAI</span>
        <i class="bi bi-info-circle" title="A * részek kötelezőek"></i>
      </h2>

      <!-- Igen/Nem választó mezők közvetlenül -->
      <div class="row">
        <div class="col-md-6" v-for="field in yesNoFields" :key="field.id">
          <div class="form-group mb-4">
            <label :title="field.id === 'cleaningBefore' ? 'Szükséges lehet, amennyiben építési munkálatok vannak a rendezvényt megelőzően.' : ''">{{ field.label }} *</label>
            <div class="radio-group">
              <input
                type="radio"
                :id="field.id + '_igen'"
                :name="field.id"
                value="igen"
                v-model="field.value"
              />
              <label :for="field.id + '_igen'">Igen</label>
              <input
                type="radio"
                :id="field.id + '_nem'"
                :name="field.id"
                value="nem"
                v-model="field.value"
                class="ms-3"
              />
              <label :for="field.id + '_nem'">Nem</label>
            </div>
            <!-- Építési és bontási munkálatok -->
            <div v-if="field.id === 'construction' && field.value === 'igen'" class="form-group">
              <label for="constructionStartDate">Rendezvényterület igénybevételének dátuma *</label>
              <input
                type="date"
                id="constructionStartDate"
                v-model="constructionStartDate"
                class="form-control"
                required
              />
              <label for="constructionStartTime">Rendezvényterület igénybevételének időpontja *</label>
              <input
                type="time"
                id="constructionStartTime"
                v-model="constructionStartTime"
                class="form-control"
                required
              />
              <label for="constructionEndDate">Rendezvényterület visszaadásának dátuma *</label>
              <input
                type="date"
                id="constructionEndDate"
                v-model="constructionEndDate"
                class="form-control"
                required
              />
              <label for="constructionEndTime">Rendezvényterület visszaadásának időpontja *</label>
              <input
                type="time"
                id="constructionEndTime"
                v-model="constructionEndTime"
                class="form-control"
                required
              />
              <label for="subcontractors">Rendezvényen megjelenő alvállalkozók *</label>
              <input
                type="text"
                id="subcontractors"
                v-model="subcontractors"
                placeholder="Adja meg az alvállalkozókat"
                class="form-control"
                required
              />
              <span v-if="errors.constructionStartDate" class="error">{{ errors.constructionStartDate }}</span>
              <span v-if="errors.constructionStartTime" class="error">{{ errors.constructionStartTime }}</span>
              <span v-if="errors.constructionEndDate" class="error">{{ errors.constructionEndDate }}</span>
              <span v-if="errors.constructionEndTime" class="error">{{ errors.constructionEndTime }}</span>
              <span v-if="errors.subcontractors" class="error">{{ errors.subcontractors }}</span>
            </div>
            <!-- Áramigény -->
            <div v-if="field.id === 'powerSupply' && field.value === 'igen'" class="form-group">
              <label for="powerSupplyDetails">Áramigény *</label>
              <input
                type="text"
                id="powerSupplyDetails"
                v-model="powerSupplyDetails"
                placeholder="Áramigény megadása"
                class="form-control"
                required
              />
              <span v-if="errors.powerSupplyDetails" class="error">{{ errors.powerSupplyDetails }}</span>
            </div>
            <!-- További mezők... -->
            <span v-if="errors[field.id]" class="error">{{ errors[field.id] }}</span>
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
      yesNoFields: [
        { id: "construction", label: "Várhatóak a rendezvényen építési és bontási munkálatok?", value: "" },
        { id: "cleaningBefore", label: "Igényel takarítást a rendezvény előtt?", value: "" },
        { id: "cleaningDuring", label: "Igényel takarítási ügyeletet a rendezvény alatt?", value: "" },
        { id: "powerSupply", label: "Szükséges rendezvényszekrényből áram vételezése?", value: "" },
      ],
      constructionStartDate: "", // Rendezvényterület igénybevételének dátuma
      constructionStartTime: "", // Rendezvényterület igénybevételének időpontja
      constructionEndDate: "", // Rendezvényterület visszaadásának dátuma
      constructionEndTime: "", // Rendezvényterület visszaadásának időpontja
      subcontractors: "", // Rendezvényen megjelenő alvállalkozók
      powerSupplyDetails: "", // Áramigény részletei
      errors: {},
    };
  },
  methods: {
    saveDataToLocalStorage() {
      const formData = {
        yesNoFields: this.yesNoFields,
        constructionStartDate: this.constructionStartDate,
        constructionStartTime: this.constructionStartTime,
        constructionEndDate: this.constructionEndDate,
        constructionEndTime: this.constructionEndTime,
        subcontractors: this.subcontractors,
        powerSupplyDetails: this.powerSupplyDetails,
      };
      localStorage.setItem('formDataPage6', JSON.stringify(formData));
      console.log('Adatok mentve a localStorage-ba (Page6):', formData);
    },
    validateForm() {
      this.errors = {};

      // Építési és bontási munkálatok validáció
      const constructionField = this.yesNoFields.find(field => field.id === "construction");
      if (constructionField && constructionField.value === "igen") {
        if (!this.constructionStartDate) {
          this.errors.constructionStartDate = "Kötelező megadni a rendezvényterület igénybevételének dátumát.";
        }
        if (!this.constructionStartTime) {
          this.errors.constructionStartTime = "Kötelező megadni a rendezvényterület igénybevételének időpontját.";
        }
        if (!this.constructionEndDate) {
          this.errors.constructionEndDate = "Kötelező megadni a rendezvényterület visszaadásának dátumát.";
        }
        if (!this.constructionEndTime) {
          this.errors.constructionEndTime = "Kötelező megadni a rendezvényterület visszaadásának időpontját.";
        }
        if (!this.subcontractors) {
          this.errors.subcontractors = "Kötelező megadni a rendezvényen megjelenő alvállalkozókat.";
        }
      }

      // Áramigény validáció
      const powerSupplyField = this.yesNoFields.find(field => field.id === "powerSupply");
      if (powerSupplyField && powerSupplyField.value === "igen" && !this.powerSupplyDetails) {
        this.errors.powerSupplyDetails = "Kötelező megadni az áramigény részleteit.";
      }

      // További validációk...

      return Object.keys(this.errors).length === 0;
    },
  },
};
</script>

<style src="/src/assets/css/style_pages.css"></style>
<style scoped>
.uniform-input {
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}

.uniform-input::placeholder {
  color: #888;
  opacity: 0.5;
}

.form-group {
  margin-bottom: 30px; /* Larger margin between form groups */
}

.error {
  color: red;
  font-size: 0.875rem;
}
</style>