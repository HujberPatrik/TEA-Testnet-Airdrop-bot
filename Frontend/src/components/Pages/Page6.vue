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
        <span v-if="errors.yesNoFields" class="error">{{ errors.yesNoFields }}</span>
        <div class="col-md-6" v-for="field in yesNoFields" :key="field.id">
          <div class="form-group mb-4">
            <label>{{ field.label }} *</label>
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
      constructionStartDate: "",
      constructionStartTime: "",
      constructionEndDate: "",
      constructionEndTime: "",
      subcontractors: "",
      powerSupplyDetails: "",
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
      localStorage.setItem("formDataPage6", JSON.stringify(formData));
      console.log("Adatok mentve a localStorage-ba (Page6):", formData);
    },
    loadDataFromLocalStorage() {
      const savedData = localStorage.getItem("formDataPage6");
      if (savedData) {
        const data = JSON.parse(savedData);
        this.yesNoFields = data.yesNoFields || this.yesNoFields;
        this.constructionStartDate = data.constructionStartDate || "";
        this.constructionStartTime = data.constructionStartTime || "";
        this.constructionEndDate = data.constructionEndDate || "";
        this.constructionEndTime = data.constructionEndTime || "";
        this.subcontractors = data.subcontractors || "";
        this.powerSupplyDetails = data.powerSupplyDetails || "";
        console.log("Adatok betöltve a localStorage-ból (Page6):", data);
      }
    },
    validatePage() {
      this.errors = {};
      let isValid = true;

      // Kötelező mezők ellenőrzése a yesNoFields alapján
      this.yesNoFields.forEach((field) => {
        if (!field.value) {
          this.errors[field.id] = "A mező kitöltése kötelező!.";
          isValid = false;
        }
      });

      // Építési és bontási munkálatok mezők ellenőrzése
      const constructionField = this.yesNoFields.find((field) => field.id === "construction");
      if (constructionField && constructionField.value === "igen") {
        if (!this.constructionStartDate) {
          this.errors.constructionStartDate = "A mező kitöltése kötelező!.";
          isValid = false;
        }
        if (!this.constructionStartTime) {
          this.errors.constructionStartTime = "A mező kitöltése kötelező!.";
          isValid = false;
        }
        if (!this.constructionEndDate) {
          this.errors.constructionEndDate = "A mező kitöltése kötelező!.";
          isValid = false;
        }
        if (!this.constructionEndTime) {
          this.errors.constructionEndTime = "A mező kitöltése kötelező!.";
          isValid = false;
        }
        if (!this.subcontractors) {
          this.errors.subcontractors = "A mező kitöltése kötelező!.";
          isValid = false;
        }
      }

      // Áramigény mező ellenőrzése
      const powerSupplyField = this.yesNoFields.find((field) => field.id === "powerSupply");
      if (powerSupplyField && powerSupplyField.value === "igen" && !this.powerSupplyDetails) {
        this.errors.powerSupplyDetails = "A mező kitöltése kötelező!.";
        isValid = false;
      }

      return isValid;
    },
  },
  mounted() {
    // Az oldal betöltésekor automatikusan betölti az adatokat a localStorage-ból
    this.loadDataFromLocalStorage();
  },
};
</script>

<style src="/src/assets/css/style_pages.css"></style>
